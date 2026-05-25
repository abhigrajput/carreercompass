const BLOCKED_WORDS = [
  "spam",
  "scam",
  "hack",
  "porn",
  "xxx",
  "abuse",
  "hate",
  "kill",
  "terror",
];

export function containsProfanity(text: string): boolean {
  const lower = text.toLowerCase();
  return BLOCKED_WORDS.some((word) => lower.includes(word));
}
