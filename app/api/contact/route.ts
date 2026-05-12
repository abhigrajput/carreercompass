import { createServiceRoleClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const { name, email, message, role } = (await req.json()) as {
      name: string;
      email: string;
      message: string;
      role: string;
    };

    if (!name || !email || !message) {
      return Response.json(
        { ok: false, error: "Missing required fields" },
        { status: 400 },
      );
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
