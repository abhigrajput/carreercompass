import { createServiceRoleClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      messages?: unknown;
      studentName?: string;
      language?: string;
      studentId?: string | null;
    };

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
