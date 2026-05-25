import { guardRateLimit, parseBody } from "@/lib/api-guard";
import { clientIp } from "@/lib/rate-limit";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { PointsSchema } from "@/lib/validation";

const POINT_VALUES: Record<string, number> = {
  explore_career: 5,
  complete_game: 20,
  skill_game_correct: 10,
  chat_message: 3,
  generate_roadmap: 15,
  view_college: 5,
  share_parent: 25,
  daily_login: 10,
  complete_mission: 20,
  referral_signup: 50,
  streak_7_days: 100,
  streak_30_days: 500,
};

export async function POST(req: Request) {
  const limited = guardRateLimit(req, 60);
  if (limited) return limited;

  const parsed = await parseBody(req, PointsSchema);
  if (parsed instanceof Response) return parsed;

  try {
    const { studentId, action } = parsed.data;
    const add = POINT_VALUES[action] ?? 0;
    if (add <= 0) {
      return Response.json({ error: "unknown_action" }, { status: 400 });
    }

    const idempotencyKey = `${studentId}_${action}_${new Date().toISOString().slice(0, 10)}`;

    const admin = createServiceRoleClient();
    if (!admin) {
      return Response.json({
        newTotal: add,
        badgesAwarded: [] as string[],
        levelUp: false,
      });
    }

    const { data: existing } = await admin
      .from("analytics_events")
      .select("id")
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle();

    if (existing?.id) {
      const { data: st } = await admin
        .from("students")
        .select("points, badges")
        .eq("id", studentId)
        .maybeSingle();
      return Response.json({
        message: "Already awarded today",
        newTotal: (st?.points as number) ?? 0,
        badgesAwarded: [],
        levelUp: false,
      });
    }

    const { data: st } = await admin
      .from("students")
      .select("points, badges, name, city")
      .eq("id", studentId)
      .maybeSingle();

    const prev = (st?.points as number) ?? 0;
    const newTotal = prev + add;
    const prevLevel = Math.floor(prev / 500);
    const newLevel = Math.floor(newTotal / 500);
    const levelUp = newLevel > prevLevel;

    const badges = Array.isArray(st?.badges) ? [...(st.badges as string[])] : [];
    const badgesAwarded: string[] = [];

    if (newTotal >= 100 && !badges.includes("century_points")) {
      badges.push("century_points");
      badgesAwarded.push("century_points");
    }

    await admin
      .from("students")
      .update({ points: newTotal, badges })
      .eq("id", studentId);

    await admin.from("analytics_events").insert({
      event: "points_awarded",
      student_id: studentId,
      idempotency_key: idempotencyKey,
      properties: { action, points: add, ip: clientIp(req) },
    });

    try {
      const { data: lb } = await admin
        .from("leaderboard")
        .select("id")
        .eq("student_id", studentId)
        .maybeSingle();
      if (lb?.id) {
        await admin
          .from("leaderboard")
          .update({
            points: newTotal,
            updated_at: new Date().toISOString(),
          })
          .eq("id", lb.id);
      } else {
        await admin.from("leaderboard").insert({
          student_id: studentId,
          student_name: (st?.name as string) ?? "Student",
          city: (st?.city as string) ?? "bengaluru",
          points: newTotal,
        });
      }
    } catch {
      /* leaderboard optional */
    }

    console.log("SECURITY FIX: Points idempotency enforced for", action);
    return Response.json({ newTotal, badgesAwarded, levelUp });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "points_failed" }, { status: 500 });
  }
}
