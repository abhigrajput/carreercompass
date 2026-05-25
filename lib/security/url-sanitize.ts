export function sanitizeSlug(raw: string | null, maxLen = 100): string {
  if (!raw) return "";
  return raw.replace(/[^a-z0-9-_]/gi, "").slice(0, maxLen);
}

export function sanitizeToken(raw: string | null, maxLen = 100): string {
  if (!raw) return "";
  return raw.replace(/[^a-zA-Z0-9-_]/g, "").slice(0, maxLen);
}

export function clampScore(raw: string | null): number {
  const n = parseInt(raw ?? "0", 10);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

export function clampPage(raw: string | null): number {
  const n = parseInt(raw ?? "1", 10);
  if (Number.isNaN(n)) return 1;
  return Math.max(1, Math.min(100, n));
}
