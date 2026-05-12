import { createServiceRoleClient } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  if (!token) {
    return Response.json({ error: "missing_token" }, { status: 400 });
  }

  const admin = createServiceRoleClient();
  if (!admin) {
    return Response.json({ demo: true, token });
  }

  const { data: link, error: linkErr } = await admin
    .from("parent_links")
    .select("student_id, share_token")
    .eq("share_token", token)
    .maybeSingle();

  if (linkErr) {
    console.error("Supabase error:", linkErr);
    return Response.json({ error: "lookup_failed" }, { status: 500 });
  }

  if (!link?.student_id) {
    return Response.json({ error: "invalid_or_expired" }, { status: 404 });
  }

  const studentId = link.student_id as string;

  const [{ data: student, error: stErr }, { data: interests }, { data: games }, { data: maps }] =
    await Promise.all([
      admin.from("students").select("*").eq("id", studentId).maybeSingle(),
      admin
        .from("career_interests")
        .select("*")
        .eq("student_id", studentId)
        .order("interest_score", { ascending: false })
        .limit(10),
      admin
        .from("game_results")
        .select("*")
        .eq("student_id", studentId)
        .order("played_at", { ascending: false })
        .limit(6),
      admin
        .from("roadmaps")
        .select("*")
        .eq("student_id", studentId)
        .order("created_at", { ascending: false })
        .limit(3),
    ]);

  if (stErr) {
    console.error("Supabase error:", stErr);
  }

  return Response.json({
    demo: false,
    student,
    interests: interests ?? [],
    games: games ?? [],
    roadmaps: maps ?? [],
  });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { studentId?: string };
    if (!body.studentId) {
      return Response.json({ error: "studentId required" }, { status: 400 });
    }

    const admin = createServiceRoleClient();
    if (!admin) {
      return Response.json(
        { error: "Server not configured for parent links" },
        { status: 503 },
      );
    }

    const { data, error } = await admin
      .from("parent_links")
      .insert({ student_id: body.studentId })
      .select("share_token")
      .maybeSingle();

    if (error) {
      console.error("Supabase error:", error);
      return Response.json({ error: "Could not create share link" }, { status: 500 });
    }

    return Response.json({ token: data?.share_token });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Failed to create link" }, { status: 500 });
  }
}
