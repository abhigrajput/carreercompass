import { createServiceRoleClient } from "@/lib/supabase/admin";
import { isAdminRequest } from "@/lib/admin-auth";

export async function GET(req: Request) {
  if (!isAdminRequest(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createServiceRoleClient();
  if (!admin) {
    return Response.json(getMockMetrics());
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [
    studentsRes,
    todayRes,
    weekRes,
    proRes,
    gamesRes,
    postsRes,
    bookingsRes,
  ] = await Promise.all([
    admin.from("students").select("id", { count: "exact", head: true }),
    admin
      .from("students")
      .select("id", { count: "exact", head: true })
      .gte("created_at", today.toISOString()),
    admin
      .from("students")
      .select("id", { count: "exact", head: true })
      .gte("created_at", weekAgo.toISOString()),
    admin
      .from("students")
      .select("id", { count: "exact", head: true })
      .eq("is_pro", true),
    admin.from("game_results").select("id", { count: "exact", head: true }),
    admin.from("community_posts").select("id", { count: "exact", head: true }),
    admin.from("mentor_bookings").select("id", { count: "exact", head: true }),
  ]);

  return Response.json({
    totalStudents: studentsRes.count ?? 0,
    signupsToday: todayRes.count ?? 0,
    signupsThisWeek: weekRes.count ?? 0,
    proUsers: proRes.count ?? 0,
    gamesPlayed: gamesRes.count ?? 0,
    communityPosts: postsRes.count ?? 0,
    mentorBookings: bookingsRes.count ?? 0,
  });
}

function getMockMetrics() {
  return {
    totalStudents: 1240,
    signupsToday: 18,
    signupsThisWeek: 142,
    proUsers: 86,
    gamesPlayed: 3420,
    communityPosts: 210,
    mentorBookings: 34,
  };
}
