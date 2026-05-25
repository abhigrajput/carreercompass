"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildSignedHeaders } from "@/lib/client-api";
import { getStudyQuote } from "@/lib/study-quotes";
import { loadStudentProfile } from "@/lib/student-storage";
import type { LocaleCode } from "@/types";

type TimerState = "idle" | "studying" | "break" | "paused";

type StoredSession = {
  subject: string;
  durationMinutes: number;
  createdAt: string;
};

const STORAGE_KEY = "cc_study_sessions_v1";
const SUBJECTS = [
  "Physics",
  "Chemistry",
  "Maths",
  "Biology",
  "English",
  "History",
  "Computer Science",
  "Other",
] as const;

const SUBJECT_COLORS: Record<(typeof SUBJECTS)[number], string> = {
  Physics: "bg-blue-500/15 text-blue-200 border-blue-500/30",
  Chemistry: "bg-emerald-500/15 text-emerald-200 border-emerald-500/30",
  Maths: "bg-orange-500/15 text-orange-200 border-orange-500/30",
  Biology: "bg-lime-500/15 text-lime-200 border-lime-500/30",
  English: "bg-violet-500/15 text-violet-200 border-violet-500/30",
  History: "bg-amber-500/15 text-amber-200 border-amber-500/30",
  "Computer Science": "bg-cyan-500/15 text-cyan-200 border-cyan-500/30",
  Other: "bg-white/10 text-white/80 border-white/15",
};

const STUDY_SECONDS = 25 * 60;
const BREAK_SECONDS = 5 * 60;
const CIRCLE_RADIUS = 112;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

function loadSessions(): StoredSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as StoredSession[];
  } catch {
    return [];
  }
}

function saveSessions(sessions: StoredSession[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

function formatSeconds(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function playChime() {
  if (typeof window === "undefined") return;
  const webkitAudioContext = (
    window as unknown as { webkitAudioContext?: typeof AudioContext }
  ).webkitAudioContext;
  const AudioContextCtor = window.AudioContext || webkitAudioContext;
  if (!AudioContextCtor) return;
  const ctx = new AudioContextCtor();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = 528;
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 1.5);
}

function requestNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission === "default") {
    void Notification.requestPermission();
  }
}

function showBrowserNotification(title: string, body: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission === "granted") {
    new Notification(title, { body });
  }
}

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function localLabels(language: LocaleCode) {
  if (language === "kn") {
    return {
      title: "Study Timer",
      subtitle: "ಗಮನ ಕೇಂದ್ರೀಕರಿಸಿ, 25 ನಿಮಿಷ ಓದಿ, ನಂತರ ವಿಶ್ರಾಂತಿ ತೆಗೆದುಕೊಳ್ಳಿ.",
      start: "ಪ್ರಾರಂಭಿಸಿ",
      pause: "ವಿರಾಮ",
      reset: "ಮರುಹೊಂದಿಸಿ",
      skipBreak: "ಬ್ರೇಕ್ ಮುಗಿಸಿ",
      studying: "ಓದು",
      onBreak: "ಬ್ರೇಕ್",
      idle: "ಸಿದ್ಧ",
      paused: "ನಿಲ್ಲಿಸಲಾಗಿದೆ",
      today: "ಇಂದು",
      weekly: "ಕೊನೆಯ 7 ದಿನಗಳು",
      sessions: "ಸೆಷನ್‌ಗಳು",
      stats: "ಇಂದು {{hours}}m across {{count}} sessions",
      counter: "Pomodoro {{current}} of 4",
      quote: "ಇಂದಿನ ಪ್ರೇರಣೆ",
    };
  }
  if (language === "hi") {
    return {
      title: "Study Timer",
      subtitle: "25 मिनट फोकस से पढ़ो, फिर छोटा ब्रेक लो।",
      start: "शुरू करें",
      pause: "रोकें",
      reset: "रीसेट",
      skipBreak: "ब्रेक छोड़ें",
      studying: "पढ़ाई",
      onBreak: "ब्रेक",
      idle: "तैयार",
      paused: "रुका हुआ",
      today: "आज",
      weekly: "पिछले 7 दिन",
      sessions: "सेशन",
      stats: "आज {{hours}}m across {{count}} sessions",
      counter: "Pomodoro {{current}} of 4",
      quote: "आज की प्रेरणा",
    };
  }
  return {
    title: "Study Timer",
    subtitle: "Focus for 25 minutes, then take a short break.",
    start: "Start",
    pause: "Pause",
    reset: "Reset",
    skipBreak: "Skip Break",
    studying: "Studying",
    onBreak: "Break",
    idle: "Ready",
    paused: "Paused",
    today: "Today",
    weekly: "Last 7 days",
    sessions: "sessions",
    stats: "Studied {{hours}}m across {{count}} sessions",
    counter: "Pomodoro {{current}} of 4",
    quote: "Motivational quote",
  };
}

