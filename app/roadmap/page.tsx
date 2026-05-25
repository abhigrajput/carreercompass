"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Printer, Share2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { RoadmapTimeline } from "@/components/RoadmapTimeline";
import { Button } from "@/components/ui/button";
import { CAREERS } from "@/lib/careers";
import { shareContent } from "@/lib/share";
import { loadStudentProfile } from "@/lib/student-storage";
import type { LocaleCode, RoadmapPayload } from "@/types";

function RoadmapInner() {
  const { t, i18n } = useTranslation("common");
  const params = useSearchParams();
  const rawCareer = params.get("career") ?? "";
  const careerId = rawCareer.replace(/[^a-z0-9-_]/gi, "").slice(0, 100);
  const profile = loadStudentProfile();
  const lang = (profile?.language ??
    (i18n.language as LocaleCode) ??
    "en") as LocaleCode;

  const career = useMemo(() => {
    return (
      CAREERS.find((c) => c.id === careerId) ??
      (profile?.knownGoal
        ? {
            id: "from-goal",
            name: profile.knownGoal,
            domain: "general",
          }
        : null)
    );
  }, [careerId, profile?.knownGoal]);

  const [data, setData] = useState<RoadmapPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!career) {
      return;
    }
    const ctrl = new AbortController();
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/roadmap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            career,
            studentClass: profile?.class ?? "10",
            city: profile?.city ?? "bengaluru",
            language: lang,
          }),
          signal: ctrl.signal,
        });
        const json = (await res.json()) as {
          roadmap?: RoadmapPayload;
          error?: string;
        };
        if (!res.ok || !json.roadmap) {
          throw new Error(json.error ?? "fail");
        }
        setData(json.roadmap);
      } catch (err) {
        if (!ctrl.signal.aborted) {
          const msg =
            err instanceof Error ? err.message : t("roadmap.error");
          setError(msg);
        }
      } finally {
        if (!ctrl.signal.aborted) {
          setLoading(false);
        }
      }
    })();
    return () => ctrl.abort();
  }, [career, lang, profile?.class, profile?.city, t]);

  const shareWhatsApp = async () => {
    if (!data || !career) {
      return;
    }
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
      (typeof window !== "undefined" ? window.location.origin : "");
    const roadmapUrl = `${baseUrl}/roadmap?career=${encodeURIComponent(career.id)}`;
    const studentName = profile?.name ?? "Student";
    const text = `CareerCompass ನಲ್ಲಿ ${studentName} ಅವರ ವೃತ್ತಿ ಯೋಜನೆ: ${career.name}. 90-ದಿನದ ರೋಡ್‌ಮ್ಯಾಪ್ ನೋಡಲು: ${roadmapUrl}`;
    await shareContent("CareerCompass Roadmap", text, roadmapUrl);
  };

  const printPdf = () => {
    window.print();
  };

  if (!career) {
    return (
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-24 text-center">
        <p className="text-white/75">{t("roadmap.noCareer")}</p>
        <Link
          href="/explore"
          className="mt-4 inline-block text-[#FFD60A] underline-offset-4 hover:underline"
        >
          {t("nav.explore")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 pt-24">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-4xl text-white">{t("roadmap.title")}</h1>
          <p className="text-white/65">{t("roadmap.subtitle")}</p>
          <p className="mt-2 text-sm text-white/50">
            {career.name} · Class {profile?.class ?? "10"} · {profile?.city ?? "bengaluru"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 print:hidden">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10"
            onClick={() => void shareWhatsApp()}
            disabled={!data}
          >
            <Share2 className="mr-2 h-4 w-4" />
            {t("roadmap.whatsapp")}
          </Button>
          <Button
            type="button"
            className="rounded-xl bg-[#FFD60A] text-[#080814] hover:bg-[#ffe566]"
            onClick={printPdf}
            disabled={!data}
          >
            <Printer className="mr-2 h-4 w-4" />
            {t("roadmap.pdf")}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-white/70">
          <Loader2 className="h-5 w-5 animate-spin" />
          {t("roadmap.loading")}
        </div>
      ) : error ? (
        <p className="text-red-300">{error}</p>
      ) : data ? (
        <div
          id="roadmap-print"
          className="roadmap-print-root space-y-8 text-white print:bg-white print:text-black"
        >
          <RoadmapTimeline data={data} />
        </div>
      ) : null}
    </div>
  );
}

export default function RoadmapPage() {
  const { t } = useTranslation("common");
  return (
    <Suspense
      fallback={
        <div className="px-4 pt-24 text-white/70">{t("common.loading")}</div>
      }
    >
      <RoadmapInner />
    </Suspense>
  );
}
