"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  BookOpen,
  Copy,
  Gamepad2,
  GraduationCap,
  MapPinned,
  MessageCircle,
  Trophy,
  FileText,
  CalendarDays,
  Target,
  Users,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { loadStudentProfile } from "@/lib/student-storage";
import { CAREERS } from "@/lib/careers";
import { cn } from "@/lib/utils";
import DailyMissions from "@/components/DailyMissions";
import { generateDailyMissions } from "@/lib/missions";
import type { Mission } from "@/lib/missions";
import { updateStreak } from "@/lib/streak";

const quickLinks = [
  { href: "/explore", key: "explore", icon: BookOpen },
  { href: "/games", key: "games", icon: Gamepad2 },
  { href: "/chat", key: "chat", icon: MessageCircle },
  { href: "/timetable", key: "timetable", icon: CalendarDays },
  { href: "/scholarships", key: "scholarships", icon: GraduationCap },
  { href: "/colleges", key: "colleges", icon: MapPinned },
  { href: "/skill-games", key: "skillGames", icon: Target },
  { href: "/community", key: "community", icon: Users },
  { href: "/exams", key: "exams", icon: FileText },
];

export default function DashboardPage() {
  const { t } = useTranslation("common");
  const profile = loadStudentProfile();
  const [streakDays, setStreakDays] = useState(profile?.streakDays ?? 0);
  const points = profile?.points ?? 0;
  const level = Math.floor(points / 500) + 1;

  useEffect(() => {
    if (!profile?.id) return;
    void updateStreak(profile.id).then((r) => {
      setStreakDays(r.streakDays);
    });
  }, [profile?.id]);

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "https://careercompass.in";

  const [shareToken, setShareToken] = useState<string | null>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareErr, setShareErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const todayStr = new Date().toISOString().slice(0, 10);
  const [missions, setMissions] = useState<Mission[]>(() =>
    generateDailyMissions(todayStr),
  );

  const featuredCareer = useMemo(() => {
    const idx = new Date().getDate() % CAREERS.length;
    return CAREERS[idx];
  }, []);

  const shareUrl = shareToken
    ? `${baseUrl}/parent?token=${encodeURIComponent(shareToken)}`
    : null;

  const whatsappHref =
    shareUrl &&
    `https://wa.me/?text=${encodeURIComponent(
      `CareerCompass — ಪಾಲಕರು ಈ ಲಿಂಕ್ ಮೂಲಕ ಪ್ರಗತಿ ನೋಡಬಹುದು: ${shareUrl}`,
    )}`;

  const generateParentLink = async () => {
    if (!profile?.id) {
      setShareErr(t("dashboard.shareParent.needProfile"));
      return;
    }
    setShareLoading(true);
    setShareErr(null);
    try {
      const res = await fetch("/api/parent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: profile.id }),
      });
      const data = (await res.json()) as { token?: string; error?: string };
      if (!res.ok || !data.token) {
        setShareErr(data.error ?? t("dashboard.shareParent.generateError"));
        return;
      }
      setShareToken(data.token);
    } catch {
      setShareErr(t("dashboard.shareParent.generateError"));
    } finally {
      setShareLoading(false);
    }
  };

  const copyShareLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* */
    }
  };

  const handleMissionComplete = (missionId: string) => {
    setMissions((prev) =>
      prev.map((m) =>
        m.id === missionId ? { ...m, completed: true } : m,
      ),
    );
  };

  const greeting =
    profile?.language === "kn"
      ? `ನಮಸ್ಕಾರ ${profile?.name ?? ""}! 🙏`
      : profile?.language === "hi"
        ? `नमस्ते ${profile?.name ?? ""}! 🙏`
        : `${t("dashboard.welcome")}, ${profile?.name ?? ""}! 🙏`;

  const dateLine = new Intl.DateTimeFormat(
    profile?.language === "kn" ? "kn-IN" : profile?.language === "hi" ? "hi-IN" : "en-IN",
    { weekday: "long", month: "short", day: "numeric" },
  ).format(new Date());

  const lastCareer = profile?.lastCareerId
    ? CAREERS.find((c) => c.id === profile.lastCareerId)
    : null;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-24">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-display text-3xl text-white sm:text-4xl">
          {greeting}
        </h1>
        <p className="mt-1 text-sm text-white/55">{dateLine}</p>
        <div className="mt-3 flex flex-wrap gap-4 text-sm text-white/75">
          <span className={streakDays > 0 ? "animate-pulse" : ""}>
            🔥 {streakDays} {t("dashboard.dayStreak")}
          </span>
          <span>⭐ {points} pts</span>
          <span>{t("dashboard.level", { n: level })}</span>
        </div>
        <p className="mt-2 text-white/65">{t("dashboard.subtitle")}</p>
      </motion.div>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border border-[#FF6B35]/25 bg-[#12121F]">
          <CardHeader>
            <CardTitle className="font-display text-lg text-white">
              {t("dashboard.continueLabel")}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{lastCareer?.icon ?? "🎯"}</span>
              <div>
                <p className="font-medium text-white">
                  {lastCareer?.name ?? t("nav.explore")}
                </p>
                <p className="text-xs text-white/50">
                  {lastCareer ? lastCareer.avgSalary : t("dashboard.subtitle")}
                </p>
              </div>
            </div>
            <Link
              href={lastCareer ? `/explore?career=${lastCareer.id}` : "/explore"}
              className={cn(
                buttonVariants({ variant: "default", size: "sm" }),
                "rounded-lg bg-[#FF6B35] text-[#080814]",
              )}
            >
              {t("dashboard.resumeCta")}
            </Link>
          </CardContent>
        </Card>
        <DailyMissions missions={missions} onComplete={handleMissionComplete} />
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Careers explored", val: 0 },
          { label: "Games played", val: 0 },
          { label: "Day streak", val: streakDays, suffix: "🔥" },
          { label: "Points", val: points, suffix: "⭐" },
        ].map((x) => (
          <Card key={x.label} className="rounded-2xl border-white/10 bg-[#12121F]">
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-wide text-white/45">{x.label}</p>
              <p className="mt-1 font-display text-2xl text-white">
                {x.val}
                {x.suffix ? ` ${x.suffix}` : ""}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border-white/10 bg-[#12121F]">
          <CardHeader>
            <CardTitle className="font-display text-lg text-white">
              {t("dashboard.featuredCareer")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{featuredCareer.icon}</span>
              <div>
                <p className="font-display text-lg text-white">{featuredCareer.name}</p>
                <p className="text-sm text-white/60">
                  {featuredCareer.avgSalary} · {featuredCareer.stream}
                </p>
              </div>
            </div>
            <p className="text-sm text-white/70">{featuredCareer.description}</p>
            <Link
              href={`/explore`}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "rounded-lg border-[#FF6B35]/40 text-[#FF6B35]",
              )}
            >
              {t("explore.openCareer")}
            </Link>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-white/10 bg-[#12121F]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-lg text-white">
              <Trophy className="h-5 w-5 text-[#FFD60A]" />
              {t("dashboard.leaderboardPreview")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-white/70">
              {t("dashboard.leaderboardCta", {
                rank: 47,
                city: profile?.city ?? "Bengaluru",
              })}
            </p>
            <Link
              href="/leaderboard"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "rounded-lg border-[#FFD60A]/40 text-[#FFD60A]",
              )}
            >
              {t("nav.leaderboard")}
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quickLinks.map((tile, idx) => (
          <motion.div
            key={tile.href}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
          >
            <Link
              href={tile.href}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "flex h-full min-h-[100px] w-full flex-col items-start justify-between rounded-2xl border-white/10 bg-[#12121F] p-5 text-left shadow-glow hover:border-[#FF6B35]/40 hover:bg-[#12121F]",
              )}
            >
              <tile.icon className="h-6 w-6 text-[#FFD60A]" />
              <span className="font-display text-base text-white">
                {t(`nav.${tile.key}`)}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>

      <Card className="mb-8 rounded-2xl border border-[#FFD60A]/25 bg-[#12121F]">
        <CardHeader>
          <CardTitle className="font-display text-xl text-white">
            {t("dashboard.shareParent.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-white/75">
          <p>{t("dashboard.shareParent.desc")}</p>
          {shareErr ? (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-red-200">
              {shareErr}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              className="rounded-lg bg-[#FF6B35] text-[#080814] hover:bg-[#ff844f]"
              disabled={shareLoading}
              onClick={() => void generateParentLink()}
            >
              {shareLoading ? t("common.loading") : t("dashboard.shareParent.cta")}
            </Button>
            {shareUrl ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-lg border-white/15 text-white hover:bg-white/10"
                  onClick={() => void copyShareLink()}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  {copied ? t("dashboard.shareParent.copied") : t("dashboard.shareParent.copy")}
                </Button>
                {whatsappHref ? (
                  <Link
                    href={whatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "default" }),
                      "rounded-lg border-emerald-500/40 text-emerald-200 hover:bg-emerald-500/10",
                    )}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    {t("dashboard.shareParent.whatsapp")}
                  </Link>
                ) : null}
              </>
            ) : null}
          </div>
          {shareUrl ? (
            <p className="break-all rounded-xl bg-black/30 px-3 py-2 font-mono text-xs text-white/80">
              {shareUrl}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-dashed border-[#FFD60A]/35 bg-[#12121F]/60">
        <CardHeader>
          <CardTitle className="font-display text-xl text-white">
            {t("dashboard.payments.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-white/75">
          <p>{t("dashboard.payments.body")}</p>
          <Link
            href="/pricing"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "rounded-lg border-[#FFD60A]/40 text-[#FFD60A]",
            )}
          >
            {t("nav.pricing")}
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
