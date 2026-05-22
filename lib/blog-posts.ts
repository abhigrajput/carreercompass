export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  readMinutes: number;
  content: string[];
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "top-10-careers-cet-2025",
    title: "Top 10 Careers for Karnataka CET Students in 2025",
    description:
      "Best career paths after CET for Karnataka Class 12 science and commerce students.",
    date: "2025-01-15",
    readMinutes: 8,
    content: [
      "Karnataka CET opens doors to engineering, medicine, agriculture, and more. Here are ten careers CET students pursue most successfully in 2025.",
      "Software engineering remains the top choice in Bengaluru's tech ecosystem, with strong campus placement at RV, BMS, and NITK Surathkal.",
      "Medicine through NEET remains competitive; Karnataka students benefit from state quota seats at Bangalore Medical College and KMC Manipal.",
    ],
  },
  {
    slug: "neet-vs-cet",
    title: "NEET vs CET: Which is Right for You?",
    description: "Compare NEET and Karnataka CET for science students.",
    date: "2025-01-10",
    readMinutes: 7,
    content: [
      "NEET is mandatory for MBBS and BDS nationwide. CET is Karnataka's state entrance for engineering, pharmacy, and allied courses.",
      "If you love biology and patient care, focus on NEET. If you enjoy maths and building technology, CET engineering is your path.",
    ],
  },
  {
    slug: "career-after-class-10-karnataka",
    title: "How to Choose a Career After Class 10 in Karnataka",
    description: "A practical guide for SSLC students picking streams.",
    date: "2024-12-20",
    readMinutes: 6,
    content: [
      "After SSLC, choosing Science, Commerce, or Arts shapes your next decade. Talk to teachers, try CareerCompass games, and explore salaries honestly.",
    ],
  },
  {
    slug: "highest-paying-careers-bengaluru",
    title: "Highest Paying Careers for Science Students in Bengaluru",
    description: "Salary ranges for top careers in Karnataka's tech capital.",
    date: "2024-12-05",
    readMinutes: 5,
    content: [
      "Software engineers, data scientists, and product managers lead Bengaluru salary charts, often crossing ₹25 LPA within 5–7 years with strong skills.",
    ],
  },
  {
    slug: "karnataka-cet-2025-guide",
    title: "Complete Guide to Karnataka CET 2025",
    description: "Dates, syllabus, and preparation tips for CET aspirants.",
    date: "2024-11-28",
    readMinutes: 9,
    content: [
      "CET 2025 tests Physics, Chemistry, Mathematics/Biology based on PUC syllabus. Start with NCERT, solve 10 years of papers, and track college cutoffs early.",
    ],
  },
];
