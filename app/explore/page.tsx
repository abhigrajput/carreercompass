"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { CareerCard } from "@/components/CareerCard";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CAREERS } from "@/lib/careers";
import { careerDisplayName } from "@/lib/career-utils";
import { loadStudentProfile, saveStudentProfile } from "@/lib/student-storage";
import { cn } from "@/lib/utils";
import type { CareerItem, LocaleCode } from "@/types";

type FilterKey =
  | "all"
  | "tech"
  | "medicine"
  | "engineering"
  | "creative"
  | "government"
  | "commerce";

function matchesFilter(filter: FilterKey, career: CareerItem) {
  if (filter === "all") {
    return true;
  }
  const d = career.domain;
  switch (filter) {
    case "tech":
      return d === "tech";
    case "medicine":
      return d === "medicine" || d === "healthcare";
    case "engineering":
      return d === "engineering" || d === "aviation" || d === "science";
    case "creative":
      return d === "creative" || d === "media" || d === "education";
    case "government":
      return d === "government" || d === "law";
    case "commerce":
      return d === "commerce" || d === "business";
    default:
      return true;
  }
}

export default function ExplorePage() {
  const { t, i18n } = useTranslation("common");
  const searchParams = useSearchParams();
  const profile = loadStudentProfile();
  const lang = (profile?.language ??
    (i18n.language as LocaleCode) ??
    "en") as LocaleCode;

  const [filter, setFilter] = useState<FilterKey>("all");
  const [active, setActive] = useState<CareerItem | null>(null);
  const [aiText, setAiText] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const filtered = useMemo(
    () => CAREERS.filter((c) => matchesFilter(filter, c)),
    [filter],
  );

  const loadAi = async (career: CareerItem) => {
    setAiLoading(true);
    setAiError(null);
    setAiText(null);
    try {
      const res = await fetch("/api/career-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ careerId: career.id, language: lang }),
      });
      const data = (await res.json()) as { content?: string; error?: string };
      if (!res.ok || !data.content) {
        const msg =
          typeof data.error === "string" && data.error.length > 0
            ? data.error
            : t("explore.errorAi");
        setAiError(msg);
        return;
      }
      setAiText(data.content);
    } catch {
      setAiError(t("explore.errorAi"));
    } finally {
      setAiLoading(false);
    }
  };

  const openCareer = (career: CareerItem) => {
    setActive(career);
    void loadAi(career);
    if (profile) {
      saveStudentProfile({ ...profile, lastCareerId: career.id });
    }
  };

  useEffect(() => {
    const raw = searchParams.get("career") ?? "";
    const id = raw.replace(/[^a-z0-9-_]/gi, "").slice(0, 100);
    if (!id) return;
    const c = CAREERS.find((x) => x.id === id);
    if (c) {
      openCareer(c);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open once when query present
  }, [searchParams]);

  const filters: FilterKey[] = [
    "all",
    "tech",
    "medicine",
    "engineering",
    "creative",
    "government",
    "commerce",
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-24">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-4xl text-white">{t("explore.title")}</h1>
          <p className="text-white/65">{t("explore.subtitle")}</p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {filters.map((key) => (
          <Button
            key={key}
            type="button"
            size="sm"
            variant={filter === key ? "default" : "outline"}
            className={
              filter === key
                ? "rounded-full bg-[#FF6B35] text-[#080814]"
                : "rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10"
            }
            onClick={() => setFilter(key)}
          >
            {t(`explore.filters.${key === "all" ? "all" : key}`)}
          </Button>
        ))}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((career) => (
          <CareerCard
            key={career.id}
            career={career}
            lang={lang}
            onOpen={() => openCareer(career)}
          />
        ))}
      </div>

      <Dialog
        open={!!active}
        onOpenChange={(open) => {
          if (!open) {
            setActive(null);
            setAiText(null);
            setAiError(null);
          }
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto rounded-2xl border-white/10 bg-[#12121F] text-white">
          {active ? (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">
                  <span className="mr-2 text-3xl">{active.icon}</span>
                  {careerDisplayName(active, lang)}
                </DialogTitle>
                <DialogDescription className="text-white/60">
                  {active.avgSalary} · {active.stream}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 text-sm leading-relaxed text-white/80">
                <div>
                  <p className="mb-2 text-xs uppercase tracking-[0.25em] text-[#FFD60A]">
                    {t("explore.aiDescription")}
                  </p>
                  {aiLoading ? (
                    <div className="flex items-center gap-2 text-white/70">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("explore.loadingAi")}
                    </div>
                  ) : aiError ? (
                    <p className="text-red-300">{aiError}</p>
                  ) : (
                    <p className="whitespace-pre-line">{aiText}</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/games?career=${active.id}`}
                    className={cn(
                      buttonVariants({ variant: "default" }),
                      "rounded-xl bg-[#FF6B35] text-[#080814] hover:bg-[#ff844f]",
                    )}
                  >
                    {t("explore.testAbility")}
                  </Link>
                  <Link
                    href={`/roadmap?career=${active.id}`}
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "rounded-xl border-[#FFD60A]/40 text-[#FFD60A]",
                    )}
                  >
                    {t("explore.roadmap")}
                  </Link>
                </div>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
