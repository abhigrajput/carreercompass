import { extractJson } from "@/lib/ai-json";
import { guardRateLimit, parseBody } from "@/lib/api-guard";
import { CAREERS } from "@/lib/careers";
import { askDeepSeek } from "@/lib/deepseek";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { MockInterviewSchema } from "@/lib/validation";
import type { MockInterviewFeedback } from "@/types";

const FALLBACK_QUESTIONS = [
  "What first made you interested in this career?",
  "Which of your strengths would help you succeed in this field?",
  "Tell me about a situation where you solved a difficult problem.",
  "How would you handle pressure or failure while preparing for this path?",
  "Why should we choose you over other students for this opportunity?",
];

function fallbackQuestion(careerName: string, questionNumber: number): string {
  const base = FALLBACK_QUESTIONS[questionNumber - 1] ?? FALLBACK_QUESTIONS[0];
  return base.replace("this career", careerName).replace("this field", careerName);
}

function fallbackFeedback(answer: string): MockInterviewFeedback {
  const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;
  const score = Math.max(4, Math.min(10, Math.round(wordCount / 12) + 3));

  return {
    score,
    good:
      wordCount > 25
        ? "You gave enough detail to show genuine thought and motivation."
        : "Your answer is clear and direct, which is a good start.",
    improve:
      wordCount > 45
        ? "Tighten the structure: give one example, one learning, and one future action."
        : "Add one real example and explain the result to make your answer stronger.",
  };
}

export async function POST(req: Request) {
  const limited = guardRateLimit(req, 12);
  if (limited) return limited;

  const parsed = await parseBody(req, MockInterviewSchema);
  if (parsed instanceof Response) return parsed;

  const body = parsed.data;
  const langLabel =
    "language" in body && body.language === "kn"
      ? "Kannada"
      : "language" in body && body.language === "hi"
        ? "Hindi"
        : "English";

  if (body.action === "question") {
    const career =
      CAREERS.find((item) => item.id === body.careerId)?.name ?? body.careerName;

    if (!process.env.DEEPSEEK_API_KEY) {
      return Response.json({
        question: fallbackQuestion(career, body.questionNumber),
      });
    }

    const prompt = `You are interviewing a Class 11 student for ${career} admission or early-career fit.
Ask interview question #${body.questionNumber} of 5.
Previous answers:
${body.history.map((item, index) => `${index + 1}. Q: ${item.question}\nA: ${item.answer}`).join("\n") || "none"}

Make questions progressively harder.
For question 1: basic interest question.
For question 3: situation-based.
For question 5: a challenging "why should we choose you?" question.
Respond ONLY with the question in ${langLabel}.`;

    try {
      const question = (await askDeepSeek([{ role: "user", content: prompt }])).trim();
      return Response.json({
        question: question || fallbackQuestion(career, body.questionNumber),
      });
    } catch {
      return Response.json({
        question: fallbackQuestion(career, body.questionNumber),
      });
    }
  }

  if (body.action === "feedback") {
    if (!process.env.DEEPSEEK_API_KEY) {
      return Response.json({ feedback: fallbackFeedback(body.answer) });
    }

    const prompt = `Rate this interview answer 1-10 and give feedback in 2 short sentences.
Career: ${body.careerName}
Question: ${body.question}
Answer: ${body.answer}

Format:
{
  "score": 1,
  "good": "...",
  "improve": "..."
}

Respond ONLY as JSON in ${langLabel}.`;

    try {
      const raw = await askDeepSeek([{ role: "user", content: prompt }]);
      const feedback =
        extractJson<MockInterviewFeedback>(raw) ?? fallbackFeedback(body.answer);
      return Response.json({ feedback });
    } catch {
      return Response.json({ feedback: fallbackFeedback(body.answer) });
    }
  }

  const admin = createServiceRoleClient();
  const overallScore = Math.round(
    body.scores.reduce((sum, item) => sum + item, 0) / body.scores.length,
  );

  if (admin && body.studentId) {
    await admin.from("mock_interviews").insert({
      student_id: body.studentId,
      career_id: body.careerId,
      questions: body.questions,
      answers: body.answers,
      scores: body.scores,
      overall_score: overallScore,
    });
  }

  return Response.json({ ok: true, overallScore });
}
