import type { MetadataRoute } from "next";
import { CAREERS } from "@/lib/careers";
import { BLOG_POSTS } from "@/lib/blog-posts";

const BASE = "https://careercompass.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const core: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, priority: 1 },
    { url: `${BASE}/games`, lastModified: now, priority: 0.9 },
    { url: `${BASE}/explore`, lastModified: now, priority: 0.9 },
    { url: `${BASE}/chat`, lastModified: now },
    { url: `${BASE}/compare`, lastModified: now },
    { url: `${BASE}/skill-games`, lastModified: now },
    { url: `${BASE}/study-timer`, lastModified: now },
    { url: `${BASE}/mock-interview`, lastModified: now },
    { url: `${BASE}/news`, lastModified: now },
    { url: `${BASE}/timetable`, lastModified: now },
    { url: `${BASE}/community`, lastModified: now },
    { url: `${BASE}/challenge`, lastModified: now },
    { url: `${BASE}/groups`, lastModified: now },
    { url: `${BASE}/mentors`, lastModified: now },
    { url: `${BASE}/colleges`, lastModified: now },
    { url: `${BASE}/scholarships`, lastModified: now },
    { url: `${BASE}/exams`, lastModified: now },
    { url: `${BASE}/leaderboard`, lastModified: now },
    { url: `${BASE}/blog`, lastModified: now, priority: 0.7 },
    { url: `${BASE}/faq`, lastModified: now, priority: 0.7 },
    { url: `${BASE}/school`, lastModified: now },
    { url: `${BASE}/demo`, lastModified: now },
    { url: `${BASE}/pitch`, lastModified: now },
    { url: `${BASE}/referral`, lastModified: now },
    { url: `${BASE}/pricing`, lastModified: now },
    { url: `${BASE}/about`, lastModified: now },
    { url: `${BASE}/dashboard`, lastModified: now },
  ];

  const careers = CAREERS.map((c) => ({
    url: `${BASE}/careers/${c.id}`,
    lastModified: now,
    priority: 0.8,
  }));

  const posts = BLOG_POSTS.map((p) => ({
    url: `${BASE}/blog/${p.slug}`,
    lastModified: now,
    priority: 0.7,
  }));

  return [...core, ...careers, ...posts];
}