export default function StudyTimerPage() {
  const profile = loadStudentProfile();
  const language = (profile?.language ?? "en") as LocaleCode;
  const labels = localLabels(language);

  const [timerState, setTimerState] = useState<TimerState>("idle");
  const [secondsLeft, setSecondsLeft] = useState(STUDY_SECONDS);
  const [subject, setSubject] =
    useState<(typeof SUBJECTS)[number]>("Physics");
  const [sessions, setSessions] = useState<StoredSession[]>([]);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [lastActiveState, setLastActiveState] =
    useState<Extract<TimerState, "studying" | "break">>("studying");
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setSessions(loadSessions());
  }, []);

  useEffect(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }

    if (timerState === "studying" || timerState === "break") {
      tickRef.current = setInterval(() => {
        setSecondsLeft((current) => {
          if (current <= 1) {
            return 0;
          }
          return current - 1;
        });
      }, 1000);
    }

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [timerState]);

  useEffect(() => {
    if (secondsLeft !== 0) return;
    if (timerState === "studying") {
      playChime();
      showBrowserNotification("Study session complete", `Time for a short ${subject} break.`);

      const nextSession: StoredSession = {
        subject,
        durationMinutes: 25,
        createdAt: new Date().toISOString(),
      };
      const nextSessions = [nextSession, ...sessions];
      setSessions(nextSessions);
      saveSessions(nextSessions);

      const signedStudyPayload = {
        studentId: profile?.id ?? null,
        subject,
        durationMinutes: 25,
        sessionDate: nextSession.createdAt.slice(0, 10),
      };
      const pointsPayload = {
        studentId: profile?.id ?? null,
        action: "complete_pomodoro",
      };

      if (profile?.id && profile.authToken) {
        void (async () => {
          const studyHeaders = await buildSignedHeaders(signedStudyPayload);
          await fetch("/api/study-sessions", {
            method: "POST",
            headers: studyHeaders,
            body: JSON.stringify(signedStudyPayload),
          });
        })().catch(() => {
          /* optional */
        });

        void (async () => {
          const pointHeaders = await buildSignedHeaders(pointsPayload);
          await fetch("/api/points", {
            method: "POST",
            headers: pointHeaders,
            body: JSON.stringify(pointsPayload),
          });
        })().catch(() => {
          /* optional */
        });
      }

      setTimerState("break");
      setLastActiveState("break");
      setSecondsLeft(BREAK_SECONDS);
      return;
    }

    if (timerState === "break") {
      playChime();
      showBrowserNotification("Break complete", "Ready for your next focused study sprint.");
      setTimerState("idle");
      setLastActiveState("studying");
      setSecondsLeft(STUDY_SECONDS);
    }
  }, [profile?.authToken, profile?.id, secondsLeft, sessions, subject, timerState]);

  const todaySessions = useMemo(() => {
    const today = startOfDay(new Date()).getTime();
    return sessions.filter(
      (session) => startOfDay(new Date(session.createdAt)).getTime() === today,
    );
  }, [sessions]);

  const todayMinutes = todaySessions.reduce(
    (sum, session) => sum + session.durationMinutes,
    0,
  );

  const weeklyStats = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      const dayKey = date.toISOString().slice(0, 10);
      const minutes = sessions
        .filter((session) => session.createdAt.slice(0, 10) === dayKey)
        .reduce((sum, session) => sum + session.durationMinutes, 0);

      return {
        day: date.toLocaleDateString(language === "kn" ? "kn-IN" : language === "hi" ? "hi-IN" : "en-IN", {
          weekday: "short",
        }),
        minutes,
      };
    });
  }, [language, sessions]);

  const progressTotal =
    timerState === "break"
      ? BREAK_SECONDS
      : timerState === "paused" && lastActiveState === "break"
        ? BREAK_SECONDS
        : STUDY_SECONDS;

  const progressFraction = (progressTotal - secondsLeft) / progressTotal;
  const dashOffset =
    CIRCLE_CIRCUMFERENCE - CIRCLE_CIRCUMFERENCE * progressFraction;
  const quote = getStudyQuote(language, quoteIndex);
  const currentPomodoro = Math.min((todaySessions.length % 4) + 1, 4);

  function startTimer() {
    requestNotificationPermission();
    setTimerState("studying");
    setLastActiveState("studying");
    setQuoteIndex((current) => current + 1);
    if (secondsLeft === 0 || secondsLeft === BREAK_SECONDS) {
      setSecondsLeft(STUDY_SECONDS);
    }
  }

  function pauseTimer() {
    if (timerState === "studying" || timerState === "break") {
      setLastActiveState(timerState);
      setTimerState("paused");
    } else if (timerState === "paused") {
      setTimerState(lastActiveState);
    }
  }

  function resetTimer() {
    setTimerState("idle");
    setLastActiveState("studying");
    setSecondsLeft(STUDY_SECONDS);
  }

  function skipBreak() {
    setTimerState("idle");
    setLastActiveState("studying");
    setSecondsLeft(STUDY_SECONDS);
  }

  return (
    <div className="min-h-screen bg-[#080814] px-4 pb-16 pt-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="font-display text-4xl text-white">{labels.title}</h1>
          <p className="mt-2 text-white/65">{labels.subtitle}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="rounded-3xl border-white/10 bg-[#12121F]">
            <CardContent className="p-6 sm:p-8">
              <div className="mb-6 flex flex-wrap gap-2">
                {SUBJECTS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setSubject(item)}
                    className={`rounded-full border px-4 py-2 text-sm transition ${
                      subject === item
                        ? SUBJECT_COLORS[item]
                        : "border-white/10 bg-black/20 text-white/70"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="flex flex-col items-center justify-center">
                <div className="relative mb-6 h-[260px] w-[260px]">
                  <svg viewBox="0 0 260 260" className="h-full w-full -rotate-90">
                    <circle
                      cx="130"
                      cy="130"
                      r={CIRCLE_RADIUS}
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth="14"
                      fill="none"
                    />
                    <circle
                      cx="130"
                      cy="130"
                      r={CIRCLE_RADIUS}
                      stroke={
                        timerState === "break" ||
                        (timerState === "paused" && lastActiveState === "break")
                          ? "#22c55e"
                          : "#FF6B35"
                      }
                      strokeWidth="14"
                      strokeLinecap="round"
                      fill="none"
                      strokeDasharray={CIRCLE_CIRCUMFERENCE}
                      strokeDashoffset={dashOffset}
                      className="transition-[stroke-dashoffset] duration-700 ease-linear"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-sm uppercase tracking-[0.28em] text-white/45">
                      {timerState === "studying"
                        ? labels.studying
                        : timerState === "break"
                          ? labels.onBreak
                          : timerState === "paused"
                            ? labels.paused
                            : labels.idle}
                    </p>
                    <p className="mt-2 font-display text-6xl text-white">
                      {formatSeconds(secondsLeft)}
                    </p>
                    <p className="mt-3 text-sm text-white/60">
                      {labels.counter.replace("{{current}}", String(currentPomodoro))}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-3">
                  <Button
                    type="button"
                    onClick={startTimer}
                    disabled={timerState === "studying" || timerState === "break"}
                    className="rounded-xl bg-[#FF6B35] px-6 text-[#080814] hover:bg-[#ff844f]"
                  >
                    {labels.start}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={pauseTimer}
                    disabled={timerState === "idle"}
                    className="rounded-xl border-white/15 text-white"
                  >
                    {labels.pause}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetTimer}
                    className="rounded-xl border-white/15 text-white"
                  >
                    {labels.reset}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={skipBreak}
                    disabled={timerState !== "break" && lastActiveState !== "break"}
                    className="rounded-xl border-emerald-500/30 text-emerald-200"
                  >
                    {labels.skipBreak}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="rounded-3xl border-white/10 bg-[#12121F]">
              <CardHeader>
                <CardTitle className="text-white">{labels.quote}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-white/85">{quote}</p>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-white/10 bg-[#12121F]">
              <CardHeader>
                <CardTitle className="text-white">{labels.today}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-white/75">
                <p>
                  {labels.stats
                    .replace("{{hours}}", `${todayMinutes}`)
                    .replace("{{count}}", `${todaySessions.length}`)}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-black/25 p-4">
                    <p className="text-xs text-white/45">Completed</p>
                    <p className="mt-1 text-2xl text-white">{todaySessions.length}</p>
                  </div>
                  <div className="rounded-2xl bg-black/25 p-4">
                    <p className="text-xs text-white/45">Minutes</p>
                    <p className="mt-1 text-2xl text-white">{todayMinutes}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-white/10 bg-[#12121F]">
              <CardHeader>
                <CardTitle className="text-white">{labels.weekly}</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyStats}>
                    <XAxis dataKey="day" tick={{ fill: "#aaa", fontSize: 12 }} />
                    <YAxis tick={{ fill: "#aaa", fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="minutes" fill="#FF6B35" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
