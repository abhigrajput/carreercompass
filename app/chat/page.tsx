"use client";

import { ChatInterface } from "@/components/ChatInterface";
import { loadStudentProfile } from "@/lib/student-storage";
import { useTranslation } from "react-i18next";

export default function ChatPage() {
  const { t } = useTranslation("common");
  const profile = loadStudentProfile();

  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 pt-24">
      <div className="mb-6">
        <h1 className="font-display text-4xl text-white">{t("chat.title")}</h1>
        <p className="text-white/65">{t("chat.subtitle")}</p>
      </div>
      <ChatInterface profile={profile} />
    </div>
  );
}
