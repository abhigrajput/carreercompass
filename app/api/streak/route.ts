import { createServiceRoleClient } from "@/lib/supabase/admin";

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayUTC(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

export async function POST(req: Request) {
  try {
    const { studentId } = (await req.json()) as { studentId?: string };
    if (!studentId) {
      return Response.json({ error: "studentId required" }, { status: 400 });
    }

    const admin = createServiceRoleClient();
    if (!admin) {
      return Response.json({
        streakDays: 1,
        isNewRecord: false,
        badgeAwarded: null as string | null,
      });
    }

    const { data: row, error } = await admin
      .from("students")
      .select("id, streak_days, last_active, badges")
      .eq("id", studentId)
      .maybeSingle();

    if (error || !row) {
      return Response.json({
        streakDays: 1,
        isNewRecord: false,
        badgeAwarded: null as string | null,
      });
    }

    const today = todayUTC();
    const last = row.last_active as string | null;
    let streak = (row.streak_days as number) ?? 0;
    let badgeAwarded: string | null = null;

    if (!last) {
      streak = 1;
    } else if (last === today) {
      /* no change */
    } else if (last === yesterdayUTC()) {
      streak += 1;
    } else {
      streak = 1;
    }

    const badges = Array.isArray(row.badges) ? [...(row.badges as string[])] : [];
    if (streak === 7 && !badges.includes("streak_7")) {
      badges.push("streak_7");
      badgeAwarded = "streak_7";
    }
    if (streak === 30 && !badges.includes("streak_30")) {
      badges.push("streak_30");
      badgeAwarded = "streak_30";
    }
    if (streak === 100 && !badges.includes("streak_100")) {
      badges.push("streak_100");
      badgeAwarded = "streak_100";
    }

    const prevBest = (row.streak_days as number) ?? 0;
    const isNewRecord = streak > prevBest;

    await admin
      .from("students")
      .update({
        streak_days: streak,
        last_active: today,
        badges,
      })
      .eq("id", studentId);

    return Response.json({ streakDays: streak, isNewRecord, badgeAwarded });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "streak_failed" }, { status: 500 });
  }
}
