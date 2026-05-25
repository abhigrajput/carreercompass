import { guardRateLimit, parseBody } from "@/lib/api-guard";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { ContactSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const limited = guardRateLimit(req, 5);
  if (limited) return limited;

  const parsed = await parseBody(req, ContactSchema);
  if (parsed instanceof Response) return parsed;

  try {
    const { name, email, message, role, website } = parsed.data;
    if (website) {
      return Response.json({ ok: true, persisted: false });
    }

    const supabase = createServiceRoleClient();
    if (!supabase) {
      return Response.json({ ok: true, persisted: false });
    }

    const { error } = await supabase
      .from("contact_messages")
      .insert({ name, email, message, role });

    if (error) {
      console.error("Supabase error:", error);
      return Response.json(
        { ok: false, error: "Failed to save message" },
        { status: 500 },
      );
    }

    return Response.json({ ok: true, persisted: true });
  } catch (e) {
    console.error("Supabase error:", e);
    return Response.json(
      { ok: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
