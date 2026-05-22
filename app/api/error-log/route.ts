import { createServiceRoleClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      error?: string;
      url?: string;
      userAgent?: string;
    };

    const admin = createServiceRoleClient();
    if (admin) {
      await admin.from("error_logs").insert({
        error: body.error ?? "Unknown",
        url: body.url ?? null,
        user_agent: body.userAgent ?? null,
      });
    }

    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: true });
  }
}
