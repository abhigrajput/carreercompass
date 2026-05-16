"use client";

import { useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/lib/i18n";
import type { LocaleCode } from "@/types";
import { loadStudentProfile } from "@/lib/student-storage";
import { BadgeUnlockQueue } from "@/components/BadgeUnlock";

export function AppProviders({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale?: LocaleCode;
}) {
  useEffect(() => {
    const stored = loadStudentProfile();
    const lng = initialLocale ?? stored?.language ?? "en";
    void i18n.changeLanguage(lng);
  }, [initialLocale]);

  return (
    <I18nextProvider i18n={i18n}>
      {children}
      <BadgeUnlockQueue />
    </I18nextProvider>
  );
}
