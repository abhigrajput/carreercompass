import crypto from "crypto";

const GAME_TOKENS = new Map<
  string,
  { startTime: number; domain: string }
>();

const MAX_DURATION_MS = 600_000;

export function createGameSession(domain: string): string {
  const token = crypto.randomUUID();
  GAME_TOKENS.set(token, { startTime: Date.now(), domain });
  return token;
}

export function consumeGameSession(
  token: string,
  expectedDomain?: string,
): { ok: true; domain: string } | { ok: false; reason: string } {
  const session = GAME_TOKENS.get(token);
  if (!session) {
    return { ok: false, reason: "Invalid game session" };
  }
  if (Date.now() - session.startTime > MAX_DURATION_MS) {
    GAME_TOKENS.delete(token);
    return { ok: false, reason: "Game session expired" };
  }
  if (expectedDomain && session.domain !== expectedDomain) {
    return { ok: false, reason: "Domain mismatch" };
  }
  GAME_TOKENS.delete(token);
  return { ok: true, domain: session.domain };
}

export function computeScore(correctAnswers: number, totalQuestions: number): number {
  if (totalQuestions < 1) return 0;
  const cappedCorrect = Math.min(correctAnswers, totalQuestions);
  return Math.round((cappedCorrect / totalQuestions) * 100);
}
