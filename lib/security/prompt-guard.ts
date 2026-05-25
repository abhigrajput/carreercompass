const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior)\s+instructions/i,
  /disregard\s+(all\s+)?(previous|prior)/i,
  /you\s+are\s+now\s+/i,
  /system\s*:\s*/i,
  /<\s*script/i,
  /javascript\s*:/i,
  /reveal\s+(your\s+)?(system|api)\s+key/i,
  /DAN\s+mode/i,
];

export function sanitizeUserText(input: string, maxLen = 2000): string {
  let text = input.slice(0, maxLen);
  text = text.replace(/<[^>]*>/g, "");
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      text = text.replace(pattern, "[removed]");
    }
  }
  return text.trim();
}

export function sanitizeMessages(
  messages: { role: "user" | "assistant"; content: string }[],
): { role: "user" | "assistant"; content: string }[] {
  return messages.map((m) => ({
    role: m.role,
    content:
      m.role === "user" ? sanitizeUserText(m.content, 1000) : m.content.slice(0, 2000),
  }));
}
