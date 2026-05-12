"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  ChevronDown,
  CreditCard,
  ExternalLink,
  FileText,
  Lightbulb,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Exam {
  id: string;
  name: string;
  nameKn: string;
  careers: string[];
  stream: string;
  month: string;
  eligibility: string;
  fee: string;
  website: string;
  tips: string[];
}

const EXAMS: Exam[] = [
  {
    id: "kcet",
    name: "Karnataka CET",
    nameKn: "ಕರ್ನಾಟಕ ಸಿಇಟಿ",
    careers: ["engineering", "medicine", "pharmacy"],
    stream: "science",
    month: "April",
    eligibility: "Class 12 PCM/PCB Karnataka student",
    fee: "₹650",
    website: "https://cetonline.karnataka.gov.in",
    tips: [
      "Focus on Karnataka State Board syllabus",
      "Last 10 years papers are most important",
      "Physics and Chemistry weigh equally",
      "No negative marking",
    ],
  },
  {
    id: "neet",
    name: "NEET-UG",
    nameKn: "ನೀಟ್-ಯುಜಿ",
    careers: ["medicine", "dentistry", "pharmacy"],
    stream: "science",
    month: "May",
    eligibility: "Class 12 PCB, min 50% marks",
    fee: "₹1700",
    website: "https://neet.nta.nic.in",
    tips: [
      "NCERT is the bible",
      "Attempt 150+ previous year questions daily",
      "Biology is 50% of paper",
      "Negative marking: -1 per wrong answer",
    ],
  },
  {
    id: "jee-main",
    name: "JEE Main",
    nameKn: "ಜೆಇಇ ಮೇನ್",
    careers: ["engineering", "tech"],
    stream: "science",
    month: "January & April",
    eligibility: "Class 12 PCM, no age limit",
    fee: "₹1000",
    website: "https://jeemain.nta.ac.in",
    tips: [
      "Maths is your score booster",
      "120 days focused prep is enough for average student",
      "Mock tests weekly mandatory",
      "Negative marking applies",
    ],
  },
  {
    id: "clat",
    name: "CLAT",
    nameKn: "ಕ್ಲಾಟ್",
    careers: ["law"],
    stream: "any",
    month: "December",
    eligibility: "Class 12 any stream, min 45%",
    fee: "₹4000",
    website: "https://consortiumofnlus.ac.in",
    tips: [
      "English and GK are high scorers",
      "Read newspaper daily",
      "Legal reasoning can be learned in 2 months",
      "No negative marking",
    ],
  },
  {
    id: "nift",
    name: "NIFT Entrance",
    nameKn: "ಎನ್\u200Cಐಎಫ್\u200Cಟಿ",
    careers: ["fashion", "design"],
    stream: "any",
    month: "February",
    eligibility: "Class 12 any stream",
    fee: "₹2500",
    website: "https://nift.ac.in",
    tips: [
      "Creative ability test is the key",
      "Build a portfolio of your designs",
      "Situation test requires hands-on practice",
      "GK and English in written test",
    ],
  },
  {
    id: "nda",
    name: "NDA",
    nameKn: "ಎನ್\u200Cಡಿಎ",
    careers: ["defence", "pilot"],
    stream: "science",
    month: "April & September",
    eligibility: "Male, Class 12 PCM, age 16.5-19.5",
    fee: "₹100",
    website: "https://upsc.gov.in",
    tips: [
      "Physical fitness is mandatory",
      "Maths paper is Class 12 level",
      "English and GK in paper 2",
      "SSB interview is the real challenge",
    ],
  },
  {
    id: "ca-foundation",
    name: "CA Foundation",
    nameKn: "ಸಿಎ ಫೌಂಡೇಶನ್",
    careers: ["ca", "finance"],
    stream: "commerce",
    month: "May & November",
    eligibility: "After Class 12 (any stream)",
    fee: "₹9800",
    website: "https://icai.org",
    tips: [
      "Register immediately after Class 12",
      "Accounts and Law are scoring subjects",
      "8 months minimum preparation",
      "Attempt all 4 papers together",
    ],
  },
  {
    id: "cet-agriculture",
    name: "Agriculture CET",
    nameKn: "ಕೃಷಿ ಸಿಇಟಿ",
    careers: ["agriculture"],
    stream: "science",
    month: "June",
    eligibility: "Class 12 PCB/PCM Karnataka student",
    fee: "₹500",
    website: "https://uasbangalore.edu.in",
    tips: [
      "UAS Bangalore, UAS Dharwad are top options",
      "Biology is primary subject",
      "Karnataka domicile required for govt seats",
      "Good career in agri-tech and food science",
    ],
  },
];

