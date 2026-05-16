import { createServiceRoleClient } from "@/lib/supabase/admin";

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
  try {
    const body = (await req.json()) as {
      studentId?: string;
      action?: string;
      points?: number;
    };
    const { studentId, action } = body;
    const override = body.points;
    if (!studentId || !action) {
      return Response.json({ error: "studentId and action required" }, { status: 400 });
    }

    const add =
      typeof override === "number" && override > 0
        ? override
        : POINT_VALUES[action] ?? 0;
    if (add <= 0) {
      return Response.json({ error: "unknown_action" }, { status: 400 });
    }

    const admin = createServiceRoleClient();
    if (!admin) {
      return Response.json({
        newTotal: add,
        badgesAwarded: [] as string[],
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
      /* */
    }

    return Response.json({ newTotal, badgesAwarded, levelUp });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "points_failed" }, { status: 500 });
  }
}
