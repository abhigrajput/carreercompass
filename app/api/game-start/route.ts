import { guardRateLimit, parseBody } from "@/lib/api-guard";
import { createGameSession } from "@/lib/security/game-sessions";
import { GameStartSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const limited = guardRateLimit(req, 30);
  if (limited) return limited;

  const parsed = await parseBody(req, GameStartSchema);
  if (parsed instanceof Response) return parsed;

  const { domain } = parsed.data;
  const gameToken = createGameSession(domain);
  console.log("SECURITY FIX: Game session token issued for domain", domain);

  return Response.json({ gameToken, startTime: Date.now() });
}
