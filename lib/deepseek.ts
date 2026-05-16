import OpenAI from "openai";

let _client: OpenAI | null = null;

function getClient(): OpenAI | null {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!_client) {
    _client = new OpenAI({
      baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
      apiKey,
    });
  }
  return _client;
}

export async function askDeepSeek(
  messages: { role: "user" | "assistant" | "system"; content: string }[],
  systemPrompt?: string,
): Promise<string> {
  const client = getClient();
  if (!client) {
    throw new Error("DEEPSEEK_API_KEY is not configured");
  }

  const allMessages: { role: "user" | "assistant" | "system"; content: string }[] =
    systemPrompt
      ? [{ role: "system", content: systemPrompt }, ...messages]
      : messages;

  const response = await client.chat.completions.create({
    model: "deepseek-chat",
    messages: allMessages,
    max_tokens: 1000,
  });

  return response.choices[0]?.message?.content ?? "";
}

const EMOTIONS = [
  "confused",
  "excited",
  "anxious",
  "motivated",
  "bored",
  "curious",
] as const;

export type EmotionLabel = (typeof EMOTIONS)[number] | "neutral";

export async function detectEmotion(message: string): Promise<EmotionLabel> {
  const client = getClient();
  if (!client || !message.trim()) {
    return "neutral";
  }
  const raw = (
    await client.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "user",
          content: `Classify the emotional tone of this student message in one word:
confused | excited | anxious | motivated | bored | curious
Message: ${message.slice(0, 800)}
Respond with only the single word, lowercase, no punctuation.`,
        },
      ],
      max_tokens: 16,
      temperature: 0,
    })
  ).choices[0]?.message?.content
    ?.trim()
    .toLowerCase()
    .replace(/[^a-z]/g, "");

  if (raw && (EMOTIONS as readonly string[]).includes(raw)) {
    return raw as (typeof EMOTIONS)[number];
  }
  return "neutral";
}

/** After every N user messages, suggest one career id from the allowed list. */
export async function suggestCareerFromConversation(
  messages: { role: "user" | "assistant"; content: string }[],
  allowedIds: string[],
): Promise<string | null> {
  const client = getClient();
  if (!client || allowedIds.length === 0) {
    return null;
  }
  const transcript = messages
    .slice(-12)
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n")
    .slice(0, 4000);

  const raw = (
    await client.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "user",
          content: `Based on this student conversation, pick exactly ONE best-matching career id from this list only:
${allowedIds.join(", ")}

Conversation:
${transcript}

Reply with JSON only: {"id":"<one id from list>"} or {"id":""} if unsure.`,
        },
      ],
      max_tokens: 64,
      temperature: 0.2,
    })
  ).choices[0]?.message?.content?.trim();

  if (!raw) return null;
  try {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    const slice = start >= 0 && end >= start ? raw.slice(start, end + 1) : raw;
    const parsed = JSON.parse(slice) as { id?: string };
    const id = parsed.id?.trim();
    if (id && allowedIds.includes(id)) return id;
  } catch {
    /* ignore */
  }
  return null;
}
