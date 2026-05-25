import { z } from "zod";
import { isAdminRequest } from "@/lib/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";

const blockSchema = z.object({
  ipAddress: z.string().min(3).max(120),
  reason: z.string().max(200).optional(),
});

function getIpKey(properties: unknown) {
  const record =
    properties && typeof properties === "object"
      ? (properties as Record<string, unknown>)
      : {};
  return (
    String(
      record.ip_address ??
        record.ip ??
        record.fingerprint ??
        record.deviceFingerprint ??
        "unknown",
    ) || "unknown"
  );
}

export async function GET(req: Request) {
  if (!isAdminRequest(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createServiceRoleClient();
  if (!admin) {
    return Response.json({
      recentErrors: [],
      rateLimitHits: 0,
      topIps: [],
      blockedIps: [],
    });
  }

  const [{ data: errors }, { data: analytics }, { data: blockedIps }] =
    await Promise.all([
      admin
        .from("error_logs")
        .select("id, error, url, created_at")
        .order("created_at", { ascending: false })
        .limit(20),
      admin
        .from("analytics_events")
        .select("event, properties, created_at")
        .order("created_at", { ascending: false })
        .limit(200),
      admin
        .from("ip_blocklist")
        .select("id, ip_address, reason, blocked_at")
        .order("blocked_at", { ascending: false }),
    ]);

  const rateLimitEvents = (analytics ?? []).filter(
    (item) => item.event === "rate_limit",
  );

  const counts = new Map<string, number>();
  for (const item of analytics ?? []) {
    const key = getIpKey(item.properties);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const topIps = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([ipAddress, count]) => ({ ipAddress, count }));

  return Response.json({
    recentErrors: (errors ?? []).map((item) => ({
      id: item.id,
      error: item.error,
      url: item.url,
      createdAt: item.created_at,
    })),
    rateLimitHits: rateLimitEvents.length,
    topIps,
    blockedIps: (blockedIps ?? []).map((item) => ({
      id: item.id,
      ipAddress: item.ip_address,
      reason: item.reason ?? "",
      blockedAt: item.blocked_at,
    })),
  });
}

export async function POST(req: Request) {
  if (!isAdminRequest(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = blockSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Validation failed" }, { status: 400 });
  }

  const admin = createServiceRoleClient();
  if (!admin) {
    return Response.json({ error: "Server unavailable" }, { status: 503 });
  }

  await admin.from("ip_blocklist").upsert({
    ip_address: parsed.data.ipAddress,
    reason: parsed.data.reason ?? "Manual admin block",
  });

  return Response.json({ ok: true });
}

export async function DELETE(req: Request) {
  if (!isAdminRequest(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = blockSchema.pick({ ipAddress: true }).safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Validation failed" }, { status: 400 });
  }

  const admin = createServiceRoleClient();
  if (!admin) {
    return Response.json({ error: "Server unavailable" }, { status: 503 });
  }

  await admin.from("ip_blocklist").delete().eq("ip_address", parsed.data.ipAddress);
  return Response.json({ ok: true });
}
