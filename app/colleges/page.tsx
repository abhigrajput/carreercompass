"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { CollegeCard } from "@/components/CollegeCard";
import { COLLEGES } from "@/lib/colleges";
import type { CollegeItem, StreamSlug } from "@/types";

const HUB_CITIES = ["Bengaluru", "Mysuru", "Hubballi"] as const;

type HubCity = (typeof HUB_CITIES)[number] | "Any";

type InstitutionFilter = "any" | "government" | "private";

function matchesInstitution(
  college: CollegeItem,
  filter: InstitutionFilter,
): boolean {
  if (filter === "any") {
    return true;
  }
  if (filter === "government") {
    return college.type === "government" || college.type === "aided";
  }
  return college.type === "private";
}

export default function CollegesPage() {
  const { t } = useTranslation("common");
  const totalColleges = COLLEGES.length;

  const [city, setCity] = useState<HubCity>("Any");
  const [stream, setStream] = useState<StreamSlug | "Any">("Any");
  const [institution, setInstitution] = useState<InstitutionFilter>("any");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return COLLEGES.filter((c) => {
      if (city !== "Any" && c.city !== city) {
        return false;
      }
      if (stream !== "Any" && !c.streams.includes(stream)) {
        return false;
      }
      if (!matchesInstitution(c, institution)) {
        return false;
      }
      if (q && !c.name.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [city, stream, institution, query]);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-24">
      <div className="mb-8">
        <h1 className="font-display text-4xl text-white">
          {t("colleges.title")}
        </h1>
        <p className="text-white/65">{t("colleges.subtitle")}</p>
      </div>

      <div className="mb-4 space-y-3 rounded-2xl border border-white/10 bg-[#12121F] p-4">
        <label className="block text-sm text-white/75">
          <span className="mb-2 block">{t("colleges.search")}</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("colleges.search")}
            className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/35"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <label className="space-y-2 text-sm text-white/75">
            <span>{t("colleges.city")}</span>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value as HubCity)}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
            >
              <option value="Any">{t("colleges.any")}</option>
              {HUB_CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm text-white/75">
            <span>{t("colleges.stream")}</span>
            <select
              value={stream}
              onChange={(e) =>
                setStream(e.target.value as StreamSlug | "Any")
              }
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
            >
              <option value="Any">{t("colleges.any")}</option>
              <option value="science">
                {t("colleges.streams.science")}
              </option>
              <option value="commerce">
                {t("colleges.streams.commerce")}
              </option>
              <option value="arts">{t("colleges.streams.arts")}</option>
            </select>
          </label>
          <label className="space-y-2 text-sm text-white/75">
            <span>{t("colleges.institutionType")}</span>
            <select
              value={institution}
              onChange={(e) =>
                setInstitution(e.target.value as InstitutionFilter)
              }
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
            >
              <option value="any">{t("colleges.typeFilter.any")}</option>
              <option value="government">
                {t("colleges.typeFilter.government")}
              </option>
              <option value="private">
                {t("colleges.typeFilter.private")}
              </option>
            </select>
          </label>
          <div className="flex flex-col justify-end text-sm text-white/60">
            <span className="text-white/90">
              {t("colleges.showing", {
                n: filtered.length,
                total: totalColleges,
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {filtered.map((college) => (
          <CollegeCard key={college.id} college={college} />
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-8 text-center text-sm text-white/60">
          {t("common.error")}
        </p>
      ) : null}
    </div>
  );
}
