"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import type { CollegeItem } from "@/types";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export function CollegeCard({ college }: { college: CollegeItem }) {
  const { t } = useTranslation("common");

  const cutoffScores = [
    college.cetCutoffGeneral,
    college.cetCutoffSc,
    college.cetCutoffSt,
  ].filter((n): n is number => typeof n === "number");
  const minCut =
    cutoffScores.length > 0 ? Math.min(...cutoffScores) : null;
  const maxCut =
    cutoffScores.length > 0 ? Math.max(...cutoffScores) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35 }}
    >
      <Card className="rounded-2xl border-white/10 bg-[#12121F] shadow-glowYellow">
        <CardHeader className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-white/15 text-white/80">
              {t(`colleges.institution.${college.type}`)}
            </Badge>
            <Badge className="rounded-full bg-white/5 text-white/70">
              #{college.ranking ?? "—"}
            </Badge>
          </div>
          <CardTitle className="font-display text-xl text-white">
            {college.name}
          </CardTitle>
          <p className="text-sm text-white/60">{college.city}</p>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-white/75">
          <div className="flex flex-wrap gap-2">
            {college.streams.map((s) => (
              <span
                key={s}
                className="rounded-full border border-white/10 px-2 py-0.5 text-xs uppercase tracking-wide text-white/70"
              >
                {s}
              </span>
            ))}
          </div>
          <div className="grid gap-2 rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-white/65">
            {minCut != null && maxCut != null ? (
              <div className="flex justify-between gap-4 border-b border-white/10 pb-2 font-medium text-white/80">
                <span>{t("colleges.cutoffRange")}</span>
                <span className="text-white">
                  {minCut.toLocaleString("en-IN")} –{" "}
                  {maxCut.toLocaleString("en-IN")}
                </span>
              </div>
            ) : null}
            <div className="flex justify-between gap-4">
              <span>{t("colleges.cutoff")} (GM)</span>
              <span className="text-white">
                {college.cetCutoffGeneral?.toLocaleString("en-IN") ?? "—"}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span>SC</span>
              <span className="text-white">
                {college.cetCutoffSc?.toLocaleString("en-IN") ?? "—"}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span>ST</span>
              <span className="text-white">
                {college.cetCutoffSt?.toLocaleString("en-IN") ?? "—"}
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Link
            href={college.website}
            target="_blank"
            rel="noreferrer"
            className={cn(
              buttonVariants({ variant: "outline", size: "default" }),
              "w-full rounded-lg border-[#FF6B35]/40 text-white hover:bg-[#FF6B35]/10",
            )}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            {t("colleges.visit")}
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
