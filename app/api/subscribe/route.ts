import { guardRateLimit, parseBody } from "@/lib/api-guard";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { SubscribeSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const limited = guardRateLimit(req, 10);
  if (limited) return limited;

  const parsed = await parseBody(req, SubscribeSchema);
  if (parsed instanceof Response) return parsed;

  try {
    const { name, email, language, source, website } = parsed.data;
    if (website) {
      return Response.json({ ok: true });
    }

    const admin = createServiceRoleClient();
    if (admin) {
      await admin.from("email_subscribers").upsert(
        {
          name: name ?? null,
          email: email.toLowerCase().trim(),
          language,
          source: source ?? "landing_page",
          subscribed: true,
        },
        { onConflict: "email" },
      );
    }

    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "subscribe_failed" }, { status: 500 });
  }
}
