import type { MetadataRoute } from "next";

const BASE = "https://careercompass.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: BASE, lastModified: now },
    { url: `${BASE}/explore`, lastModified: now },
    { url: `${BASE}/games`, lastModified: now },
    { url: `${BASE}/colleges`, lastModified: now },
    { url: `${BASE}/scholarships`, lastModified: now },
    { url: `${BASE}/exams`, lastModified: now },
    { url: `${BASE}/leaderboard`, lastModified: now },
    { url: `${BASE}/about`, lastModified: now },
    { url: `${BASE}/pricing`, lastModified: now },
  ];
}
