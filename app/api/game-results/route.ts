import { createServiceRoleClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      studentId?: string | null;
      studentName?: string;
      careerDomain: string;
      score: number;
      totalQuestions: number;
      correctAnswers: number;
    };

    const admin = createServiceRoleClient();
    if (!admin) {
      return Response.json({ ok: true, persisted: false });
    }

    const { error } = await admin.from("game_results").insert({
      student_id: body.studentId ?? null,
      career_domain: body.careerDomain,
      score: body.score,
      total_questions: body.totalQuestions,
      correct_answers: body.correctAnswers,
    });

    if (error) {
      console.error("Supabase error:", error);
      return Response.json(
        { ok: false, error: "Could not save game result" },
        { status: 500 },
      );
    }

    return Response.json({ ok: true, persisted: true });
  } catch (e) {
    console.error(e);
    return Response.json({ ok: false, persisted: false }, { status: 500 });
  }
}
