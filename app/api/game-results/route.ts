import { guardRateLimit } from "@/lib/api-guard";
import {
  computeScore,
  consumeGameSession,
} from "@/lib/security/game-sessions";
import { getAuthorizedStudentId } from "@/lib/server-auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { GameResultLegacySchema, GameResultSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const limited = guardRateLimit(req, 30);
  if (limited) return limited;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const authorizedStudentId = getAuthorizedStudentId(req, body);
  if (!authorizedStudentId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const withToken = GameResultSchema.safeParse(body);
  const legacy = GameResultLegacySchema.safeParse(body);

  if (!withToken.success && !legacy.success) {
    return Response.json(
      {
        error: "Validation failed",
        details: withToken.error?.flatten() ?? legacy.error?.flatten(),
      },
      { status: 400 },
    );
  }

  let careerDomain: string;
  let score: number;
  let totalQuestions: number;
  let correctAnswers: number;
  let studentId: string | null | undefined;
  let studentName: string | undefined;

  if (withToken.success) {
    const data = withToken.data;
    const session = consumeGameSession(data.gameToken, data.careerDomain);
    if (!session.ok) {
      return Response.json({ error: session.reason }, { status: 400 });
    }
    careerDomain = data.careerDomain;
    totalQuestions = data.totalQuestions;
    correctAnswers = Math.min(data.correctAnswers, totalQuestions);
    score = computeScore(correctAnswers, totalQuestions);
    studentId = authorizedStudentId;
    studentName = data.studentName;
    console.log("SECURITY FIX: Game score computed server-side from session token");
  } else if (legacy.success) {
    const data = legacy.data;
    if (!data.totalQuestions || data.correctAnswers === undefined) {
      return Response.json(
        { error: "gameToken required — start game via /api/game-start" },
        { status: 400 },
      );
    }
    careerDomain = data.careerDomain;
    totalQuestions = data.totalQuestions;
    correctAnswers = Math.min(data.correctAnswers, totalQuestions);
    score = computeScore(correctAnswers, totalQuestions);
    studentId = authorizedStudentId;
    studentName = data.studentName;
  } else {
    return Response.json({ error: "Validation failed" }, { status: 400 });
  }

  const admin = createServiceRoleClient();
  if (!admin) {
    return Response.json({ ok: true, persisted: false, score });
  }

  const { error } = await admin.from("game_results").insert({
    student_id: studentId ?? null,
    career_domain: careerDomain,
    score,
    total_questions: totalQuestions,
    correct_answers: correctAnswers,
  });

  if (error) {
    console.error("Supabase error:", error);
    return Response.json(
      { ok: false, error: "Could not save game result" },
      { status: 500 },
    );
  }

  return Response.json({ ok: true, persisted: true, score, studentName });
}
