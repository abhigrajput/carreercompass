import { CAREERS } from "@/lib/careers";
import { getCache, setCache } from "@/lib/cache";
import { SCHOLARSHIPS, type ScholarshipItem } from "@/lib/scholarship-data";
import { createServiceRoleClient } from "@/lib/supabase/admin";

type Recommendation = {
  type: "career" | "game" | "scholarship" | "challenge";
  title: string;
  reason: string;
  action: string;
  actionUrl: string;
  icon: string;
  points: number;
};

type StudentRow = {
  id: string;
  class: string;
  city: string;
  known_goal: string | null;
  stream: string | null;
};

const HOLLAND_TO_CAREERS: Record<string, string[]> = {
  RI: ["biomedical-engineer", "civil-engineer", "data-scientist"],
  RA: ["architect", "game-developer", "ux-designer"],
  IA: ["ux-designer", "data-scientist", "psychologist"],
  IS: ["psychologist", "doctor", "teacher"],
  IE: ["data-scientist", "entrepreneur", "ca"],
  AS: ["teacher", "ux-designer", "journalist"],
  AE: ["ux-designer", "entrepreneur", "journalist"],
  SE: ["ias-officer", "doctor", "teacher"],
  EC: ["ca", "lawyer", "entrepreneur"],
  SC: ["teacher", "psychologist", "lawyer"],
};

const GAME_DOMAINS = ["tech", "medicine", "engineering", "creative"] as const;

function parseCity(city: string | null | undefined) {
  const next = (city ?? "").toLowerCase();
  if (next.includes("mysuru")) return "mysuru";
  if (next.includes("hubballi")) return "hubballi";
  return "bengaluru";
}

function pickScholarship(student: StudentRow): ScholarshipItem | null {
  const city = parseCity(student.city);
  const goal = (student.known_goal ?? "").toLowerCase();

  const ranked = SCHOLARSHIPS.map((scholarship) => {
    let score = 0;
    if (!scholarship.classYears || scholarship.classYears.includes(student.class)) {
      score += 3;
    }
    if (scholarship.stream === "any" || scholarship.stream === student.stream) {
      score += 3;
    }
    if (!scholarship.cities || scholarship.cities.includes(city)) {
      score += 2;
    }
    if (
      !scholarship.goals ||
      scholarship.goals.some((item) => goal.includes(item.toLowerCase()))
    ) {
      score += 2;
    }
    score -= Math.abs(new Date(scholarship.deadline).getTime() - Date.now()) / 1e11;
    return { scholarship, score };
  }).sort((a, b) => b.score - a.score);

  return ranked[0]?.scholarship ?? null;
}

function dailyChallenge(): Recommendation {
  const options = [
    {
      title: "Explore one new career today",
      reason: "A quick 5-minute exploration helps you discover better-fit paths faster.",
      action: "Explore now",
      actionUrl: "/explore",
      icon: "🔍",
      points: 10,
    },
    {
      title: "Ask the AI one focused question",
      reason: "One good question can unlock a clearer next step than hours of confusion.",
      action: "Open chat",
      actionUrl: "/chat",
      icon: "💬",
      points: 10,
    },
    {
      title: "Complete one career game",
      reason: "Fresh game results improve your profile fit and recommendation quality.",
      action: "Play game",
      actionUrl: "/games",
      icon: "🎮",
      points: 20,
    },
    {
      title: "Share CareerCompass with a friend",
      reason: "Studying and planning with a friend makes it easier to stay consistent.",
      action: "Share now",
      actionUrl: "/referral",
      icon: "🤝",
      points: 15,
    },
  ] as const;

  const index = Math.floor(Date.now() / 86400000) % options.length;
  return { type: "challenge", ...options[index] };
}

