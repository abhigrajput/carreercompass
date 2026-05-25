import { z } from "zod";
import { extractJson } from "@/lib/ai-json";
import { guardRateLimit } from "@/lib/api-guard";
import { CAREERS } from "@/lib/careers";
import { CAREER_COMPARE_DATA } from "@/lib/career-compare-data";
import { askDeepSeek } from "@/lib/deepseek";
import type { HollandScoreMap } from "@/types";

const schema = z.object({
  careerIds: z.array(z.string().max(80)).min(2).max(3),
  language: z.enum(["en", "kn", "hi"]).optional(),
  hollandScores: z
    .object({
      R: z.number(),
      I: z.number(),
      A: z.number(),
      S: z.number(),
      E: z.number(),
      C: z.number(),
    })
    .optional()
    .nullable(),
});

function localBestMatch(careerIds: string[], hollandScores?: HollandScoreMap | null) {
  const ranked = careerIds
    .map((id) => {
      const compare = CAREER_COMPARE_DATA[id as keyof typeof CAREER_COMPARE_DATA];
      if (!compare || !hollandScores) return { id, score: 70 };
      const total =
        hollandScores.R * compare.fitWeights.R +
        hollandScores.I * compare.fitWeights.I +
        hollandScores.A * compare.fitWeights.A +
        hollandScores.S * compare.fitWeights.S +
        hollandScores.E * compare.fitWeights.E +
        hollandScores.C * compare.fitWeights.C;
      return { id, score: Math.round(total / 120) };
    })
    .sort((a, b) => b.score - a.score);

  const best = ranked[0];
  const career = CAREERS.find((item) => item.id === best.id);
  return {
    summary: `${career?.name ?? best.id} looks strongest for your current profile because it balances fit, career stability, and the kind of exam path you can realistically prepare for next.`,
    bestMatchCareerId: best.id,
    reasons: [
      "It aligns well with your current strengths and likely study preferences.",
      "The pathway is clear enough to turn into a concrete roadmap from today.",
      "It offers a strong Karnataka-specific opportunity pipeline.",
    ],
  };
}

export async function POST(req: Request) {
  const limited = guardRateLimit(req, 6);
  if (limited) return limited;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { careerIds, language, hollandScores } = parsed.data;
  const careers = CAREERS.filter((career) => careerIds.includes(career.id));
  const langLabel =
    language === "kn" ? "Kannada" : language === "hi" ? "Hindi" : "English";

  if (!process.env.DEEPSEEK_API_KEY) {
    return Response.json(localBestMatch(careerIds, hollandScores));
  }

  const prompt = `Compare these careers for a Karnataka student:
${careers.map((career) => `- ${career.name} (${career.avgSalary}, exams: ${career.entranceExams.join(", ")})`).join("\n")}

Student Holland profile:
${hollandScores ? JSON.stringify(hollandScores) : "unknown"}

Respond in ${langLabel} with JSON only:
{
  "summary": "",
  "bestMatchCareerId": "",
  "reasons": ["", "", ""]
}`;

  try {
    const raw = await askDeepSeek([{ role: "user", content: prompt }]);
    const extracted = extractJson<{
      summary: string;
      bestMatchCareerId: string;
      reasons: string[];
    }>(raw);

    if (
      extracted?.summary &&
      extracted.bestMatchCareerId &&
      Array.isArray(extracted.reasons)
    ) {
      return Response.json(extracted);
    }
  } catch {
    /* fallback */
  }

  return Response.json(localBestMatch(careerIds, hollandScores));
}
