"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Award,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Filter,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadStudentProfile } from "@/lib/student-storage";

interface Scholarship {
  id: string;
  name: string;
  nameKn?: string;
  provider: string;
  amount: string;
  eligibility: string[];
  deadline: string;
  applyUrl: string;
  category: string;
  stream: string;
}

const SCHOLARSHIPS: Scholarship[] = [
  {
    id: "post-matric-sc",
    name: "Post Matric Scholarship for SC Students",
    nameKn:
      "ಎಸ್\u200Cಸಿ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಮ್ಯಾಟ್ರಿಕ್ ನಂತರದ ವಿದ್ಯಾರ್ಥಿವೇತನ",
    provider: "Karnataka Government",
    amount: "₹5,000 – ₹18,000/year",
    eligibility: ["SC category", "Family income below ₹2.5L", "Class 11-12"],
    deadline: "October 31 every year",
    applyUrl: "https://sw.kar.nic.in",
    category: "sc",
    stream: "any",
  },
  {
    id: "post-matric-st",
    name: "Post Matric Scholarship for ST Students",
    nameKn: "ಎಸ್\u200Cಟಿ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ವಿದ್ಯಾರ್ಥಿವೇತನ",
    provider: "Karnataka Tribal Welfare Dept",
    amount: "₹5,000 – ₹20,000/year",
    eligibility: ["ST category", "Karnataka domicile", "Class 10-12"],
    deadline: "November 30 every year",
    applyUrl: "https://sw.kar.nic.in",
    category: "st",
    stream: "any",
  },
  {
    id: "girls-science",
    name: "INSPIRE Scholarship for Girls in Science",
    provider: "Dept of Science & Technology, Govt of India",
    amount: "₹80,000/year",
    eligibility: [
      "Female students",
      "Top 1% in Class 10 board",
      "Science stream",
    ],
    deadline: "December 31 every year",
    applyUrl: "https://online-inspire.gov.in",
    category: "girls",
    stream: "science",
  },
  {
    id: "obc-scholarship",
    name: "OBC Post Matric Scholarship",
    provider: "Karnataka OBC Welfare Dept",
    amount: "₹3,000 – ₹10,000/year",
    eligibility: [
      "OBC category",
      "Family income below ₹1L",
      "Karnataka student",
    ],
    deadline: "October 15 every year",
    applyUrl: "https://backwardclasses.kar.nic.in",
    category: "obc",
    stream: "any",
  },
  {
    id: "minority-scholarship",
    name: "Pre & Post Matric Minority Scholarship",
    provider: "Ministry of Minority Affairs",
    amount: "₹5,000 – ₹12,000/year",
    eligibility: [
      "Muslim/Christian/Sikh/Buddhist/Jain",
      "Income below ₹1L",
      "Class 9-12",
    ],
    deadline: "November 30 every year",
    applyUrl: "https://scholarships.gov.in",
    category: "minority",
    stream: "any",
  },
  {
    id: "vidyasiri",
    name: "Vidyasiri Scholarship",
    provider: "Karnataka Government",
    amount: "₹2,000 – ₹8,000/year",
    eligibility: ["BC/OBC students", "Karnataka domicile", "Class 11-12"],
    deadline: "September 30 every year",
    applyUrl: "https://sw.kar.nic.in",
    category: "bc",
    stream: "any",
  },
  {
    id: "national-merit",
    name: "National Means-cum-Merit Scholarship",
    provider: "Ministry of Education",
    amount: "₹12,000/year",
    eligibility: [
      "Family income below ₹3.5L",
      "Scored 55%+ in Class 8",
      "Class 9-12",
    ],
    deadline: "October 31 every year",
    applyUrl: "https://scholarships.gov.in",
    category: "merit",
    stream: "any",
  },
  {
    id: "sports-scholarship",
    name: "Sports Scholarship Karnataka",
    provider: "Karnataka Sports Authority",
    amount: "₹10,000 – ₹50,000/year",
    eligibility: ["State/National level sports player", "Karnataka student"],
    deadline: "August 31 every year",
    applyUrl: "https://kssamysore.com",
    category: "sports",
    stream: "any",
  },
];

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "sc", label: "SC" },
  { value: "st", label: "ST" },
  { value: "obc", label: "OBC" },
  { value: "girls", label: "Girls" },
  { value: "merit", label: "Merit" },
  { value: "sports", label: "Sports" },
  { value: "minority", label: "Minority" },
  { value: "bc", label: "BC" },
] as const;

const STREAMS = [
  { value: "any", label: "Any Stream" },
  { value: "science", label: "Science" },
  { value: "commerce", label: "Commerce" },
  { value: "arts", label: "Arts" },
] as const;

