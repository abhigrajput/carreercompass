import { createServiceRoleClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      schoolName?: string;
      contactName?: string;
      email?: string;
      phone?: string;
      city?: string;
      students?: string;
      plan?: string;
    };

    const admin = createServiceRoleClient();
    if (admin) {
      await admin.from("school_subscriptions").insert({
        school_name: body.schoolName ?? "School",
        contact_name: body.contactName ?? "",
        contact_email: body.email ?? "",
        contact_phone: body.phone ?? null,
        city: body.city ?? "Bengaluru",
        student_count: Number(body.students) || null,
        plan: body.plan ?? "pilot_request",
        status: "pilot_request",
      });
    }

    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "failed" }, { status: 500 });
  }
}
