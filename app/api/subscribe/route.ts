import { createServiceRoleClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      name?: string;
      email?: string;
      language?: string;
      source?: string;
    };

    if (!body.email?.includes("@")) {
      return Response.json({ error: "Invalid email" }, { status: 400 });
    }

    const admin = createServiceRoleClient();
    if (admin) {
      await admin.from("email_subscribers").upsert(
        {
          name: body.name ?? null,
          email: body.email.toLowerCase().trim(),
          language: body.language ?? "en",
          source: body.source ?? "landing_page",
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
