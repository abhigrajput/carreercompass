"use client";

import { loadStudentProfile } from "@/lib/student-storage";

const EXAM_DATES_2025 = {
  kcet: new Date("2026-04-16"),
  neet: new Date("2026-05-04"),
  "jee-main": new Date("2026-01-22"),
  clat: new Date("2025-12-01"),
  nift: new Date("2026-02-09"),
  nda: new Date("2026-04-13"),
} as const;

const EXAM_META: { id: keyof typeof EXAM_DATES_2025; label: string; careers: string[] }[] = [
  { id: "kcet", label: "KCET", careers: ["software-engineer", "data-scientist", "architect"] },
  { id: "neet", label: "NEET", careers: ["doctor"] },
  { id: "jee-main", label: "JEE Main", careers: ["software-engineer", "data-scientist"] },
  { id: "clat", label: "CLAT", careers: ["lawyer", "ias-officer"] },
  { id: "nift", label: "NIFT", careers: ["ux-designer", "architect"] },
  { id: "nda", label: "NDA", careers: ["ias-officer"] },
] as const;

export function getDaysUntil(date: Date): number {
  return Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function tone(days: number): string {
  if (days < 30) return "border-red-500/30 bg-red-500/10 text-red-200";
  if (days < 60) return "border-yellow-500/30 bg-yellow-500/10 text-yellow-200";
  return "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";
}

export default function ExamCountdown() {
  const profile = loadStudentProfile();
  const related = EXAM_META.filter((exam) =>
    profile?.lastCareerId ? exam.careers.includes(profile.lastCareerId) : true,
  );

  const items = (related.length > 0 ? related : EXAM_META)
    .map((exam) => ({
      ...exam,
      days: getDaysUntil(EXAM_DATES_2025[exam.id]),
    }))
    .filter((exam) => exam.days > 0)
    .sort((a, b) => a.days - b.days)
    .slice(0, 3);

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {items.map((exam) => (
        <div
          key={exam.id}
          className={`rounded-2xl border p-4 ${tone(exam.days)}`}
        >
          <p className="text-xs uppercase tracking-wide opacity-80">{exam.label}</p>
          <p className="mt-2 text-2xl font-semibold">{exam.days} days</p>
        </div>
      ))}
    </div>
  );
}
