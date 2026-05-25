export type WeeklyChallengeTask = {
  id: string;
  label: string;
  action: string;
  points: number;
  link: string;
  count?: number;
};

export type WeeklyChallenge = {
  weekTheme: string;
  careerFocus: string;
  icon: string;
  tasks: WeeklyChallengeTask[];
  totalPoints: number;
  badge: string;
};

export const WEEKLY_CHALLENGES: WeeklyChallenge[] = [
  {
    weekTheme: "Tech Week",
    careerFocus: "technology",
    icon: "💻",
    tasks: [
      { id: "t1", label: "Play the Tech Builder game", action: "skill_game_tech", points: 50, link: "/skill-games?domain=tech" },
      { id: "t2", label: "Explore 3 tech careers", action: "explore_career", count: 3, points: 30, link: "/explore?filter=tech" },
      { id: "t3", label: "Ask AI about tech salaries", action: "chat_message", points: 20, link: "/chat" },
    ],
    totalPoints: 100,
    badge: "💻 Tech Explorer",
  },
  {
    weekTheme: "Medical Heroes Week",
    careerFocus: "medicine",
    icon: "🩺",
    tasks: [
      { id: "t1", label: "Complete the Medicine Simulator", action: "skill_game_medicine", points: 50, link: "/skill-games?domain=medicine" },
      { id: "t2", label: "Explore Doctor, Nurse, and Pharmacist careers", action: "explore_career", count: 3, points: 30, link: "/explore?filter=medicine" },
      { id: "t3", label: "Find 1 medical scholarship", action: "view_scholarship", points: 20, link: "/scholarships" },
    ],
    totalPoints: 100,
    badge: "🩺 Medical Explorer",
  },
  {
    weekTheme: "Law & Justice Week",
    careerFocus: "law",
    icon: "⚖️",
    tasks: [
      { id: "t1", label: "Explore Lawyer, Judge, and IPS careers", action: "explore_career", count: 3, points: 30, link: "/explore?filter=law" },
      { id: "t2", label: "Read about CLAT entrance exam", action: "view_exam", points: 20, link: "/exams" },
      { id: "t3", label: "Chat with AI about law careers", action: "chat_message", points: 20, link: "/chat" },
    ],
    totalPoints: 70,
    badge: "⚖️ Justice Seeker",
  },
  {
    weekTheme: "Creative Careers Week",
    careerFocus: "creative",
    icon: "🎨",
    tasks: [
      { id: "t1", label: "Play the Creative Spark game", action: "skill_game_creative", points: 50, link: "/skill-games?domain=creative" },
      { id: "t2", label: "Explore UX Design, Film, and Architecture", action: "explore_career", count: 3, points: 30, link: "/explore?filter=creative" },
      { id: "t3", label: "Post your creative dream in community", action: "community_post", points: 20, link: "/community" },
    ],
    totalPoints: 100,
    badge: "🎨 Creative Mind",
  },
  {
    weekTheme: "Business Builder Week",
    careerFocus: "commerce",
    icon: "📈",
    tasks: [
      { id: "t1", label: "Explore CA, MBA, and Entrepreneur paths", action: "explore_career", count: 3, points: 30, link: "/explore?filter=commerce" },
      { id: "t2", label: "Compare CA vs Startup Founder", action: "compare_career", points: 20, link: "/compare" },
      { id: "t3", label: "Ask AI how business students can earn early", action: "chat_message", points: 20, link: "/chat" },
    ],
    totalPoints: 70,
    badge: "📈 Business Builder",
  },
  {
    weekTheme: "Public Service Week",
    careerFocus: "government",
    icon: "🏛️",
    tasks: [
      { id: "t1", label: "Explore IAS, IPS, and KAS careers", action: "explore_career", count: 3, points: 30, link: "/explore?filter=government" },
      { id: "t2", label: "Review 1 major government exam", action: "view_exam", points: 20, link: "/exams" },
      { id: "t3", label: "Share your mission with parents", action: "share_parent", points: 20, link: "/dashboard" },
    ],
    totalPoints: 70,
    badge: "🏛️ Public Service Ready",
  },
  {
    weekTheme: "Future Skills Week",
    careerFocus: "technology",
    icon: "🤖",
    tasks: [
      { id: "t1", label: "Explore AI, Robotics, and Cybersecurity", action: "explore_career", count: 3, points: 30, link: "/explore?filter=tech" },
      { id: "t2", label: "Play one future-skills game", action: "skill_game_tech", points: 30, link: "/skill-games?domain=tech" },
      { id: "t3", label: "Ask AI which skill to learn first", action: "chat_message", points: 20, link: "/chat" },
    ],
    totalPoints: 80,
    badge: "🤖 Future Skills Scout",
  },
  {
    weekTheme: "Campus Prep Week",
    careerFocus: "education",
    icon: "🎓",
    tasks: [
      { id: "t1", label: "Check 3 Karnataka colleges", action: "view_college", count: 3, points: 30, link: "/colleges" },
      { id: "t2", label: "Build one study timer streak", action: "complete_pomodoro", points: 20, link: "/study-timer" },
      { id: "t3", label: "Generate your roadmap", action: "generate_roadmap", points: 30, link: "/roadmap" },
    ],
    totalPoints: 80,
    badge: "🎓 Campus Ready",
  },
];

export function getCurrentWeekChallenge(referenceDate = new Date()): WeeklyChallenge {
  const weekNumber = Math.floor(referenceDate.getTime() / (7 * 24 * 60 * 60 * 1000));
  return WEEKLY_CHALLENGES[weekNumber % WEEKLY_CHALLENGES.length] ?? WEEKLY_CHALLENGES[0];
}

export function getChallengeStorageKey(date = new Date()): string {
  const monday = getWeekStart(date);
  return `cc_weekly_challenge_${monday.toISOString().slice(0, 10)}`;
}

export function getWeekStart(date = new Date()): Date {
  const next = new Date(date);
  const day = next.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + diff);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function getNextMonday(date = new Date()): Date {
  const start = getWeekStart(date);
  const next = new Date(start);
  next.setDate(start.getDate() + 7);
  return next;
}
