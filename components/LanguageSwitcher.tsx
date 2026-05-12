"use client";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import type { LocaleCode } from "@/types";
import { loadStudentProfile, saveStudentProfile } from "@/lib/student-storage";
import { cn } from "@/lib/utils";

const locales: { code: LocaleCode; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "kn", label: "ಕನ್ನಡ" },
  { code: "hi", label: "हिं" },
];

export function LanguageSwitcher({ className }: { className?: string }) {
  const { i18n } = useTranslation("common");

  useEffect(() => {
    const profile = loadStudentProfile();
    if (profile?.language && profile.language !== i18n.language) {
      void i18n.changeLanguage(profile.language);
    }
  }, [i18n]);

  const setLang = (code: LocaleCode) => {
    void i18n.changeLanguage(code);
    const profile = loadStudentProfile();
    if (profile) {
      saveStudentProfile({ ...profile, language: code });
    }
    if (typeof document !== "undefined") {
      document.documentElement.lang = code === "kn" ? "kn" : code === "hi" ? "hi" : "en";
    }
  };

  return (
    <div
      className={cn(
        "inline-flex overflow-hidden rounded-lg border border-white/10 bg-white/5 p-0.5",
        className,
      )}
      role="group"
      aria-label="Language"
    >
      {locales.map((l) => (
        <Button
          key={l.code}
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 rounded-md px-2 text-xs",
            i18n.language === l.code
              ? "bg-[#FF6B35] text-[#080814] hover:bg-[#ff844f] hover:text-[#080814]"
              : "text-white/70 hover:text-white",
          )}
          onClick={() => setLang(l.code)}
        >
          {l.label}
        </Button>
      ))}
    </div>
  );
}
