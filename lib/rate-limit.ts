const rateLimits = new Map<string, { count: number; reset: number }>();

export function rateLimit(
  ip: string,
  limit = 10,
  windowMs = 60_000,
): boolean {
  const now = Date.now();
  const record = rateLimits.get(ip);

  if (!record || now > record.reset) {
    rateLimits.set(ip, { count: 1, reset: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count += 1;
  return true;
}

export function clientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}
