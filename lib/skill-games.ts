export type SkillGameId = "medicine" | "engineering" | "tech";

export type SkillScenario = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  empathyOptionIndex?: number;
};

export const MEDICINE_SCENARIOS: SkillScenario[] = [
  {
    id: "m1",
    prompt:
      'Patient: "Fever for 3 days, body ache, no appetite." What do you order first?',
    options: ["Malaria test", "Typhoid test", "Common cold", "Dengue test"],
    correctIndex: 3,
    explanation:
      "During Karnataka monsoon, dengue is common — testing early helps rule it in/out.",
    empathyOptionIndex: 3,
  },
  {
    id: "m2",
    prompt:
      'Child, 8 years — not speaking properly, avoiding eye contact. Next step?',
    options: [
      "Hearing problem",
      "Autism spectrum",
      "Shy personality",
      "Language delay only",
    ],
    correctIndex: 1,
    explanation:
      "Patterns may suggest autism spectrum — specialist referral is the right path.",
  },
  {
    id: "m3",
    prompt: 'Adult: "Chest pain, left arm numb, sweating."',
    options: ["Acidity", "Heart attack", "Muscle spasm", "Anxiety only"],
    correctIndex: 1,
    explanation: "Classic red flags — treat as emergency and escalate immediately.",
  },
  {
    id: "m4",
    prompt:
      'Teenage girl refusing to eat, says she is fat — BMI 16. Best approach?',
    options: [
      "Diet advice",
      "Psychiatrist referral",
      "Nutrition chart only",
      "Ignore as phase",
    ],
    correctIndex: 1,
    explanation:
      "Possible eating disorder — mental health specialist is safest.",
  },
  {
    id: "m5",
    prompt:
      'Farmer, 55 — breathless after walking 100m. Most likely chronic pattern?',
    options: ["Asthma only", "COPD", "Heart failure only", "Anaemia only"],
    correctIndex: 1,
    explanation:
      "Age + occupational exposure + exertional dyspnoea fits COPD commonly.",
  },
];

export const ENGINEERING_SCENARIOS: SkillScenario[] = [
  {
    id: "e1",
    prompt: "Bengaluru floods every monsoon — roads underwater in 30 minutes.",
    options: [
      "More drainage pipes only",
      "Underground water storage tanks",
      "Raise all road height",
      "Build more flyovers",
    ],
    correctIndex: 1,
    explanation:
      "Sustainable urban drainage + recharge (tanks) tackles runoff better than pipes alone.",
  },
  {
    id: "e2",
    prompt: "Village 50km from Hubballi has no electricity. Best first solution?",
    options: [
      "Extend distant grid only",
      "Solar microgrids",
      "Wind turbines only",
      "Diesel generators long-term",
    ],
    correctIndex: 1,
    explanation:
      "Solar microgrids are cost-effective for remote clusters in Karnataka.",
  },
  {
    id: "e3",
    prompt:
      "Old Mysuru bridge — cracks detected. 50,000 vehicles/day. What first?",
    options: [
      "Paint over cracks",
      "Emergency closure + repair",
      "Weight restrictions only",
      "Build parallel bridge only",
    ],
    correctIndex: 1,
    explanation: "Safety first — assess, restrict load, repair before reopening.",
  },
  {
    id: "e4",
    prompt: "School building roof collapsed in rain — 200 students.",
    options: [
      "Temporary tents only",
      "Relocate to another building",
      "Quick concrete patch only",
      "Steel frame reinforcement",
    ],
    correctIndex: 3,
    explanation:
      "Permanent structural fix (steel reinforcement) restores safety; tents are temporary.",
  },
  {
    id: "e5",
    prompt: "Hospital needs 24/7 power — city grid fails 4h/day.",
    options: [
      "Diesel only",
      "Solar + battery storage",
      "Second grid only",
      "Manual backup",
    ],
    correctIndex: 1,
    explanation: "Solar + batteries give reliable uptime with lower long-run cost.",
  },
];

export const TECH_SCENARIOS: SkillScenario[] = [
  {
    id: "t1",
    prompt: "Food delivery app crashes when 100+ users order at once.",
    options: [
      "Buy better laptop",
      "Load balancer + auto-scaling",
      "Ask users to retry",
      "Remove features",
    ],
    correctIndex: 1,
    explanation: "Scale the backend horizontally with LB and autoscaling.",
  },
  {
    id: "t2",
    prompt: "60% of support tickets are forgotten passwords.",
    options: [
      "Simpler passwords",
      "Google / OTP login",
      "Weekly reminders",
      "Remove passwords entirely",
    ],
    correctIndex: 1,
    explanation: "Passwordless / OAuth / OTP cuts friction and tickets.",
  },
  {
    id: "t3",
    prompt: "E-commerce site loads in 8 seconds on mobile.",
    options: [
      "Tell users to use WiFi",
      "Compress images + CDN",
      "Build separate app only",
      "Reduce listings",
    ],
    correctIndex: 1,
    explanation: "Assets + CDN are the biggest wins for mobile LCP.",
  },
  {
    id: "t4",
    prompt: "User passwords stored in plain text — breach happened.",
    options: [
      "Change passwords only",
      "bcrypt hashing + salting",
      "Shut down app",
      "Add CAPTCHA only",
    ],
    correctIndex: 1,
    explanation: "Proper hashing + rotation + incident response is mandatory.",
  },
  {
    id: "t5",
    prompt: "AI chatbot wrong answers ~40% of time.",
    options: [
      "Disclaimer only",
      "Fine-tune + RAG on domain data",
      "Remove chatbot",
      "Human review every reply",
    ],
    correctIndex: 1,
    explanation: "Grounding with RAG + fine-tune improves factual accuracy.",
  },
];

export function gameLabel(id: SkillGameId): string {
  if (id === "medicine") return "Medicine";
  if (id === "engineering") return "Engineering";
  return "Tech Builder";
}

export function maxTimeForGame(id: SkillGameId): number {
  return id === "medicine" ? 45 : 60;
}
