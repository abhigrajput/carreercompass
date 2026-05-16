"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { CAREERS } from "@/lib/careers";
import { careerDisplayName } from "@/lib/career-utils";
import type { LocaleCode } from "@/types";
import { loadStudentProfile } from "@/lib/student-storage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { TimetablePayload, TimetableSubjectBlock } from "@/lib/timetable-types";

const EXAMS = ["CET", "NEET", "JEE", "CLAT", "Other"] as const;

const SUBJECT_COLORS: Record<string, string> = {
  physics: "bg-blue-600/80 border-blue-400/40",
  chemistry: "bg-emerald-600/80 border-emerald-400/40",
  maths: "bg-orange-500/80 border-orange-300/40",
  mathematics: "bg-orange-500/80 border-orange-300/40",
  biology: "bg-purple-600/80 border-purple-400/40",
  english: "bg-yellow-500/80 border-yellow-300/40",
};

function blockColor(subject: string) {
  const key = subject.toLowerCase();
  for (const k of Object.keys(SUBJECT_COLORS)) {
    if (key.includes(k)) return SUBJECT_COLORS[k];
  }
  return "bg-white/10 border-white/20";
}

export default function TimetablePage() {
  const { t, i18n } = useTranslation("common");
  const lang = i18n.language as LocaleCode;
  const profile = loadStudentProfile();

  const [careerId, setCareerId] = useState(CAREERS[0]?.id ?? "");
  const [examName, setExamName] = useState<(typeof EXAMS)[number]>("CET");
  const [examDate, setExamDate] = useState("");
  const [hours, setHours] = useState(3);
  const [weak, setWeak] = useState<string[]>([]);
  const [strong, setStrong] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TimetablePayload | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const subjects = useMemo(
    () => ["Physics", "Chemistry", "Maths", "Biology", "English", "Logical Reasoning"],
    [],
  );

  const toggle = (arr: string[], v: string, set: (n: string[]) => void) => {
    if (arr.includes(v)) set(arr.filter((x) => x !== v));
    else set([...arr, v]);
  };

  const career = CAREERS.find((c) => c.id === careerId);

  const submit = async () => {
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          careerId,
          careerLabel: career ? careerDisplayName(career, lang) : careerId,
          examName,
          examDate: examDate || new Date().toISOString().slice(0, 10),
          hoursPerDay: hours,
          weakSubjects: weak,
          strongSubjects: strong,
          studentId: profile?.id ?? null,
        }),
      });
      const json = (await res.json()) as {
        timetable?: TimetablePayload;
        error?: string;
      };
      if (!res.ok || !json.timetable) {
        setErr(json.error ?? "Failed");
        return;
      }
      setData(json.timetable);
      try {
        localStorage.setItem("cc_timetable_created", "1");
      } catch {
        /* */
      }
    } catch {
      setErr("Network error");
    } finally {
      setLoading(false);
    }
  };

  const shareWa = () => {
    const url =
      typeof window !== "undefined"
        ? window.location.href
        : "https://careercompass.vercel.app/timetable";
    const text = encodeURIComponent(
      `I built my study timetable on CareerCompass Karnataka! ${url}`,
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-24 print:pt-4">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl text-white sm:text-4xl">
          {t("timetable.title")}
        </h1>
        <p className="mt-2 text-white/65">{t("timetable.subtitle")}</p>
      </motion.div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2 print:hidden">
        <Card className="rounded-2xl border-white/10 bg-[#12121F]">
          <CardHeader>
            <CardTitle className="font-display text-lg text-white">
              {t("timetable.formTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-white/80">{t("timetable.targetCareer")}</p>
              <select
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                value={careerId}
                onChange={(e) => setCareerId(e.target.value)}
              >
                {CAREERS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {careerDisplayName(c, lang)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-sm text-white/80">{t("timetable.exam")}</p>
              <select
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                value={examName}
                onChange={(e) => setExamName(e.target.value as (typeof EXAMS)[number])}
              >
                {EXAMS.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-sm text-white/80">{t("timetable.examDate")}</p>
              <input
                type="date"
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
              />
            </div>
            <div>
              <p className="text-sm text-white/80">
                {t("timetable.hours")}: {hours}h
              </p>
              <input
                type="range"
                min={1}
                max={8}
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                className="mt-2 w-full"
              />
            </div>
            <div>
              <p className="text-sm text-white/80">{t("timetable.weak")}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {subjects.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggle(weak, s, setWeak)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs",
                      weak.includes(s)
                        ? "border-red-400/60 bg-red-500/20 text-red-100"
                        : "border-white/15 text-white/70",
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-white/80">{t("timetable.strong")}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {subjects.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggle(strong, s, setStrong)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs",
                      strong.includes(s)
                        ? "border-emerald-400/60 bg-emerald-500/20 text-emerald-100"
                        : "border-white/15 text-white/70",
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            {err ? <p className="text-sm text-red-300">{err}</p> : null}
            <Button
              type="button"
              className="w-full rounded-xl bg-[#FF6B35] text-[#080814]"
              disabled={loading}
              onClick={() => void submit()}
            >
              {loading ? t("common.loading") : t("timetable.generate")}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4 text-sm text-white/70">
          <p>{t("timetable.hint")}</p>
          <Link href="/dashboard" className="text-[#FFD60A] underline">
            {t("nav.dashboard")}
          </Link>
        </div>
      </div>

      {data ? (
        <div className="mt-10 space-y-6 print:mt-4">
          <div className="flex flex-wrap gap-3 print:hidden">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl border-white/20 text-white"
              onClick={() => window.print()}
            >
              {t("timetable.downloadPdf")}
            </Button>
            <Button
              type="button"
              className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-500"
              onClick={shareWa}
            >
              {t("timetable.shareWhatsapp")}
            </Button>
          </div>

          {data.weeks.map((w) => (
            <div key={w.week} className="space-y-4">
              <h2 className="font-display text-xl text-white">
                {t("timetable.week", { n: w.week })}
              </h2>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {w.days.map((d) => (
                  <Card
                    key={`${w.week}-${d.day}`}
                    className="rounded-2xl border-white/10 bg-[#12121F]"
                  >
                    <CardHeader className="py-3">
                      <CardTitle className="text-base text-white">{d.day}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {d.subjects.map((s: TimetableSubjectBlock, i: number) => (
                        <div
                          key={`${s.subject}-${i}`}
                          className={cn(
                            "rounded-xl border p-3 text-sm",
                            blockColor(s.subject),
                          )}
                        >
                          <p className="font-medium text-white">{s.subject}</p>
                          <p className="text-xs text-white/80">{s.duration}</p>
                          <ul className="mt-1 list-disc pl-4 text-xs text-white/85">
                            {s.topics?.map((tpc) => (
                              <li key={tpc}>{tpc}</li>
                            ))}
                          </ul>
                          <p className="mt-1 text-[10px] uppercase tracking-wide text-white/50">
                            {s.resources?.join(" · ")}
                          </p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
