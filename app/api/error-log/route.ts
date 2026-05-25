import { guardRateLimit, parseBody } from "@/lib/api-guard";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { ErrorLogSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const limited = guardRateLimit(req, 30);
  if (limited) return limited;

  const parsed = await parseBody(req, ErrorLogSchema);
  if (parsed instanceof Response) return parsed;

  try {
    const body = parsed.data;

    const admin = createServiceRoleClient();
    if (admin) {
      await admin.from("error_logs").insert({
        error: body.error,
        url: body.url ?? null,
        user_agent: body.userAgent ?? null,
      });
    }

    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: true });
  }
}
