"use client";

import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { CareerItem, LocaleCode } from "@/types";
import { careerDisplayName } from "@/lib/career-utils";

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
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35 }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Card className="group h-full overflow-hidden rounded-2xl border-white/10 bg-[#12121F] shadow-glow transition hover:border-[#FF6B35]/40">
        <CardHeader className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <span className="text-3xl drop-shadow-glow">{career.icon}</span>
            <Badge className="rounded-full border border-[#FFD60A]/30 bg-[#FFD60A]/10 text-[11px] uppercase tracking-wide text-[#FFD60A]">
              {career.domain}
            </Badge>
          </div>
          <CardTitle className="font-display text-xl text-white">
            <span className={lang === "kn" ? "font-kannada" : ""}>
              {careerDisplayName(career, lang)}
            </span>
          </CardTitle>
          <p className="text-sm text-white/60">{career.avgSalary}</p>
        </CardHeader>
        <CardContent>
          <p className="line-clamp-3 text-sm text-white/75">{career.description}</p>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full rounded-lg bg-[#FF6B35] text-[#080814] hover:bg-[#ff844f]"
            onClick={onOpen}
          >
            {t("explore.openCareer")}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
