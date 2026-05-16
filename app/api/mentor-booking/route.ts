import { createServiceRoleClient } from "@/lib/supabase/admin";

function isUuid(s: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    s,
  );
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      mentorId: string;
      studentId?: string | null;
      studentName: string;
      studentEmail?: string;
      preferredDate?: string;
      message?: string;
    };

    if (!body.mentorId || !body.studentName.trim()) {
      return Response.json({ error: "missing_fields" }, { status: 400 });
    }

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
      student_email: body.studentEmail ?? null,
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
