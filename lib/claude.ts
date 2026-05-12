import Anthropic from "@anthropic-ai/sdk";

export const CLAUDE_MODEL = "claude-sonnet-4-20250514";

export function getAnthropicClient() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return null;
  }
  return new Anthropic({ apiKey: key });
}

export function extractTextContent(
  content: Anthropic.Messages.ContentBlock[],
): string {
  const first = content[0];
  if (first && first.type === "text") {
    return first.text;
  }
  return "";
}
