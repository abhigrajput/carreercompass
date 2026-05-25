export type ScholarshipItem = {
  id: string;
  name: string;
  provider: string;
  amount: string;
  eligibility: string[];
  deadline: string;
  applyUrl: string;
  category: string;
  stream: string;
  cities?: string[];
  classYears?: string[];
  goals?: string[];
};

export const SCHOLARSHIPS: ScholarshipItem[] = [
  {
    id: "post-matric-sc",
    name: "Post Matric Scholarship for SC Students",
    provider: "Karnataka Government",
    amount: "₹5,000 – ₹18,000/year",
    eligibility: ["SC category", "Family income below ₹2.5L", "Class 11-12"],
    deadline: "2026-10-31",
    applyUrl: "https://sw.kar.nic.in",
    category: "sc",
    stream: "any",
    classYears: ["11", "12"],
  },
  {
    id: "post-matric-st",
    name: "Post Matric Scholarship for ST Students",
    provider: "Karnataka Tribal Welfare Dept",
    amount: "₹5,000 – ₹20,000/year",
    eligibility: ["ST category", "Karnataka domicile", "Class 10-12"],
    deadline: "2026-11-30",
    applyUrl: "https://sw.kar.nic.in",
    category: "st",
    stream: "any",
    classYears: ["10", "11", "12"],
  },
  {
    id: "girls-science",
    name: "INSPIRE Scholarship for Girls in Science",
    provider: "Dept of Science & Technology, Govt of India",
    amount: "₹80,000/year",
    eligibility: ["Female students", "Top 1% in Class 10 board", "Science stream"],
    deadline: "2026-12-31",
    applyUrl: "https://online-inspire.gov.in",
    category: "girls",
    stream: "science",
    classYears: ["11", "12"],
    goals: ["doctor", "data scientist", "software engineer", "engineering"],
  },
  {
    id: "obc-scholarship",
    name: "OBC Post Matric Scholarship",
    provider: "Karnataka OBC Welfare Dept",
    amount: "₹3,000 – ₹10,000/year",
    eligibility: ["OBC category", "Family income below ₹1L", "Karnataka student"],
    deadline: "2026-10-15",
    applyUrl: "https://backwardclasses.kar.nic.in",
    category: "obc",
    stream: "any",
    classYears: ["11", "12"],
  },
  {
    id: "minority-scholarship",
    name: "Pre & Post Matric Minority Scholarship",
    provider: "Ministry of Minority Affairs",
    amount: "₹5,000 – ₹12,000/year",
    eligibility: ["Minority students", "Income below ₹1L", "Class 9-12"],
    deadline: "2026-11-30",
    applyUrl: "https://scholarships.gov.in",
    category: "minority",
    stream: "any",
    classYears: ["10", "11", "12"],
  },
  {
    id: "vidyasiri",
    name: "Vidyasiri Scholarship",
    provider: "Karnataka Government",
    amount: "₹2,000 – ₹8,000/year",
    eligibility: ["BC/OBC students", "Karnataka domicile", "Class 11-12"],
    deadline: "2026-09-30",
    applyUrl: "https://sw.kar.nic.in",
    category: "bc",
    stream: "any",
    classYears: ["11", "12"],
  },
  {
    id: "bengaluru-tech-fund",
    name: "Bengaluru Future Tech Learners Grant",
    provider: "City Innovation Foundation",
    amount: "₹15,000/year",
    eligibility: ["Tech-focused students", "Portfolio or coding interest", "Bengaluru student"],
    deadline: "2026-08-31",
    applyUrl: "https://example.org/tech-grant",
    category: "merit",
    stream: "science",
    cities: ["bengaluru"],
    goals: ["software engineer", "data scientist", "game developer"],
    classYears: ["11", "12"],
  },
  {
    id: "north-karnataka-neet-support",
    name: "North Karnataka Medical Dream Support",
    provider: "Regional Education Trust",
    amount: "₹20,000/year",
    eligibility: ["Medical aspirants from Hubballi region", "Need-based support"],
    deadline: "2026-07-20",
    applyUrl: "https://example.org/medical-support",
    category: "merit",
    stream: "science",
    cities: ["hubballi"],
    goals: ["doctor", "medicine", "neet"],
    classYears: ["11", "12"],
  },
];