export default function ScholarshipsPage() {
  const { i18n } = useTranslation("common");
  const profile = loadStudentProfile();
  const isKannada = i18n.language === "kn";

  const [category, setCategory] = useState<string>("all");
  const [stream, setStream] = useState<string>(profile?.stream ?? "any");

  const filtered = useMemo(() => {
    return SCHOLARSHIPS.filter((s) => {
      if (category !== "all" && s.category !== category) return false;
      if (stream !== "any" && s.stream !== "any" && s.stream !== stream)
        return false;
      return true;
    });
  }, [category, stream]);

  const matchingCount = useMemo(() => {
    if (!profile?.stream) return filtered.length;
    return SCHOLARSHIPS.filter(
      (s) => s.stream === "any" || s.stream === profile.stream,
    ).length;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.stream, filtered.length]);

  return (
    <div className="min-h-screen bg-[#080814]">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-24">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-4xl font-bold text-white">
            <GraduationCap className="mr-3 inline-block size-9 text-[#FF6B35]" />
            Scholarships
          </h1>
          <p className="mt-2 text-white/65">
            Find scholarships you&apos;re eligible for in Karnataka
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 rounded-2xl border border-[#FFD60A]/30 bg-[#FFD60A]/10 p-4"
        >
          <div className="flex items-center gap-3">
            <Award className="size-6 text-[#FFD60A]" />
            <p className="text-sm font-medium text-[#FFD60A]">
              You may qualify for{" "}
              <span className="text-lg font-bold">{matchingCount}</span>{" "}
              scholarships
              {profile?.stream ? ` based on your ${profile.stream} stream` : ""}
            </p>
          </div>
        </motion.div>

        <div className="mb-6 space-y-4 rounded-2xl border border-white/10 bg-[#12121F] p-4">
          <div className="flex items-center gap-2 text-sm text-white/75">
            <Filter className="size-4" />
            <span>Filter Scholarships</span>
          </div>

          <div>
            <p className="mb-2 text-xs text-white/50">Category</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                    category === c.value
                      ? "bg-[#FF6B35] text-white"
                      : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs text-white/50">Stream</p>
            <div className="flex flex-wrap gap-2">
              {STREAMS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setStream(s.value)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                    stream === s.value
                      ? "bg-[#FF6B35] text-white"
                      : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="mb-4 text-sm text-white/50">
          Showing {filtered.length} of {SCHOLARSHIPS.length} scholarships
        </p>

        <div className="grid gap-5 md:grid-cols-2">
          {filtered.map((scholarship, i) => {
            const isStreamMatch =
              profile?.stream &&
              (scholarship.stream === "any" ||
                scholarship.stream === profile.stream);

            return (
              <motion.div
                key={scholarship.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`group relative rounded-2xl border bg-[#12121F] p-5 transition-all hover:border-white/20 ${
                  isStreamMatch
                    ? "border-[#FFD60A]/30 ring-1 ring-[#FFD60A]/10"
                    : "border-white/10"
                }`}
              >
                {isStreamMatch && (
                  <span className="absolute right-3 top-3 rounded-full bg-[#FFD60A]/15 px-2 py-0.5 text-[10px] font-semibold text-[#FFD60A]">
                    Matches your stream
                  </span>
                )}

                <p className="mb-1 text-xs font-medium uppercase tracking-wider text-[#FF6B35]">
                  {scholarship.provider}
                </p>

                <h3 className="mb-1 text-lg font-semibold text-white">
                  {isKannada && scholarship.nameKn
                    ? scholarship.nameKn
                    : scholarship.name}
                </h3>

                {isKannada && scholarship.nameKn && (
                  <p className="mb-2 text-xs text-white/40">
                    {scholarship.name}
                  </p>
                )}

                <p className="mb-4 text-2xl font-bold text-[#06d6a0]">
                  {scholarship.amount}
                </p>

                <div className="mb-4 space-y-1.5">
                  {scholarship.eligibility.map((item) => (
                    <div key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-[#06d6a0]" />
                      <span className="text-sm text-white/70">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="mb-4 flex items-center gap-2 text-sm text-white/50">
                  <Calendar className="size-3.5" />
                  <span>Deadline: {scholarship.deadline}</span>
                </div>

                <a
                  href={scholarship.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="w-full gap-2 bg-[#FF6B35] text-white hover:bg-[#FF6B35]/80">
                    Apply Now
                    <ExternalLink className="size-3.5" />
                  </Button>
                </a>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="mt-12 text-center">
            <GraduationCap className="mx-auto mb-3 size-12 text-white/20" />
            <p className="text-white/50">
              No scholarships found for the selected filters.
            </p>
            <button
              onClick={() => {
                setCategory("all");
                setStream("any");
              }}
              className="mt-2 text-sm text-[#FF6B35] hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