const STREAM_TABS = [
  { value: "all", label: "All Exams" },
  { value: "science", label: "Science" },
  { value: "commerce", label: "Commerce" },
  { value: "any", label: "Any Stream" },
] as const;

const MONTH_COLORS: Record<string, string> = {
  January: "bg-blue-500/20 text-blue-400",
  February: "bg-violet-500/20 text-violet-400",
  April: "bg-green-500/20 text-green-400",
  May: "bg-yellow-500/20 text-yellow-400",
  June: "bg-teal-500/20 text-teal-400",
  September: "bg-orange-500/20 text-orange-400",
  November: "bg-pink-500/20 text-pink-400",
  December: "bg-cyan-500/20 text-cyan-400",
};

function getMonthColor(month: string): string {
  for (const [key, value] of Object.entries(MONTH_COLORS)) {
    if (month.includes(key)) return value;
  }
  return "bg-white/10 text-white/70";
}

function ExamCard({ exam, index }: { exam: Exam; index: number }) {
  const { i18n } = useTranslation("common");
  const isKannada = i18n.language === "kn";
  const [tipsOpen, setTipsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group rounded-2xl border border-white/10 bg-[#12121F] p-5 transition-all hover:border-white/20"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-white">
            {isKannada ? exam.nameKn : exam.name}
          </h3>
          <p className="text-xs text-white/40">
            {isKannada ? exam.name : exam.nameKn}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${getMonthColor(exam.month)}`}
        >
          {exam.month}
        </span>
      </div>

      <div className="mb-4 space-y-2.5">
        <div className="flex items-center gap-2 text-sm text-white/70">
          <User className="size-3.5 shrink-0 text-[#FF6B35]" />
          <span>{exam.eligibility}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-white/70">
          <CreditCard className="size-3.5 shrink-0 text-[#06d6a0]" />
          <span>
            Fee: <span className="font-semibold text-white">{exam.fee}</span>
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-white/70">
          <FileText className="size-3.5 shrink-0 text-[#FFD60A]" />
          <span>
            Careers:{" "}
            {exam.careers.map((c) => c.charAt(0).toUpperCase() + c.slice(1)).join(", ")}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <button
          onClick={() => setTipsOpen(!tipsOpen)}
          className="flex w-full items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-sm text-white/80 transition-colors hover:bg-white/10"
        >
          <Lightbulb className="size-3.5 text-[#FFD60A]" />
          <span className="flex-1 text-left font-medium">Preparation Tips</span>
          <ChevronDown
            className={`size-4 transition-transform ${tipsOpen ? "rotate-180" : ""}`}
          />
        </button>

        <AnimatePresence>
          {tipsOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <ul className="mt-2 space-y-1.5 rounded-xl bg-white/[0.03] p-3">
                {exam.tips.map((tip, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-white/65"
                  >
                    <span className="mt-0.5 text-xs text-[#FFD60A]">
                      {i + 1}.
                    </span>
                    {tip}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <a href={exam.website} target="_blank" rel="noopener noreferrer">
        <Button className="w-full gap-2 bg-[#FF6B35] text-white hover:bg-[#FF6B35]/80">
          Official Website
          <ExternalLink className="size-3.5" />
        </Button>
      </a>
    </motion.div>
  );
}

export default function ExamsPage() {
  const [activeStream, setActiveStream] = useState<string>("all");

  const filtered = useMemo(() => {
    if (activeStream === "all") return EXAMS;
    return EXAMS.filter((e) => e.stream === activeStream);
  }, [activeStream]);

  return (
    <div className="min-h-screen bg-[#080814]">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-24">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-4xl font-bold text-white">
            <BookOpen className="mr-3 inline-block size-9 text-[#FF6B35]" />
            Entrance Exams
          </h1>
          <p className="mt-2 text-white/65">
            Key entrance exams for Karnataka students — eligibility, fees &
            preparation tips
          </p>
        </motion.div>

        <div className="mb-6 flex flex-wrap gap-2">
          {STREAM_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveStream(tab.value)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                activeStream === tab.value
                  ? "bg-[#FF6B35] text-white"
                  : "bg-[#12121F] text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <p className="mb-4 text-sm text-white/50">
          Showing {filtered.length} exam{filtered.length !== 1 ? "s" : ""}
        </p>

        <div className="grid gap-5 md:grid-cols-2">
          {filtered.map((exam, i) => (
            <ExamCard key={exam.id} exam={exam} index={i} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="mt-12 text-center">
            <BookOpen className="mx-auto mb-3 size-12 text-white/20" />
            <p className="text-white/50">No exams found for this stream.</p>
          </div>
        )}
      </div>
    </div>
  );
}
