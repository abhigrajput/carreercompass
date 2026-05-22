"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  ENGINEERING_SCENARIOS,
  MEDICINE_SCENARIOS,
  TECH_SCENARIOS,
  gameLabel,
  maxTimeForGame,
  type SkillGameId,
  type SkillScenario,
} from "@/lib/skill-games";
import { loadStudentProfile } from "@/lib/student-storage";
import { hapticCorrect, hapticWrong } from "@/lib/haptics";

type Phase = "pick" | "play" | "result";

function scenariosFor(id: SkillGameId): SkillScenario[] {
  if (id === "medicine") return MEDICINE_SCENARIOS;
  if (id === "engineering") return ENGINEERING_SCENARIOS;
  return TECH_SCENARIOS;
}

function gradeFromPct(pct: number): { g: string; msg: string } {
  if (pct >= 90) return { g: "S", msg: "You are built for this career" };
  if (pct >= 70) return { g: "A", msg: "Strong aptitude — keep practising" };
  if (pct >= 50) return { g: "B", msg: "Good base — focus on weak areas" };
  return { g: "C", msg: "This might not be your strongest fit" };
}

export default function SkillGamesPage() {
  const { t } = useTranslation("common");
  const params = useSearchParams();
  const profile = loadStudentProfile();

  const challengeGame = params.get("challenge") as SkillGameId | null;
  const challengeScore = Number(params.get("score") ?? "0");
  const challengeName = params.get("name") ?? "Friend";

  const [phase, setPhase] = useState<Phase>("pick");
  const [gameId, setGameId] = useState<SkillGameId | null>(null);
  const [idx, setIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [streak, setStreak] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [floatPts, setFloatPts] = useState<number | null>(null);
  const [wrongHold, setWrongHold] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const processing = useRef(false);
  const challengeStarted = useRef(false);
  const idxRef = useRef(0);
  const timedOutIdx = useRef<number | null>(null);

  const scenarios = gameId ? scenariosFor(gameId) : [];
  const maxT = gameId ? maxTimeForGame(gameId) : 45;
  const current = scenarios[idx];

  useEffect(() => {
    idxRef.current = idx;
  }, [idx]);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const advance = useCallback(
    async (correct: boolean, explanation?: string) => {
      if (!gameId || processing.current) return;
      processing.current = true;
      clearTimer();

      const curIdx = idxRef.current;
      const tl = timeLeft;

      const basePoints = 100;
      const timeRatio = maxT > 0 ? Math.max(0, tl) / maxT : 0;
      const streakMult = streak >= 1 && correct ? 1.5 : 1;
      const earned = correct
        ? Math.round(basePoints * timeRatio * streakMult)
        : 0;

      if (correct) {
        hapticCorrect();
        setStreak((s) => s + 1);
        setCorrectCount((c) => c + 1);
        setTotalPoints((p) => p + earned);
        setFloatPts(earned);
        window.setTimeout(() => setFloatPts(null), 900);
      } else {
        hapticWrong();
        setStreak(0);
        if (explanation) {
          setWrongHold(explanation);
          await new Promise((r) => setTimeout(r, 2000));
          setWrongHold(null);
        }
      }

      const scen = scenariosFor(gameId);
      const last = curIdx + 1 >= scen.length;
      if (last) {
        setPhase("result");
        processing.current = false;
        timedOutIdx.current = null;
        return;
      }

      setIdx(curIdx + 1);
      setTimeLeft(maxTimeForGame(gameId));
      timedOutIdx.current = null;
      processing.current = false;
      timerRef.current = setInterval(() => {
        setTimeLeft((s) => (s <= 1 ? 0 : s - 1));
      }, 1000);
    },
    [gameId, maxT, streak, timeLeft],
  );

  useEffect(() => {
    if (phase !== "play" || !gameId || wrongHold || processing.current) return;
    if (timeLeft > 0) return;
    const i = idxRef.current;
    if (timedOutIdx.current === i) return;
    timedOutIdx.current = i;
    void advance(false, "Time's up — read the next scenario calmly.");
  }, [timeLeft, phase, gameId, wrongHold, advance]);

  useEffect(() => {
    return () => clearTimer();
  }, []);

  const beginGame = (id: SkillGameId) => {
    clearTimer();
    processing.current = false;
    timedOutIdx.current = null;
    setGameId(id);
    setIdx(0);
    setStreak(0);
    setTotalPoints(0);
    setCorrectCount(0);
    setTimeLeft(maxTimeForGame(id));
    setPhase("play");
    setWrongHold(null);
    timerRef.current = setInterval(() => {
      setTimeLeft((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
  };

  useEffect(() => {
    if (
      !challengeStarted.current &&
      challengeGame &&
      ["medicine", "engineering", "tech"].includes(challengeGame)
    ) {
      challengeStarted.current = true;
      beginGame(challengeGame);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- challenge deep-link once
  }, [challengeGame]);

  const onPick = (optionIndex: number) => {
    if (!gameId || !current || wrongHold || phase !== "play") return;
    const correct = optionIndex === current.correctIndex;
    void advance(correct, correct ? undefined : current.explanation);
  };

  const accuracyPct = scenarios.length
    ? Math.round((correctCount / scenarios.length) * 100)
    : 0;
  const { g, msg } = gradeFromPct(accuracyPct);

  const challengeLink =
    typeof window !== "undefined" && profile?.name && gameId
      ? `${window.location.origin}/skill-games?challenge=${gameId}&score=${totalPoints}&name=${encodeURIComponent(profile.name)}`
      : "";

  const waChallenge =
    challengeLink &&
    gameId &&
    `https://wa.me/?text=${encodeURIComponent(
      `I scored ${totalPoints} in the ${gameLabel(gameId)} skill game on CareerCompass! Can you beat me? ${challengeLink}`,
    )}`;

  const beatBanner =
    challengeScore > 0 &&
    phase === "play" &&
    `Beat ${challengeName}'s score of ${challengeScore}`;

  const winner =
    phase === "result" && challengeScore > 0
      ? totalPoints >= challengeScore
        ? t("skillGames.youWon", { name: challengeName })
        : t("skillGames.youLost", { name: challengeName })
      : null;

  const ring = maxT > 0 ? (timeLeft / maxT) * (2 * Math.PI * 36) : 0;

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-24">
      <h1 className="font-display text-3xl text-white">{t("skillGames.title")}</h1>
      <p className="mt-2 text-white/65">{t("skillGames.subtitle")}</p>

      {beatBanner ? (
        <div className="mt-4 rounded-xl border border-[#FF6B35]/40 bg-[#FF6B35]/10 px-4 py-2 text-center text-sm text-[#FFD60A]">
          {beatBanner}
        </div>
      ) : null}

      {phase === "pick" ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {(["medicine", "engineering", "tech"] as SkillGameId[]).map((id) => (
            <Card
              key={id}
              className="cursor-pointer rounded-2xl border-white/10 bg-[#12121F] transition hover:border-[#FF6B35]/50"
              onClick={() => beginGame(id)}
            >
              <CardHeader>
                <CardTitle className="text-lg text-white">
                  {id === "medicine"
                    ? t("skillGames.medicine")
                    : id === "engineering"
                      ? t("skillGames.engineering")
                      : t("skillGames.tech")}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-white/65">
                {t("skillGames.tapToStart")}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {phase === "play" && gameId && current ? (
        <div className="relative mt-8 space-y-6">
          <AnimatePresence>
            {floatPts ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: -12 }}
                exit={{ opacity: 0 }}
                className="pointer-events-none absolute right-4 top-0 text-lg font-bold text-[#FFD60A]"
              >
                +{floatPts} ⭐
              </motion.div>
            ) : null}
          </AnimatePresence>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="relative h-28 w-28">
              <svg className="h-28 w-28 -rotate-90" viewBox="0 0 80 80">
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="6"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  fill="none"
                  stroke="#FF6B35"
                  strokeWidth="6"
                  strokeDasharray={2 * Math.PI * 36}
                  strokeDashoffset={2 * Math.PI * 36 - ring}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <span className="text-2xl font-bold">{timeLeft}</span>
                <span className="text-[10px] uppercase text-white/50">sec</span>
              </div>
            </div>
            <div className="text-right text-sm text-white/70">
              <p>
                {t("skillGames.streak")}: {streak}
              </p>
              <p>
                {t("skillGames.points")}: {totalPoints}
              </p>
            </div>
          </div>

          <div className="flex justify-center gap-6 text-4xl">
            {gameId === "medicine" ? (
              <>
                <motion.span
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                >
                  📈
                </motion.span>
                <span>🙂</span>
              </>
            ) : null}
            {gameId === "engineering" ? <span className="text-5xl">🏙️</span> : null}
            {gameId === "tech" ? <span className="text-5xl">💡</span> : null}
          </div>

          <Card className="rounded-2xl border-white/10 bg-[#12121F]">
            <CardHeader>
              <CardTitle className="text-base text-white/90">
                {gameLabel(gameId)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-white/85">{current.prompt}</p>
              <div className="grid gap-2">
                {current.options.map((opt, i) => (
                  <Button
                    key={opt}
                    type="button"
                    variant="outline"
                    disabled={Boolean(wrongHold)}
                    className={cn(
                      "justify-start rounded-xl border-white/15 text-left text-white hover:bg-white/10",
                    )}
                    onClick={() => onPick(i)}
                  >
                    {opt}
                  </Button>
                ))}
              </div>
              {wrongHold ? (
                <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-2 text-sm text-amber-100">
                  {wrongHold}
                </p>
              ) : null}
            </CardContent>
          </Card>
        </div>
      ) : null}

      {phase === "result" ? (
        <Card className="mt-10 rounded-2xl border-[#FFD60A]/30 bg-[#12121F]">
          <CardHeader>
            <CardTitle className="font-display text-2xl text-white">
              {t("skillGames.finalTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-white/85">
            <p className="text-4xl font-bold text-[#FFD60A]">{g}</p>
            <p>{msg}</p>
            <p>
              {t("skillGames.scoreLine", {
                pts: totalPoints,
                pct: accuracyPct,
              })}
            </p>
            {winner ? <p className="text-[#FF6B35]">{winner}</p> : null}
            <div className="flex flex-wrap gap-3">
              {waChallenge ? (
                <Link
                  href={waChallenge}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-sm text-white"
                >
                  {t("skillGames.challengeFriend")}
                </Link>
              ) : null}
              <Button
                type="button"
                variant="outline"
                className="rounded-xl border-white/20 text-white"
                onClick={() => {
                  setPhase("pick");
                  setGameId(null);
                  clearTimer();
                }}
              >
                {t("skillGames.playAgain")}
              </Button>
              <Link href="/dashboard" className="text-sm text-[#FFD60A] underline">
                {t("nav.dashboard")}
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
