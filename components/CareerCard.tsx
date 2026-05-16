"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import type { CareerItem, LocaleCode } from "@/types";
import { careerDisplayName } from "@/lib/career-utils";
import { cn } from "@/lib/utils";

const DOMAIN_STYLES: Record<string, string> = {
  tech: "border-blue-400/40 bg-blue-500/15 text-blue-200",
  medicine: "border-emerald-400/40 bg-emerald-500/15 text-emerald-200",
  law: "border-amber-400/40 bg-amber-500/15 text-amber-100",
  design: "border-pink-400/40 bg-pink-500/15 text-pink-100",
  business: "border-violet-400/40 bg-violet-500/15 text-violet-100",
};

export function CareerCard({
  career,
  lang,
  onOpen,
}: {
  career: CareerItem;
  lang: LocaleCode;
  onOpen: () => void;
}) {
  const { t } = useTranslation("common");
  const domainStyle =
    DOMAIN_STYLES[career.domain.toLowerCase()] ??
    "border-white/20 bg-white/5 text-white/80";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.25 }}
      className="mx-auto h-[180px] w-full max-w-[280px]"
    >
      <div
        className={cn(
          "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#12121F] p-4 shadow-glow transition-shadow duration-300",
          "hover:border-[#FF6B35]/40 hover:shadow-[0_8px_30px_rgba(255,107,53,0.3)]",
        )}
      >
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FF6B35]/25 text-2xl">
            {career.icon}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display text-lg leading-tight text-white">
              <span className={lang === "kn" ? "font-kannada" : ""}>
                {careerDisplayName(career, lang)}
              </span>
            </p>
            <Badge
              className={cn(
                "mt-1 rounded-full border px-2 py-0 text-[10px] uppercase tracking-wide",
                domainStyle,
              )}
            >
              {career.domain}
            </Badge>
          </div>
        </div>
        <p className="mt-2 text-sm font-medium text-emerald-300">{career.avgSalary}</p>
        <p className="mt-1 text-[11px] text-white/50">
          {career.stream === "any" ? "Any stream" : career.stream}
        </p>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-[#12121F] via-[#12121F] to-transparent p-3 pt-8 opacity-0 transition group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
          <Link
            href={`/explore?career=${encodeURIComponent(career.id)}`}
            onClick={(e) => {
              e.stopPropagation();
              onOpen();
            }}
            className="block w-full rounded-lg bg-[#FF6B35] py-2 text-center text-sm font-medium text-[#080814] transition hover:bg-[#ff844f]"
          >
            {t("explore.openCareer")} →
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
