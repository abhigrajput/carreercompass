import { guardRateLimit } from "@/lib/api-guard";
import { getAuthorizedStudentId } from "@/lib/server-auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { StudySessionSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const limited = guardRateLimit(req, 20);
  if (limited) return limited;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = StudySessionSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const studentId = getAuthorizedStudentId(req, body);
  if (!studentId) {
    return Response.json({ ok: true, persisted: false });
  }

  const admin = createServiceRoleClient();
  if (!admin) {
    return Response.json({ ok: true, persisted: false });
  }

  const sessionDate =
    parsed.data.sessionDate ?? new Date().toISOString().slice(0, 10);

  const { error } = await admin.from("study_sessions").insert({
    student_id: studentId,
    subject: parsed.data.subject,
    duration_minutes: parsed.data.durationMinutes,
    session_date: sessionDate,
  });

  if (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true, persisted: true });
}
