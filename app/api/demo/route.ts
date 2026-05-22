export async function GET() {
  return Response.json({
    profile: {
      id: "demo-student",
      name: "Ravi Kumar",
      class: "11" as const,
      city: "bengaluru" as const,
      language: "en" as const,
      points: 450,
      streakDays: 15,
      isPro: false,
    },
    careersExplored: ["software-engineer", "data-scientist", "ux-designer"],
    personalityType: "The Innovative Thinker (IA)",
    gameScore: { score: 10, total: 12 },
    badges: ["explorer", "pathfinder"],
    roadmapCareer: "software-engineer",
  });
}
