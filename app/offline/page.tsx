"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { CAREERS } from "@/lib/careers";
import { careerDisplayName } from "@/lib/career-utils";

export default function OfflinePage() {
  const { i18n } = useTranslation("common");
  const lang = (i18n.language === "kn" || i18n.language === "hi"
    ? i18n.language
    : "en") as "en" | "kn" | "hi";

  const cached = CAREERS.slice(0, 12);

  return (
    <div className="mx-auto max-w-lg px-4 pb-24 pt-28 text-center">
      <p className="font-display text-4xl">
        <span className="text-white">Career</span>
        <span className="text-[#FF6B35]">Compass</span>
      </p>
      <h1 className="mt-6 font-display text-2xl text-white">You are offline</h1>
      <p className="mt-2 text-sm text-white/65">
        Some features need internet. Browse cached careers below.
      </p>
      <ul className="mt-8 space-y-2 text-left">
        {cached.map((c) => (
          <li
            key={c.id}
            className="rounded-xl border border-white/10 bg-[#12121F] px-4 py-3 text-sm text-white"
          >
            {c.icon} {careerDisplayName(c, lang)}
          </li>
        ))}
      </ul>
      <Link
        href="/"
        className="mt-8 inline-block rounded-xl bg-[#FF6B35] px-6 py-3 text-sm font-medium text-[#080814]"
      >
        Try again
      </Link>
    </div>
  );
}

