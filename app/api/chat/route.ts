import { CAREERS } from "@/lib/careers";
import {
  askDeepSeek,
  detectEmotion,
  suggestCareerFromConversation,
  type EmotionLabel,
} from "@/lib/deepseek";
import { clientIp, rateLimit } from "@/lib/rate-limit";

function emotionGuidance(em: EmotionLabel): string {
  switch (em) {
    case "confused":
      return "The student seems confused. Use simpler words, short sentences, and one clear idea at a time.";
    case "excited":
      return "The student seems excited. Match their positive energy while staying grounded and practical.";
    case "anxious":
      return "The student seems anxious. Start with reassurance and encouragement before giving advice.";
    case "motivated":
      return "The student seems motivated. Offer concrete next steps and small wins they can act on this week.";
    case "bored":
      return "The student seems bored. Ask one engaging, specific question to spark curiosity.";
    case "curious":
      return "The student seems curious. Go a bit deeper with interesting detail, still concise.";
    default:
      return "";
  }
}

export async function POST(req: Request) {
  if (!process.env.DEEPSEEK_API_KEY) {
    return Response.json({ error: "API key not configured" }, { status: 500 });
  }

  if (!rateLimit(clientIp(req), 10, 60_000)) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body = (await req.json()) as {
      messages?: { role: "user" | "assistant"; content: string }[];
      language?: string;
      studentName?: string;
      city?: string;
      careersDiscussed?: string[];
    };
    const {
      messages = [],
      language = "en",
      studentName = "Student",
      city = "Karnataka",
      careersDiscussed = [],
    } = body;

    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    const emotionDetected: EmotionLabel = lastUser
      ? await detectEmotion(lastUser.content)
      : "neutral";

    const langLabel =
      language === "kn" ? "Kannada" : language === "hi" ? "Hindi" : "English";

    const careersLine =
      careersDiscussed.length > 0
        ? `Careers mentioned so far: ${careersDiscussed.join(", ")}.`
        : "No specific careers recorded yet from the client.";

    const toneBlock = emotionGuidance(emotionDetected);

    const systemPrompt = `You are CareerCompass, a warm and encouraging career guide for Karnataka students aged 14-18.
Student name: ${studentName}
City/region context: ${city}
Preferred language for ALL replies: ${langLabel}.
${careersLine}
${toneBlock ? `Tone guidance: ${toneBlock}` : ""}

Rules:
- ALWAYS respond in ${langLabel}.
- You see the full conversation history in the messages array — stay consistent with what was already said.
- Ask about interests, subjects, hobbies, and what kind of work excites them.
- When it fits naturally, mention Karnataka colleges, CET/NEET/JEE, or local opportunities.
- Keep each reply under 180 words, friendly and positive.
- If the student seems stuck, offer 1–2 gentle clarifying questions before dumping a long list.`;

    const userMessageCount = messages.filter((m) => m.role === "user").length;
    const allowedIds = CAREERS.map((c) => c.id);

    let suggestedCareer: string | null = null;
    if (userMessageCount > 0 && userMessageCount % 3 === 0) {
      suggestedCareer = await suggestCareerFromConversation(
        messages,
        allowedIds,
      );
    }

    try {
      const reply = await askDeepSeek(messages, systemPrompt);
      return Response.json({
        content: reply,
        suggestedCareer,
        emotionDetected,
      });
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