function genericRecommendations(): Recommendation[] {
  return [
    {
      type: "career",
      title: "Explore Software Engineer",
      reason: "It remains one of Karnataka's strongest entry points into high-growth careers.",
      action: "Open career",
      actionUrl: "/explore?career=software-engineer",
      icon: "💻",
      points: 5,
    },
    {
      type: "game",
      title: "Play the Tech Builder game",
      reason: "A short game can reveal where your strengths show up best.",
      action: "Play now",
      actionUrl: "/skill-games?domain=tech",
      icon: "🎯",
      points: 20,
    },
    {
      type: "scholarship",
      title: "Check scholarships",
      reason: "You may already qualify for a Karnataka or national scholarship this year.",
      action: "View scholarships",
      actionUrl: "/scholarships",
      icon: "🎓",
      points: 10,
    },
    dailyChallenge(),
  ];
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");
  if (!studentId) {
    return Response.json({ recommendations: genericRecommendations() });
  }

  const cacheKey = `recs_${studentId}`;
  const cached = await getCache<Recommendation[]>(cacheKey);
  if (cached) {
    return Response.json({ recommendations: cached });
  }

  const admin = createServiceRoleClient();
  if (!admin) {
    return Response.json({ recommendations: genericRecommendations() });
  }

  const { data: student } = await admin
    .from("students")
    .select("id, class, city, known_goal, stream")
    .eq("id", studentId)
    .maybeSingle<StudentRow>();

  if (!student) {
    return Response.json({ recommendations: genericRecommendations() });
  }

  const [{ data: interests }, { data: gameResults }] = await Promise.all([
    admin
      .from("career_interests")
      .select("career_id")
      .eq("student_id", studentId)
      .limit(50),
    admin
      .from("game_results")
      .select("career_domain, score")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  const explored = new Set((interests ?? []).map((item) => item.career_id));
  const hollandCode =
    gameResults?.find((item) => String(item.career_domain).length <= 2)?.career_domain ??
    null;
  const candidateCareerIds: string[] =
    (hollandCode && HOLLAND_TO_CAREERS[hollandCode as keyof typeof HOLLAND_TO_CAREERS]) ||
    ["software-engineer", "doctor", "ias-officer"];
  const nextCareerId =
    candidateCareerIds.find((id) => !explored.has(id)) ?? candidateCareerIds[0];
  const nextCareer = CAREERS.find((career) => career.id === nextCareerId) ?? CAREERS[0];

  const nonHollandGames = (gameResults ?? []).filter(
    (item) => String(item.career_domain).length > 2,
  );
  const playedDomains = new Set(
    nonHollandGames.map((item) => String(item.career_domain).toLowerCase()),
  );
  const unexploredDomain = GAME_DOMAINS.find((domain) => !playedDomains.has(domain));
  const weakestDomain =
    nonHollandGames.sort((a, b) => (a.score ?? 0) - (b.score ?? 0))[0]?.career_domain ??
    "tech";
  const gameDomain = unexploredDomain ?? String(weakestDomain).toLowerCase();

  const scholarship = pickScholarship(student);
  const recommendations: Recommendation[] = [
    {
      type: "career",
      title: `Next career to explore: ${nextCareer.name}`,
      reason: hollandCode
        ? `Your recent Holland pattern ${hollandCode} points strongly toward this path.`
        : "This is a strong next step based on what Karnataka students commonly explore after your current stage.",
      action: "Explore now",
      actionUrl: `/explore?career=${nextCareer.id}`,
      icon: nextCareer.icon,
      points: 5,
    },
    {
      type: "game",
      title: `Next skill game: ${gameDomain}`,
      reason: unexploredDomain
        ? "You have not tried this domain yet, so it is the fastest way to widen your fit profile."
        : "This looks like your weakest or least-tested domain right now, so a replay can sharpen your signals.",
      action: "Play now",
      actionUrl: `/skill-games?domain=${encodeURIComponent(gameDomain)}`,
      icon: "🎮",
      points: 20,
    },
    {
      type: "scholarship",
      title: scholarship?.name ?? "Scholarship match for you",
      reason: scholarship
        ? `This looks relevant for your class and current goal, with a deadline on ${new Date(scholarship.deadline).toLocaleDateString()}.`
        : "You should review scholarships now so you do not miss the closest deadlines.",
      action: "View scholarship",
      actionUrl: "/scholarships",
      icon: "🎓",
      points: 10,
    },
    dailyChallenge(),
  ];

  await setCache(cacheKey, recommendations, 3600);
  return Response.json({ recommendations });
}
