import { getCache, setCache } from "@/lib/cache";
import { createServiceRoleClient } from "@/lib/supabase/admin";

type LeaderboardItem = {
  student_name: string;
  city: string;
  points: number;
};

const MOCK: LeaderboardItem[] = [
  { student_name: "Ananya", city: "bengaluru", points: 1220 },
  { student_name: "Ravi", city: "mysuru", points: 1140 },
  { student_name: "Megha", city: "hubballi", points: 1075 },
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const city = (searchParams.get("city") ?? "all").toLowerCase();
  const cacheKey = `leaderboard_${city}`;

  const cached = await getCache<LeaderboardItem[]>(cacheKey);
  if (cached) {
    return Response.json({ entries: cached });
  }

  const admin = createServiceRoleClient();
  if (!admin) {
    await setCache(cacheKey, MOCK, 5 * 60);
    return Response.json({ entries: MOCK });
  }

  let query = admin
    .from("leaderboard")
    .select("student_name, city, points")
    .order("points", { ascending: false })
    .limit(20);

  if (city !== "all") {
    query = query.eq("city", city);
  }

  const { data } = await query;
  const entries = (data as LeaderboardItem[] | null) ?? MOCK;
  await setCache(cacheKey, entries, 5 * 60);
  return Response.json({ entries });
}
