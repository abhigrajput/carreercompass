import { getCache, setCache } from "@/lib/cache";
import { COLLEGES } from "@/lib/colleges";

export async function GET() {
  const cacheKey = "colleges_all";
  const cached = await getCache<typeof COLLEGES>(cacheKey);
  if (cached) {
    return Response.json({ colleges: cached });
  }

  await setCache(cacheKey, COLLEGES, 24 * 60 * 60);
  return Response.json({ colleges: COLLEGES });
}
