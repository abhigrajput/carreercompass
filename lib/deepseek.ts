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
