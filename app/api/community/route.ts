import { createServiceRoleClient } from "@/lib/supabase/admin";

const SEED = [
  {
    id: "seed-1",
    student_name: "Ananya",
    student_city: "Bengaluru",
    content:
      "Just scored S-rank on the Engineering game! The Bengaluru floods question was tough but I got it right. Anyone else preparing for CET?",
    post_type: "Achievement",
    career_tag: "engineering",
    likes: 12,
    created_at: new Date(Date.now() - 120000).toISOString(),
  },
  {
    id: "seed-2",
    student_name: "Ravi",
    student_city: "Hubballi",
    content:
      "I got 'Analytical Healer' in the career game but my parents want me to do engineering. How do I convince them?",
    post_type: "Question",
    career_tag: "medicine",
    likes: 8,
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "seed-3",
    student_name: "Megha",
    student_city: "Mysuru",
    content:
      "For NEET aspirants — focus on NCERT Biology chapters 1-8 first. That alone covers 40% of the paper. Trust me.",
    post_type: "Advice",
    career_tag: "medicine",
    likes: 24,
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "seed-4",
    student_name: "Kiran",
    student_city: "Bengaluru",
    content:
      "My cousin became a UX designer without engineering degree. Now earning 18 LPA at a Bengaluru startup. Commerce + design portfolio was enough.",
    post_type: "CareerStory",
    career_tag: "ux-designer",
    likes: 31,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "seed-5",
    student_name: "Sneha",
    student_city: "Hubballi",
    content:
      "Is Karnataka CET enough for a good CS college or do I need JEE too? Someone from North Karnataka please help.",
    post_type: "Question",
    career_tag: "software-engineer",
    likes: 5,
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const per = 20;
  const admin = createServiceRoleClient();

  if (!admin) {
    return Response.json({ posts: SEED, page, hasMore: false });
  }

  const from = (page - 1) * per;
  const to = from + per - 1;
  const { data, error } = await admin
    .from("community_posts")
    .select("*")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    return Response.json({ posts: SEED, page, hasMore: false });
  }

  const merged = [...(data ?? []), ...SEED].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
  return Response.json({
    posts: merged.slice(0, per),
    page,
    hasMore: (data?.length ?? 0) >= per,
  });
}

export async function POST(req: Request) {
  const body = (await req.json()) as {
    studentId?: string;
    studentName: string;
    studentCity: string;
    content: string;
    postType: string;
    careerTag?: string | null;
  };

  if (!body.content || body.content.length > 280) {
    return Response.json({ error: "invalid_content" }, { status: 400 });
  }

  const admin = createServiceRoleClient();
  if (!admin) {
    return Response.json({
      ok: true,
      post: {
        id: `local-${Date.now()}`,
        ...body,
        likes: 0,
        created_at: new Date().toISOString(),
      },
    });
  }

  const { data, error } = await admin
    .from("community_posts")
    .insert({
      student_id: body.studentId ?? null,
      student_name: body.studentName,
      student_city: body.studentCity,
      content: body.content,
      post_type: body.postType,
      career_tag: body.careerTag ?? null,
    })
    .select()
    .maybeSingle();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json({ ok: true, post: data });
}

export async function PATCH(req: Request) {
  const { postId, studentId } = (await req.json()) as {
    postId?: string;
    studentId?: string;
  };
  if (!postId || !studentId) {
    return Response.json({ error: "missing" }, { status: 400 });
  }
  if (postId.startsWith("seed-")) {
    return Response.json({ likes: 1, liked: true });
  }

  const admin = createServiceRoleClient();
  if (!admin) {
    return Response.json({ likes: 0, liked: false });
  }

  const { data: existing } = await admin
    .from("post_likes")
    .select("id")
    .eq("post_id", postId)
    .eq("student_id", studentId)
    .maybeSingle();

  if (existing?.id) {
    await admin.from("post_likes").delete().eq("id", existing.id);
    const { data: p } = await admin
      .from("community_posts")
      .select("likes")
      .eq("id", postId)
      .maybeSingle();
    const next = Math.max(0, ((p?.likes as number) ?? 1) - 1);
    await admin.from("community_posts").update({ likes: next }).eq("id", postId);
    return Response.json({ liked: false, likes: next });
  }

  await admin.from("post_likes").insert({ post_id: postId, student_id: studentId });
  const { data: p } = await admin
    .from("community_posts")
    .select("likes")
    .eq("id", postId)
    .maybeSingle();
  const next = ((p?.likes as number) ?? 0) + 1;
  await admin.from("community_posts").update({ likes: next }).eq("id", postId);
  return Response.json({ liked: true, likes: next });
}
