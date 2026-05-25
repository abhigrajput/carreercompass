"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildSignedHeaders } from "@/lib/client-api";
import { shareContent } from "@/lib/share";
import { loadStudentProfile } from "@/lib/student-storage";
import {
  getChallengeStorageKey,
  getCurrentWeekChallenge,
  getNextMonday,
  getWeekStart,
} from "@/lib/weekly-challenges";
import { cn } from "@/lib/utils";

type LeaderboardEntry = {
  name: string;
  city: string;
  points: number;
};

function loadCompletedTasks(storageKey: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export default function ChallengePage() {
  const profile = loadStudentProfile();
  const challenge = getCurrentWeekChallenge();
  const storageKey = getChallengeStorageKey();
  const weekStart = getWeekStart().toISOString().slice(0, 10);
  const [completed, setCompleted] = useState<string[]>([]);
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    setCompleted(loadCompletedTasks(storageKey));
  }, [storageKey]);

  useEffect(() => {
    void fetch("/api/challenge-completions?weekOffset=1")
      .then((res) => res.json())
      .then((data: { entries?: LeaderboardEntry[] }) => {
        setLeaders(data.entries ?? []);
      })
      .catch(() => {
        setLeaders([]);
      });
  }, []);

  const earnedPoints = useMemo(
    () =>
      challenge.tasks
        .filter((task) => completed.includes(task.id))
        .reduce((sum, task) => sum + task.points, 0),
    [challenge.tasks, completed],
  );

  const nextReset = useMemo(() => {
    const diff = getNextMonday().getTime() - Date.now();
    const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
    const hours = Math.max(0, Math.floor((diff / (1000 * 60 * 60)) % 24));
    return `${days}d ${hours}h`;
  }, []);

  async function syncCompletion(nextCompleted: string[]) {
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, JSON.stringify(nextCompleted));
    }

    if (profile?.id && profile.authToken) {
      const payload = {
        weekStart,
        theme: challenge.weekTheme,
        careerFocus: challenge.careerFocus,
        tasksCompleted: nextCompleted,
        pointsEarned: challenge.tasks
          .filter((task) => nextCompleted.includes(task.id))
          .reduce((sum, task) => sum + task.points, 0),
      };
      const headers = await buildSignedHeaders(payload);
      await fetch("/api/challenge-completions", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
    }
  }

  async function toggleTask(taskId: string) {
    const nextCompleted = completed.includes(taskId)
      ? completed.filter((id) => id !== taskId)
      : [...completed, taskId];
    setCompleted(nextCompleted);
    await syncCompletion(nextCompleted);
  }

  async function shareChallenge() {
    const text = `This week on CareerCompass: ${challenge.weekTheme}. Can you complete all 3 tasks and earn ${challenge.badge}?`;
    await shareContent(
      "CareerCompass Weekly Challenge",
      text,
      `${window.location.origin}/challenge`,
    );
  }

  return (
    <div className="min-h-screen bg-[#080814] px-4 pb-16 pt-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2.6, repeat: Infinity }}
            className="mb-4 text-6xl"
          >
            {challenge.icon}
          </motion.div>
          <h1 className="font-display text-4xl text-white">
            This Week&apos;s Challenge: {challenge.weekTheme}
          </h1>
          <p className="mt-2 text-white/60">
            Complete all 3 to earn {challenge.badge}
          </p>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <Card className="rounded-2xl border-white/10 bg-[#12121F] md:col-span-2">
            <CardContent className="p-5">
              <div className="mb-3 flex items-center justify-between gap-4">
                <p className="text-sm text-white/65">
                  {completed.length}/3 tasks complete — {earnedPoints}/{challenge.totalPoints} points earned
                </p>
                <p className="text-xs text-white/45">Resets in {nextReset}</p>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#FF6B35] to-[#FFD60A]"
                  style={{ width: `${(completed.length / challenge.tasks.length) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-white/10 bg-[#12121F]">
            <CardContent className="flex h-full flex-col justify-center gap-3 p-5">
              <p className="text-sm text-white/65">Share this challenge with a friend</p>
              <Button
                type="button"
                onClick={() => void shareChallenge()}
                className="rounded-xl bg-[#FF6B35] text-[#080814] hover:bg-[#ff844f]"
              >
                Share challenge
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            {challenge.tasks.map((task, index) => {
              const done = completed.includes(task.id);
              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                >
                  <Card className="rounded-2xl border-white/10 bg-[#12121F]">
                    <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-4">
                        <button
                          type="button"
                          onClick={() => void toggleTask(task.id)}
                          className={`mt-1 flex h-7 w-7 items-center justify-center rounded-full border ${
                            done
                              ? "border-[#FF6B35] bg-[#FF6B35] text-[#080814]"
                              : "border-white/20 text-white/50"
                          }`}
                        >
                          {done ? "✓" : ""}
                        </button>
                        <div>
                          <p className="font-display text-lg text-white">{task.label}</p>
                          <p className="mt-1 text-sm text-white/55">
                            +{task.points} points
                            {task.count ? ` · ${task.count} actions` : ""}
                          </p>
                        </div>
                      </div>
                      <Link
                        href={task.link}
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" }),
                          "rounded-lg border-[#FF6B35]/30 text-[#FF6B35]",
                        )}
                      >
                        Open task
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <Card className="rounded-2xl border-white/10 bg-[#12121F]">
            <CardHeader>
              <CardTitle className="text-white">Previous week&apos;s top completers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {leaders.length > 0 ? (
                leaders.map((entry, index) => (
                  <div
                    key={`${entry.name}-${index}`}
                    className="flex items-center justify-between rounded-xl bg-black/20 p-3"
                  >
                    <div>
                      <p className="text-sm text-white">{entry.name}</p>
                      <p className="text-xs text-white/45">{entry.city}</p>
                    </div>
                    <p className="text-sm text-[#FFD60A]">{entry.points} pts</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-white/50">
                  This leaderboard will appear once completions are synced.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
