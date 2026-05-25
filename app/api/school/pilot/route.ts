import { guardRateLimit, parseBody } from "@/lib/api-guard";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { SchoolPilotSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const limited = guardRateLimit(req, 5);
  if (limited) return limited;

  const parsed = await parseBody(req, SchoolPilotSchema);
  if (parsed instanceof Response) return parsed;

  try {
    const body = parsed.data;

    const admin = createServiceRoleClient();
    if (admin) {
      await admin.from("school_subscriptions").insert({
        school_name: body.schoolName,
        contact_name: body.contactName,
        contact_email: body.email,
        contact_phone: body.phone ?? null,
        city: body.city,
        student_count: Number(body.students) || null,
        plan: body.plan ?? "pilot_request",
        status: "pilot_request",
      });
    }

    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "pilot_failed" }, { status: 500 });
  }
}
