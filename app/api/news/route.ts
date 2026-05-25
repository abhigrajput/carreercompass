import { extractJson } from "@/lib/ai-json";
import { guardRateLimit } from "@/lib/api-guard";
import { getCache, setCache } from "@/lib/cache";
import { askDeepSeek } from "@/lib/deepseek";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import type { CareerNewsItem } from "@/types";

function fallbackNews(today: string): CareerNewsItem[] {
  return [
    {
      headline: "Bengaluru startups continue hiring fresh tech talent",
      summary:
        "Several Bengaluru startups are opening internships and entry roles for students building coding and design portfolios. This is a strong reminder that practical projects matter alongside marks.",
      category: "tech",
      relevantCareers: ["software-engineer", "ux-designer", "data-scientist"],
      source: `CareerCompass Daily Desk · ${today}`,
    },
    {
      headline: "Medical entrance coaching demand rises before next exam cycle",
      summary:
        "NEET-focused preparation activity is increasing across Karnataka as students begin early revision. Students interested in medicine should start topic tracking and weekly mock tests now.",
      category: "medical",
      relevantCareers: ["doctor", "nurse", "pharmacist"],
      source: `Karnataka Education Watch · ${today}`,
    },
    {
      headline: "State exam and scholarship awareness camps expand in district colleges",
      summary:
        "More institutions are hosting awareness sessions on scholarships, entrance routes, and counselling options. Students from tier-2 cities can use these events to gather deadlines and application tips.",
      category: "education",
      relevantCareers: ["teacher", "lawyer", "chartered-accountant"],
      source: `Student Opportunity Bulletin · ${today}`,
    },
    {
      headline: "Government hiring discussions renew interest in public-service careers",
      summary:
        "Students are increasingly exploring competitive-exam pathways tied to stable public-sector roles. This makes long-term planning for UPSC, banking, and state exams more relevant now.",
      category: "government",
      relevantCareers: ["government", "lawyer", "teacher"],
      source: `Public Careers Tracker · ${today}`,
    },
    {
      headline: "Innovation clubs push school students toward real-world problem solving",
      summary:
        "School and college innovation clubs are encouraging students to solve local problems through prototypes and teamwork. That exposure helps students test fit for engineering, design, and entrepreneurship.",
      category: "startup",
      relevantCareers: ["entrepreneur", "architect", "game-developer"],
      source: `Campus Startup Notes · ${today}`,
    },
  ];
}

export async function GET(req: Request) {
  const limited = guardRateLimit(req, 20);
  if (limited) return limited;

  const today = new Date().toISOString().slice(0, 10);
  const cacheKey = `news_${today}`;
  const cached = await getCache<CareerNewsItem[]>(cacheKey);
  if (cached) {
    return Response.json({ date: today, items: cached });
  }
  const admin = createServiceRoleClient();

  if (admin) {
    const { data } = await admin
      .from("career_news")
      .select("news_data")
      .eq("date", today)
      .maybeSingle();

    if (data?.news_data) {
      return Response.json({ date: today, items: data.news_data as CareerNewsItem[] });
    }
  }

  let items = fallbackNews(today);

  if (process.env.DEEPSEEK_API_KEY) {
    const prompt = `Generate 5 career-relevant news items for Karnataka students today (${today}).
Format as a JSON array:
[
  {
    "headline": "",
    "summary": "",
    "category": "tech",
    "relevantCareers": ["career-id"],
    "source": ""
  }
]

Categories must be one of: tech, medical, government, startup, education.
Focus on Karnataka job market, new courses, exam dates, startup ecosystem, and student schemes.
Make it realistic and useful. Respond ONLY as JSON.`;

    try {
      const raw = await askDeepSeek([{ role: "user", content: prompt }]);
      const extracted = extractJson<CareerNewsItem[]>(raw);
      if (Array.isArray(extracted) && extracted.length > 0) {
        items = extracted.slice(0, 5);
      }
    } catch {
      /* keep fallback news */
    }
  }

  if (admin) {
    await admin.from("career_news").upsert({
      date: today,
      news_data: items,
    });
  }

  await setCache(cacheKey, items, 6 * 60 * 60);

  return Response.json({ date: today, items });
}
