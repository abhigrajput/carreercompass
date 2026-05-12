"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { packForCareerDomain } from "@/lib/game-packs";
import { cn } from "@/lib/utils";
import type { CareerItem, StudentProfile } from "@/types";

export function GameEngine({
  profile,
  career,
}: {
  profile: StudentProfile | null;
  career: CareerItem;
}) {
  const { t } = useTranslation("common");
  const pack = useMemo(() => packForCareerDomain(career.domain), [career.domain]);

  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [reveal, setReveal] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveNote, setSaveNote] = useState<string | null>(null);

  const question = pack.questions[idx];
  const total = pack.questions.length;
  const progress = (idx + (reveal ? 0.5 : 0)) / total;

  const persistGame = useCallback(
    async (finalScore: number, correctCount: number) => {
      setSaving(true);
      try {
        await fetch("/api/game-results", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId: profile?.id ?? null,
            studentName: profile?.name,
            careerDomain: career.domain,
            score: Math.round((correctCount / total) * 100),
            totalQuestions: total,
            correctAnswers: correctCount,
          }),
        });
        setSaveNote("saved");
      } catch {
        setSaveNote("local");
      } finally {
        setSaving(false);
      }
    },
    [career.domain, profile?.id, profile?.name, total],
  );

  const advance = useCallback(
    (optionIndex: number) => {
      if (!question || reveal) {
        return;
      }
      setPicked(optionIndex);
      setReveal(true);
      const correct = optionIndex === question.correctIndex;
      const nextScore = score + (correct ? 1 : 0);

      window.setTimeout(() => {
        if (idx >= total - 1) {
          setScore(nextScore);
          setFinished(true);
          void persistGame(nextScore, nextScore);
          setReveal(false);
          setPicked(null);
          return;
        }
        setScore(nextScore);
        setIdx((v) => v + 1);
        setReveal(false);
        setPicked(null);
      }, 950);
    },
    [idx, persistGame, question, reveal, score, total],
  );

  const reset = () => {
    setIdx(0);
    setScore(0);
    setFinished(false);
    setReveal(false);
    setPicked(null);
    setSaveNote(null);
  };

  if (!question && !finished) {
    return (
      <p className="text-sm text-white/70">{t("games.noQuestions")}</p>
    );
  }

  const personalized =
    score >= 4
      ? t("games.msg.high")
      : score >= 3
        ? t("games.msg.mid")
        : t("games.msg.low");

  return (
    <Card className="rounded-2xl border-white/10 bg-[#12121F]">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="font-display text-2xl text-white">
            {pack.title}
          </CardTitle>
          <span className="text-sm text-white/55">
            {career.icon} {career.name}
          </span>
        </div>
        {!finished ? (
          <>
            <div className="flex items-center justify-between text-xs text-white/55">
              <span>
                {t("games.questionProgress", { current: idx + 1, total })}
              </span>
              <span>{Math.round(progress * 100)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#FF6B35] to-[#FFD60A]"
                animate={{ width: `${((idx + (reveal ? 1 : 0)) / total) * 100}%` }}
                transition={{ duration: 0.25 }}
              />
            </div>
          </>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4">
        <AnimatePresence mode="wait">
          {!finished && question ? (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              className="space-y-4"
            >
              <p className="text-lg text-white/90">{question.prompt}</p>
              <div className="grid gap-2">
                {question.options.map((opt, i) => {
                  const isCorrect = i === question.correctIndex;
                  const isPick = picked === i;
                  let cls =
                    "h-auto justify-start rounded-xl border-white/10 bg-white/5 py-3 text-left text-white transition";
                  if (reveal) {
                    if (isCorrect) {
                      cls =
                        "h-auto justify-start rounded-xl border-2 border-emerald-400/80 bg-emerald-500/15 py-3 text-left text-white";
                    } else if (isPick && !isCorrect) {
                      cls =
                        "h-auto justify-start rounded-xl border-2 border-red-400/70 bg-red-500/15 py-3 text-left text-white";
                    }
                  }
                  return (
                    <button
                      key={opt}
                      type="button"
                      disabled={reveal}
                      className={cls}
                      onClick={() => advance(i)}
                    >
                      <span className="mr-3 font-semibold text-[#FFD60A]">
                        {i + 1}.
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          ) : finished ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4 rounded-2xl border border-[#06D6A0]/30 bg-emerald-500/5 p-5"
            >
              <p className="font-display text-2xl text-white">
                {t("games.score", { score, total })}
              </p>
              <p className="text-sm text-white/80">{personalized}</p>
              {saving ? (
                <p className="text-xs text-white/60">{t("games.saving")}</p>
              ) : saveNote === "saved" ? (
                <p className="text-xs text-emerald-300">{t("games.saved")}</p>
              ) : null}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-3">
        {finished ? (
          <>
            <Link
              href={`/roadmap?career=${career.id}`}
              className={cn(
                buttonVariants({ variant: "default" }),
                "rounded-lg bg-[#FF6B35] text-[#080814] hover:bg-[#ff844f]",
              )}
            >
              {t("games.ctaRoadmap")}
            </Link>
            <Button variant="ghost" className="text-white/80" onClick={reset}>
              {t("games.start")}
            </Button>
          </>
        ) : null}
      </CardFooter>
    </Card>
  );
}
