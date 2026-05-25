import { guardRateLimit, parseBody } from "@/lib/api-guard";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { AnalyticsSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const limited = guardRateLimit(req, 60);
  if (limited) return limited;

  const parsed = await parseBody(req, AnalyticsSchema);
  if (parsed instanceof Response) return parsed;

  try {
    const body = parsed.data;

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
