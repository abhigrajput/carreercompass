import { CAREERS } from "@/lib/careers";
import { careerDisplayName } from "@/lib/career-utils";
import { extractTextContent, getAnthropicClient } from "@/lib/claude";
import type { LocaleCode } from "@/types";

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "API key not configured" }, { status: 500 });
  }

  try {
    const { careerId, language } = (await req.json()) as {
      careerId?: string;
      language?: LocaleCode;
    };

    const career = CAREERS.find((c) => c.id === careerId);
    if (!career) {
      return Response.json({ error: "Career not found" }, { status: 404 });
    }

    const client = getAnthropicClient();
    if (!client) {
      return Response.json({ error: "API key not configured" }, { status: 500 });
    }

    const lang = language ?? "en";
    const langLabel =
      lang === "kn" ? "Kannada" : lang === "hi" ? "Hindi" : "English";
    const label = careerDisplayName(career, lang);

    const prompt = `Write exactly three short paragraphs about the career "${label}" (${career.domain}) for a Karnataka teenager.
Language: ${langLabel}.
Paragraph 1: day‑to‑day work and who it suits.
Paragraph 2: entrance exams (${career.entranceExams.join(", ")}) and typical Karnataka pathways.
Paragraph 3: practical next 30‑day actions the student can take from home / school.
Avoid negativity; keep sentences simple and encouraging.`;

    try {
      const response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 700,
        messages: [{ role: "user", content: prompt }],
      });

      const text = extractTextContent(response.content);
      return Response.json({ content: text });
    } catch (apiErr) {
      console.error("Anthropic API error:", apiErr);
      const msg =
        apiErr instanceof Error ? apiErr.message : "AI request failed. Try again.";
      return Response.json(
        { error: `Could not generate career insight: ${msg}` },
        { status: 502 },
      );
    }
  } catch (e) {
    console.error(e);
    return Response.json(
      { error: "Suggestion failed. Please try again." },
      { status: 500 },
    );
  }
}
