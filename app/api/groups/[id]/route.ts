import { z } from "zod";
import { guardRateLimit } from "@/lib/api-guard";
import { getAuthorizedStudentId } from "@/lib/server-auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";

const paramsSchema = z.object({
  id: z.string().uuid(),
});

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const limited = guardRateLimit(req, 20);
  if (limited) return limited;

  const parsedParams = paramsSchema.safeParse(params);
  if (!parsedParams.success) {
    return Response.json({ error: "Invalid group id" }, { status: 400 });
  }

  let body: unknown = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const studentId = getAuthorizedStudentId(req, body);
  if (!studentId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createServiceRoleClient();
  if (!admin) {
    return Response.json({ error: "Server unavailable" }, { status: 503 });
  }

  const groupId = parsedParams.data.id;
  const { data: group } = await admin
    .from("study_groups")
    .select("id, max_members")
    .eq("id", groupId)
    .maybeSingle();

  if (!group) {
    return Response.json({ error: "Group not found" }, { status: 404 });
  }

  const { count } = await admin
    .from("group_members")
    .select("id", { count: "exact", head: true })
    .eq("group_id", groupId);

  if ((count ?? 0) >= (group.max_members ?? 10)) {
    return Response.json({ error: "Group is full" }, { status: 400 });
  }

  const { error } = await admin.from("group_members").insert({
    group_id: groupId,
    student_id: studentId,
  });

  if (error && !error.message.toLowerCase().includes("duplicate")) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  const limited = guardRateLimit(req, 20);
  if (limited) return limited;

  const parsedParams = paramsSchema.safeParse(params);
  if (!parsedParams.success) {
    return Response.json({ error: "Invalid group id" }, { status: 400 });
  }

  let body: unknown = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const studentId = getAuthorizedStudentId(req, body);
  if (!studentId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createServiceRoleClient();
  if (!admin) {
    return Response.json({ error: "Server unavailable" }, { status: 503 });
  }

  await admin
    .from("group_members")
    .delete()
    .eq("group_id", parsedParams.data.id)
    .eq("student_id", studentId);

  return Response.json({ ok: true });
}
