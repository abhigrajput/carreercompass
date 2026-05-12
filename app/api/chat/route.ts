import Anthropic from "@anthropic-ai/sdk";
import { extractTextContent, getAnthropicClient } from "@/lib/claude";

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "API key not configured" }, { status: 500 });
  }

  try {
    const body = (await req.json()) as {
      messages?: Anthropic.Messages.MessageParam[];
      language?: string;
      studentName?: string;
    };
    const { messages = [], language = "en", studentName = "Student" } = body;

    const client = getAnthropicClient();
    if (!client) {
      return Response.json({ error: "API key not configured" }, { status: 500 });
    }

    const langLabel =
      language === "kn" ? "Kannada" : language === "hi" ? "Hindi" : "English";

    const systemPrompt = `You are CareerCompass, a warm and encouraging career guide for Karnataka students aged 14-18.
You are speaking with ${studentName}.
ALWAYS respond in ${langLabel}.
Ask about their interests, hobbies, subjects they enjoy, and what kind of work excites them.
After 3-4 exchanges, suggest 3 specific career matches with clear reasons.
Always mention relevant Karnataka colleges and local opportunities.
Keep responses conversational, warm, and under 150 words.
Never be negative. Always find something positive to build on.`;

    try {
      const response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 500,
        system: systemPrompt,
        messages,
      });

      const text = extractTextContent(response.content);
      return Response.json({ content: text });
    } catch (apiErr) {
      console.error("Anthropic API error:", apiErr);
      const msg =
        apiErr instanceof Error ? apiErr.message : "AI request failed. Try again.";
      return Response.json(
        { error: `Career assistant is temporarily unavailable: ${msg}` },
        { status: 502 },
      );
    }
  } catch (e) {
    console.error(e);
    return Response.json(
      { error: "Could not process chat request. Please try again." },
      { status: 500 },
    );
  }
}
