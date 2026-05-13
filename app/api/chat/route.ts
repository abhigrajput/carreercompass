import { askDeepSeek } from "@/lib/deepseek";

export async function POST(req: Request) {
  if (!process.env.DEEPSEEK_API_KEY) {
    return Response.json({ error: "API key not configured" }, { status: 500 });
  }

  try {
    const body = (await req.json()) as {
      messages?: { role: "user" | "assistant"; content: string }[];
      language?: string;
      studentName?: string;
    };
    const { messages = [], language = "en", studentName = "Student" } = body;

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
      const reply = await askDeepSeek(messages, systemPrompt);
      return Response.json({ content: reply });
    } catch (apiErr) {
      console.error("DeepSeek API error:", apiErr);
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
