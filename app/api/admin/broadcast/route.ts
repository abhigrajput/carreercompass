import { z } from "zod";
import { isAdminRequest } from "@/lib/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";

const schema = z.object({
  message: z.string().min(1).max(200),
  target: z.enum(["all", "bengaluru", "mysuru", "hubballi", "pro"]),
});

async function audienceCounts() {
  const admin = createServiceRoleClient();
  if (!admin) {
    return { all: 0, bengaluru: 0, mysuru: 0, hubballi: 0, pro: 0 };
  }

  const [
    { count: all },
    { count: bengaluru },
    { count: mysuru },
    { count: hubballi },
    { count: pro },
  ] = await Promise.all([
    admin.from("students").select("id", { count: "exact", head: true }),
    admin
      .from("students")
      .select("id", { count: "exact", head: true })
      .ilike("city", "%Bengaluru%"),
    admin
      .from("students")
      .select("id", { count: "exact", head: true })
      .ilike("city", "%Mysuru%"),
    admin
      .from("students")
      .select("id", { count: "exact", head: true })
      .ilike("city", "%Hubballi%"),
    admin
      .from("students")
      .select("id", { count: "exact", head: true })
      .eq("is_pro", true),
  ]);

  return {
    all: all ?? 0,
    bengaluru: bengaluru ?? 0,
    mysuru: mysuru ?? 0,
    hubballi: hubballi ?? 0,
    pro: pro ?? 0,
  };
}

export async function GET(req: Request) {
  if (!isAdminRequest(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createServiceRoleClient();
  if (!admin) {
    return Response.json({
      history: [],
      audienceCounts: await audienceCounts(),
    });
  }

  const { data } = await admin
    .from("notifications")
    .select("type, message, created_at")
    .like("type", "broadcast:%")
    .order("created_at", { ascending: false })
    .limit(50);

  const deduped: { type: string; message: string; createdAt: string }[] = [];
  const seen = new Set<string>();
  for (const item of data ?? []) {
    const key = `${item.type}|${item.message}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push({
      type: item.type,
      message: item.message,
      createdAt: item.created_at,
    });
    if (deduped.length >= 5) break;
  }

  return Response.json({
    history: deduped,
    audienceCounts: await audienceCounts(),
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

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Validation failed" }, { status: 400 });
  }

  const admin = createServiceRoleClient();
  if (!admin) {
    return Response.json({ error: "Server unavailable" }, { status: 503 });
  }

  let query = admin.from("students").select("id");
  if (parsed.data.target === "bengaluru") {
    query = query.ilike("city", "%Bengaluru%");
  }
  if (parsed.data.target === "mysuru") {
    query = query.ilike("city", "%Mysuru%");
  }
  if (parsed.data.target === "hubballi") {
    query = query.ilike("city", "%Hubballi%");
  }
  if (parsed.data.target === "pro") {
    query = query.eq("is_pro", true);
  }

  const { data: students } = await query;
  const rows =
    students?.map((student) => ({
      student_id: student.id,
      type: `broadcast:${parsed.data.target}`,
      message: parsed.data.message,
    })) ?? [];

  if (rows.length > 0) {
    await admin.from("notifications").insert(rows);
  }

  return Response.json({ ok: true, sent: rows.length });
}
