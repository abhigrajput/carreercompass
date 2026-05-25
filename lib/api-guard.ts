import { clientIp, rateLimit } from "@/lib/rate-limit";
import { readJson } from "@/lib/validation";
import type { z } from "zod";

export { readJson };

export function guardRateLimit(
  req: Request,
  limit: number,
  windowMs = 60_000,
): Response | null {
  if (!rateLimit(clientIp(req), limit, windowMs)) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }
  return null;
}

export async function parseBody<T>(
  req: Request,
  schema: z.ZodType<T>,
): Promise<{ data: T } | Response> {
  const parsed = await readJson(req, schema);
  if (!parsed.ok) {
    return parsed.response;
  }
  return { data: parsed.data };
}
