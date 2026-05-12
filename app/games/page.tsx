"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { GameEngine } from "@/components/GameEngine";
import { CAREERS } from "@/lib/careers";
import { careerDisplayName } from "@/lib/career-utils";
import { loadStudentProfile } from "@/lib/student-storage";
import type { LocaleCode } from "@/types";

function GamesContent() {
  const { t, i18n } = useTranslation("common");
  const params = useSearchParams();
  const careerId = params.get("career") ?? "";
  const profile = loadStudentProfile();
  const lang = (profile?.language ??
    (i18n.language as LocaleCode) ??
    "en") as LocaleCode;

  const career = CAREERS.find((c) => c.id === careerId);

  if (!careerId || !career) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-display text-2xl text-white">
            {t("games.pickCareer")}
          </h2>
          <p className="text-sm text-white/65">{t("games.pickSubtitle")}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {CAREERS.slice(0, 24).map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
            >
              <Link
                href={`/games?career=${c.id}`}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#12121F] p-4 text-left shadow-glow transition hover:border-[#FF6B35]/40"
              >
                <span className="text-2xl">{c.icon}</span>
                <div>
                  <p className="font-medium text-white">
                    {careerDisplayName(c, lang)}
                  </p>
                  <p className="text-xs text-white/50">{c.domain}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return <GameEngine profile={profile} career={career} />;
}

export default function GamesPage() {
  const { t } = useTranslation("common");

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-24">
      <div className="mb-6">
        <h1 className="font-display text-4xl text-white">{t("games.title")}</h1>
        <p className="text-white/65">{t("games.subtitle")}</p>
      </div>
      <Suspense
        fallback={
          <p className="text-sm text-white/60">{t("common.loading")}</p>
        }
      >
        <GamesContent />
      </Suspense>
    </div>
  );
}
