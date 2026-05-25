import { isAdminRequest } from "@/lib/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";

function isFlagged(content: string) {
  const lowered = content.toLowerCase();
  return ["spam", "telegram", "whatsapp", "http://", "https://"].some((token) =>
    lowered.includes(token),
  );
}

export async function GET(req: Request) {
  if (!isAdminRequest(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createServiceRoleClient();
  if (!admin) {
    return Response.json({ posts: [] });
  }

  const since = new Date();
  since.setDate(since.getDate() - 7);

  const { data } = await admin
    .from("community_posts")
    .select("id, student_name, student_city, content, likes, created_at")
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: false })
    .limit(100);

  return Response.json({
    posts: (data ?? []).map((post) => ({
      id: post.id,
      studentName: post.student_name,
      city: post.student_city,
      content: post.content,
      likes: post.likes ?? 0,
      createdAt: post.created_at,
      flagged: isFlagged(post.content),
    })),
  });
}
