import { z } from "zod";
import { guardRateLimit } from "@/lib/api-guard";
import { getAuthorizedStudentId } from "@/lib/server-auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { getWeekStart } from "@/lib/weekly-challenges";

const schema = z.object({
  weekStart: z.string().max(20),
  theme: z.string().max(120),
  careerFocus: z.string().max(80),
  tasksCompleted: z.array(z.string().max(40)).max(10),
  pointsEarned: z.number().int().min(0).max(1000),
});

export async function GET(req: Request) {
  const limited = guardRateLimit(req, 20);
  if (limited) return limited;

  const { searchParams } = new URL(req.url);
  const weekOffset = Number(searchParams.get("weekOffset") ?? "0");
  const weekStart = getWeekStart(new Date());
  weekStart.setDate(weekStart.getDate() - weekOffset * 7);

  const admin = createServiceRoleClient();
  if (!admin) {
    return Response.json({ entries: [] });
  }

  const weekStartIso = weekStart.toISOString().slice(0, 10);
  const { data: challenge } = await admin
    .from("weekly_challenges")
    .select("id")
    .eq("week_start", weekStartIso)
    .maybeSingle();

  if (!challenge?.id) {
    return Response.json({ entries: [] });
  }

  const { data } = await admin
    .from("challenge_completions")
    .select("points_earned, students(name, city)")
    .eq("challenge_id", challenge.id)
    .order("points_earned", { ascending: false })
    .limit(5);

  const entries = (data ?? []).map((item) => {
    const student = Array.isArray(item.students) ? item.students[0] : item.students;
    return {
      name: student?.name ?? "Student",
      city: student?.city ?? "Karnataka",
      points: item.points_earned ?? 0,
    };
  });

  return Response.json({ entries });
}

export async function POST(req: Request) {
  const limited = guardRateLimit(req, 20);
  if (limited) return limited;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const studentId = getAuthorizedStudentId(req, body);
  if (!studentId) {
    return Response.json({ ok: true, persisted: false });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const admin = createServiceRoleClient();
  if (!admin) {
    return Response.json({ ok: true, persisted: false });
  }

  const weekStartDate = parsed.data.weekStart;
  const { data: challenge } = await admin
    .from("weekly_challenges")
    .upsert(
      {
        week_start: weekStartDate,
        theme: parsed.data.theme,
        career_focus: parsed.data.careerFocus,
        tasks: parsed.data.tasksCompleted,
      },
      { onConflict: "week_start" },
    )
    .select("id")
    .single();

  if (!challenge?.id) {
    return Response.json({ ok: true, persisted: false });
  }

  await admin.from("challenge_completions").upsert(
    {
      challenge_id: challenge.id,
      student_id: studentId,
      tasks_completed: parsed.data.tasksCompleted,
      points_earned: parsed.data.pointsEarned,
      completed_at:
        parsed.data.tasksCompleted.length >= 3 ? new Date().toISOString() : null,
    },
    { onConflict: "challenge_id,student_id" },
  );

  return Response.json({ ok: true, persisted: true });
}
