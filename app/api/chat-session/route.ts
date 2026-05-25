import { guardRateLimit, parseBody } from "@/lib/api-guard";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { ChatSessionSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const limited = guardRateLimit(req, 20);
  if (limited) return limited;

  const parsed = await parseBody(req, ChatSessionSchema);
  if (parsed instanceof Response) return parsed;

  try {
    const body = parsed.data;

    const admin = createServiceRoleClient();
    if (!admin) {
      return Response.json({ ok: true, persisted: false });
    }

    const { error } = await admin.from("chat_sessions").insert({
      student_id: body.studentId ?? null,
      messages: body.messages ?? [],
      career_suggestions: [],
    });

    if (error) {
      console.error("Supabase error:", error);
      return Response.json(
        { ok: false, error: "Could not save chat session" },
        { status: 500 },
      );
    }

    return Response.json({ ok: true, persisted: true });
  } catch (e) {
    console.error(e);
    return Response.json({ ok: false, persisted: false }, { status: 500 });
  }
}
