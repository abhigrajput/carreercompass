import { z } from "zod";
import { guardRateLimit } from "@/lib/api-guard";
import { getAuthorizedStudentId } from "@/lib/server-auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";

const createGroupSchema = z.object({
  name: z.string().min(3).max(120),
  careerFocus: z.string().min(1).max(80),
  city: z.enum(["Bengaluru", "Mysuru", "Hubballi"]),
  maxMembers: z.union([z.literal(5), z.literal(10), z.literal(20)]),
});

type GroupRow = {
  id: string;
  name: string;
  career_focus: string;
  city: string;
  creator_id: string | null;
  max_members: number;
  created_at: string;
  creator?: { name?: string } | { name?: string }[] | null;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");
  const admin = createServiceRoleClient();
  if (!admin) {
    return Response.json({ groups: [] });
  }

  const [{ data: groups }, { data: members }] = await Promise.all([
    admin
      .from("study_groups")
      .select("id, name, career_focus, city, creator_id, max_members, created_at, creator:students(name)")
      .order("created_at", { ascending: false }),
    admin.from("group_members").select("group_id, student_id"),
  ]);

  const counts = new Map<string, number>();
  const joinedByStudent = new Map<string, string[]>();

  for (const member of members ?? []) {
    counts.set(member.group_id, (counts.get(member.group_id) ?? 0) + 1);
    if (member.student_id) {
      const current = joinedByStudent.get(member.student_id) ?? [];
      joinedByStudent.set(member.student_id, [...current, member.group_id]);
    }
  }

  const normalized = ((groups ?? []) as GroupRow[]).map((group) => {
    const creator = Array.isArray(group.creator) ? group.creator[0] : group.creator;
    return {
      id: group.id,
      name: group.name,
      careerFocus: group.career_focus,
      city: group.city,
      maxMembers: group.max_members,
      creatorName: creator?.name ?? "Student",
      createdAt: group.created_at,
      memberCount: counts.get(group.id) ?? 0,
      joined: studentId
        ? (joinedByStudent.get(studentId) ?? []).includes(group.id)
        : false,
    };
  });

  return Response.json({ groups: normalized });
}

export async function POST(req: Request) {
  const limited = guardRateLimit(req, 20);
  if (limited) return limited;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const studentId = getAuthorizedStudentId(req, body);
  if (!studentId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = createGroupSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const admin = createServiceRoleClient();
  if (!admin) {
    return Response.json({ error: "Server unavailable" }, { status: 503 });
  }

  const { data, error } = await admin
    .from("study_groups")
    .insert({
      name: parsed.data.name,
      career_focus: parsed.data.careerFocus,
      city: parsed.data.city,
      creator_id: studentId,
      max_members: parsed.data.maxMembers,
    })
    .select("id, name, career_focus, city, creator_id, max_members, created_at")
    .single();

  if (error || !data) {
    return Response.json({ error: error?.message ?? "create_failed" }, { status: 500 });
  }

  await admin.from("group_members").insert({
    group_id: data.id,
    student_id: studentId,
  });

  return Response.json({
    group: {
      id: data.id,
      name: data.name,
      careerFocus: data.career_focus,
      city: data.city,
      maxMembers: data.max_members,
      createdAt: data.created_at,
      memberCount: 1,
    },
  });
}
