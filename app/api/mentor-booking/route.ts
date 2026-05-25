import { guardRateLimit, parseBody } from "@/lib/api-guard";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { MentorBookingSchema } from "@/lib/validation";

function isUuid(s: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    s,
  );
}

export async function POST(req: Request) {
  const limited = guardRateLimit(req, 10);
  if (limited) return limited;

  const parsed = await parseBody(req, MentorBookingSchema);
  if (parsed instanceof Response) return parsed;

  try {
    const body = parsed.data;

    if (!isUuid(body.mentorId)) {
      return Response.json({ ok: true, demo: true });
    }

    const admin = createServiceRoleClient();
    if (!admin) {
      return Response.json({ ok: true, offline: true });
    }

    const { error } = await admin.from("mentor_bookings").insert({
      mentor_id: body.mentorId,
      student_id: body.studentId ?? null,
      student_name: body.studentName,
      student_email: body.studentEmail || null,
      preferred_date: body.preferredDate ?? null,
      message: body.message ?? null,
    });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "booking_failed" }, { status: 500 });
  }
}
