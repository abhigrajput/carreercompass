import type { GameDomainPack } from "@/types";

export const DOMAIN_PACKS: Record<string, GameDomainPack> = {
  engineering: {
    domain: "engineering",
    title: "Engineering judgement lab",
    questions: [
      {
        id: "e1",
        prompt:
          "A bridge model keeps twisting in wind tunnel tests. What do you adjust first?",
        options: [
          "Increase decorative panels",
          "Tune damping / bracing and cross‑section stiffness",
          "Paint it darker",
          "Shorten the span without analysis",
        ],
        correctIndex: 1,
        rationale: "Controlled stiffness + damping reduces resonant twist.",
      },
      {
        id: "e2",
        prompt:
          "You must lift a heavy beam onto the third floor without cranes. Safest mindset?",
        options: [
          "Ask friends to rush together",
          "Sketch a simple lever/pulley plan and check load paths",
          "Carry it vertically up stairs alone",
          "Ignore friction completely",
        ],
        correctIndex: 1,
      },
      {
        id: "e3",
        prompt:
          "Diagram: three gears mesh in a line A‑B‑C. If A spins clockwise, C spins…",
        options: ["Clockwise", "Counter‑clockwise", "Not at all", "Randomly"],
        correctIndex: 1,
      },
      {
        id: "e4",
        prompt:
          "Concrete cracks appear early in monsoon. Likely first suspicion?",
        options: [
          "Only aesthetics",
          "Water ingress / curing / mix ratios need review",
          "Paint brand",
          "Ignore until summer",
        ],
        correctIndex: 1,
      },
      {
        id: "e5",
        prompt:
          "You prototype a water pump for a village. Most responsible next step?",
        options: [
          "Mass manufacture immediately",
          "Field‑test efficiency, leaks, and maintenance with locals",
          "Hide failures",
          "Use only lab readings",
        ],
        correctIndex: 1,
      },
    ],
  },
  medicine: {
    domain: "medicine",
    title: "Clinic judgement scenarios",
    questions: [
      {
        id: "m1",
        prompt:
          "A nervous classmate describes chest tightness before exams. First tone?",
        options: [
          "Dismiss as drama",
          "Calm, ask timeline + family history, encourage timely medical check",
          "Prescribe randomly",
          "Share WhatsApp remedies only",
        ],
        correctIndex: 1,
      },
      {
        id: "m2",
        prompt:
          "Patient privacy: your friend asks what another student told the nurse.",
        options: [
          "Share details to help gossip",
          "Refuse — confidentiality protects trust and safety",
          "Tell partially",
          "Post anonymously online",
        ],
        correctIndex: 1,
      },
      {
        id: "m3",
        prompt:
          "Hydration matters because it supports…",
        options: [
          "Only taste buds",
          "Blood volume, kidney function, and temperature balance",
          "Phone battery",
          "Hair colour",
        ],
        correctIndex: 1,
      },
      {
        id: "m4",
        prompt:
          "During a basic wound‑dressing drill, what reduces infection risk most?",
        options: [
          "Reuse cloth without cleaning",
          "Clean hands, sterile gauze, proper sealing",
          "Apply irritants",
          "Expose to dust",
        ],
        correctIndex: 1,
      },
      {
        id: "m5",
        prompt:
          "You explain diabetes prevention to a teen. Best emphasis?",
        options: [
          "Fear only",
          "Balanced diet, sleep, movement, and regular screening when advised",
          "Extreme fasting always",
          "Ignore genetics",
        ],
        correctIndex: 1,
      },
    ],
  },
  tech: {
    domain: "tech",
    title: "Tech pattern sprint",
    questions: [
      {
        id: "t1",
        prompt: "Pattern: 2, 6, 12, 20 — next?",
        options: ["28", "30", "32", "36"],
        correctIndex: 1,
      },
      {
        id: "t2",
        prompt:
          "Why version control (like Git) matters for student projects?",
        options: [
          "Only colour themes",
          "Track changes, collaborate safely, revert mistakes",
          "Replace backups entirely",
          "Slow teams down",
        ],
        correctIndex: 1,
      },
      {
        id: "t3",
        prompt:
          "A login page leaks passwords in URLs. What principle breaks?",
        options: ["Performance only", "Security / privacy basics", "Fonts", "SEO"],
        correctIndex: 1,
      },
      {
        id: "t4",
        prompt: "Binary 101 in decimal equals…",
        options: ["3", "5", "6", "7"],
        correctIndex: 1,
      },
      {
        id: "t5",
        prompt:
          "You optimise a slow school website. Sensible first step?",
        options: [
          "Add 20 pop‑ups",
          "Measure (profile), compress images, trim unused scripts",
          "Change only button colour",
          "Delete CSS entirely",
        ],
        correctIndex: 1,
      },
    ],
  },
  creative: {
    domain: "creative",
    title: "Creative craft scenarios",
    questions: [
      {
        id: "c1",
        prompt:
          "A poster must feel energetic for a science fair. Which pair clashes least?",
        options: [
          "Neon green text on neon yellow background (tiny font)",
          "Clear hierarchy: one hero colour + readable contrast",
          "Only thin grey on grey",
          "All caps everywhere with 10 fonts",
        ],
        correctIndex: 1,
      },
      {
        id: "c2",
        prompt:
          "You redesign a Kannada learning app for teens. First empathy step?",
        options: [
          "Skip interviews",
          "Ask what frustrates them today + observe real usage",
          "Copy foreign apps blindly",
          "Use only English microcopy",
        ],
        correctIndex: 1,
      },
      {
        id: "c3",
        prompt:
          "Colour wheel: complementary colours sit…",
        options: ["Next to each other", "Opposite each other", "Identical", "Random"],
        correctIndex: 1,
      },
      {
        id: "c4",
        prompt:
          "Storyboarding a short film on Bengaluru rain. Strong anchor?",
        options: [
          "No characters",
          "One clear emotion + specific sensory details",
          "Only camera brand names",
          "Avoid sound design",
        ],
        correctIndex: 1,
      },
      {
        id: "c5",
        prompt:
          "Accessibility in UI primarily helps…",
        options: [
          "Only designers",
          "People with diverse abilities + improves clarity for everyone",
          "Nobody",
          "Only desktop users",
        ],
        correctIndex: 1,
      },
    ],
  },
};

export function packForCareerDomain(domain: string): GameDomainPack {
  if (DOMAIN_PACKS[domain]) {
    return DOMAIN_PACKS[domain];
  }
  if (domain === "medicine" || domain === "healthcare") {
    return DOMAIN_PACKS.medicine;
  }
  if (domain === "engineering" || domain === "aviation") {
    return DOMAIN_PACKS.engineering;
  }
  if (domain === "creative" || domain === "media" || domain === "education") {
    return DOMAIN_PACKS.creative;
  }
  return DOMAIN_PACKS.tech;
}
