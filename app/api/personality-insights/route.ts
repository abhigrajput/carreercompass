import { extractJson } from "@/lib/ai-json";
import { guardRateLimit, parseBody } from "@/lib/api-guard";
import { askDeepSeek } from "@/lib/deepseek";
import { PersonalityInsightsSchema } from "@/lib/validation";
import type { HollandScoreMap, PersonalityInsights } from "@/types";

function topCodes(scores: HollandScoreMap): string[] {
  return (Object.entries(scores) as [keyof HollandScoreMap, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([code]) => code);
}

function fallbackInsights(scores: HollandScoreMap): PersonalityInsights {
  const [first, second] = topCodes(scores);
  const combo = `${first}${second}`;

  return {
    strengths: [
      `You naturally lean toward ${first}-style work and stay engaged when tasks feel meaningful.`,
      `Your ${combo} mix suggests you can combine curiosity with follow-through better than most students.`,
      "You learn fastest when examples feel practical, local, and clearly connected to your future.",
    ],
    weaknesses: [
      "You may overthink big career choices and delay action when too many options appear at once.",
      "You can lose momentum if your study plan feels generic or disconnected from real outcomes.",
    ],
    idealEnvironment:
      "A structured but encouraging environment works best for you: clear goals, supportive mentors, real-world examples, and time to think before deciding.",
    roleModels: [
      "Sudha Murty",
      "Dr. Devi Shetty",
      "Narayana Murthy",
    ],
    careersToAvoid: [
      "Careers that are highly repetitive with little growth or creativity may feel draining.",
      "Paths chosen only due to pressure, without matching your interests, are likely to reduce motivation.",
    ],
    studyStyle:
      "Use short focused sessions, concept maps, and one practical task after every study block. Reflection plus repetition will suit you better than passive reading alone.",
  };
}

export async function POST(req: Request) {
  const limited = guardRateLimit(req, 8);
  if (limited) return limited;

  const parsed = await parseBody(req, PersonalityInsightsSchema);
  if (parsed instanceof Response) return parsed;

  const { personalityType, hollandScores, language } = parsed.data;
  const langLabel =
    language === "kn" ? "Kannada" : language === "hi" ? "Hindi" : "English";

  if (!process.env.DEEPSEEK_API_KEY) {
    return Response.json({ insights: fallbackInsights(hollandScores) });
  }

  const prompt = `A student got personality type ${personalityType} with Holland codes R:${hollandScores.R}, I:${hollandScores.I}, A:${hollandScores.A}, S:${hollandScores.S}, E:${hollandScores.E}, C:${hollandScores.C}.
Generate a detailed personality profile with:
1. Core strengths (3 bullet points)
2. Hidden weaknesses to work on (2 bullet points)
3. Ideal work environment description
4. Famous Karnataka or Indian professionals with a similar type
5. Careers to avoid and why
6. Best study style for this personality

Respond in ${langLabel}. Be specific, practical, and encouraging.
Reply ONLY as JSON with this shape:
{
  "strengths": ["","",""],
  "weaknesses": ["",""],
  "idealEnvironment": "",
  "roleModels": ["","",""],
  "careersToAvoid": ["",""],
  "studyStyle": ""
}`;

  try {
    const raw = await askDeepSeek([{ role: "user", content: prompt }]);
    const extracted = extractJson<PersonalityInsights>(raw);
    const insights = extracted ?? fallbackInsights(hollandScores);
    return Response.json({ insights });
  } catch {
    return Response.json({ insights: fallbackInsights(hollandScores) });
  }
}
