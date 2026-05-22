import { createServiceRoleClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      event?: string;
      properties?: Record<string, unknown>;
      studentId?: string;
      timestamp?: string;
    };

    if (!body.event) {
      return Response.json({ error: "event required" }, { status: 400 });
    }

    const admin = createServiceRoleClient();
    if (admin) {
      await admin.from("analytics_events").insert({
        event: body.event,
        properties: body.properties ?? {},
        student_id: body.studentId ?? null,
      });
    }

    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: true });
  }
}
