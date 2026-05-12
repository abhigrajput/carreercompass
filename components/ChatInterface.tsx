"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChatMessage, LocaleCode, StudentProfile } from "@/types";

function nowId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function welcomeMessage(lang: LocaleCode, name: string) {
  if (lang === "kn") {
    return `ನಮಸ್ಕಾರ ${name}! ನಾನು ನಿಮ್ಮ CareerCompass ಮಾರ್ಗದರ್ಶಿ. ನಿಮಗೆ ಯಾವ ವಿಷಯಗಳು ಇಷ್ಟ?`;
  }
  if (lang === "hi") {
    return `नमस्ते ${name}! मैं आपका CareerCompass गाइड हूं। बताइए — आपको कौन से विषय सबसे अच्छे लगते हैं?`;
  }
  return `Hi ${name}! I'm your CareerCompass guide. Tell me — what subjects do you enjoy most?`;
}

export function ChatInterface({ profile }: { profile: StudentProfile | null }) {
  const { t, i18n } = useTranslation("common");
  const language = (profile?.language ??
    (i18n.language as LocaleCode) ??
    "en") as LocaleCode;
  const name = profile?.name ?? "Student";

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const welcomeSeeded = useRef(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (!profile?.name) {
      return;
    }
    if (welcomeSeeded.current) {
      return;
    }
    welcomeSeeded.current = true;
    const w: ChatMessage = {
      id: "welcome",
      role: "assistant",
      content: welcomeMessage(language, profile.name),
      createdAt: new Date().toISOString(),
    };
    setMessages([w]);
    void persistThread([w]);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seed welcome once when profile appears
  }, [profile?.name, language]);

  const persistThread = async (next: ChatMessage[]) => {
    try {
      await fetch("/api/chat-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next,
          studentName: name,
          language,
          studentId: profile?.id ?? null,
        }),
      });
    } catch {
      /* optional */
    }
  };

  const quickLabels = [
    t("chat.quickReplies.r1"),
    t("chat.quickReplies.r2"),
    t("chat.quickReplies.r3"),
    t("chat.quickReplies.r4"),
    t("chat.quickReplies.r5"),
  ];

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) {
      return;
    }
    setError(null);
    const prev = messages;
    const userMsg: ChatMessage = {
      id: nowId(),
      role: "user",
      content: trimmed,
      createdAt: new Date().toISOString(),
    };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const anthropicMessages = nextMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: anthropicMessages,
          language,
          studentName: name,
        }),
      });
      const data = (await res.json()) as { content?: string; error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "request_failed");
      }
      if (!data.content) {
        throw new Error(data.error ?? "empty");
      }
      const assistantMsg: ChatMessage = {
        id: nowId(),
        role: "assistant",
        content: data.content,
        createdAt: new Date().toISOString(),
      };
      const finalThread = [...nextMessages, assistantMsg];
      setMessages(finalThread);
      void persistThread(finalThread);
    } catch {
      setError(t("common.error"));
      setMessages(prev);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="rounded-2xl border-white/10 bg-[#12121F] shadow-glow">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <div>
          <CardTitle className="font-display text-2xl text-white">
            {t("chat.title")}
          </CardTitle>
          <p className="text-sm text-white/60">{t("chat.subtitle")}</p>
        </div>
        <div className="hidden rounded-full border border-[#FFD60A]/30 bg-[#FFD60A]/10 px-3 py-1 text-xs text-[#FFD60A] sm:inline-flex">
          <Sparkles className="mr-1 h-3.5 w-3.5" />
          Claude Sonnet
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-[420px] space-y-3 overflow-y-auto rounded-2xl border border-white/10 bg-black/30 p-4">
          {messages.length === 0 && !profile?.name ? (
            <p className="text-sm text-white/60">
              {language === "kn"
                ? "ಪ್ರೊಫೈಲ್ ಅನ್ನು ಆನ್‌ಬೋರ್ಡಿಂಗ್‌ನಲ್ಲಿ ಭರ್ತಿ ಮಾಡಿ."
                : language === "hi"
                  ? "ऑनबोर्डिंग में अपनी प्रोफ़ाइल पूरी करें।"
                  : "Complete your profile in onboarding to personalise chat."}
            </p>
          ) : null}
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-[#FF6B35] text-[#080814]"
                      : "border border-white/10 bg-white/5 text-white"
                  }`}
                >
                  <p>{m.content}</p>
                  <p className="mt-2 text-[10px] uppercase tracking-wide text-white/40">
                    {new Date(m.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {loading ? (
            <div className="flex items-center gap-2 text-xs text-white/60">
              <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-[#FFD60A]" />
              {t("chat.typing")}
            </div>
          ) : null}
          <div ref={bottomRef} />
        </div>

        {error ? (
          <p className="text-sm text-red-300">{error}</p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {quickLabels.map((q) => (
            <Button
              key={q}
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full border-white/10 bg-white/5 text-xs text-white hover:bg-white/10"
              onClick={() => void send(q)}
            >
              {q}
            </Button>
          ))}
        </div>

        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("chat.placeholder")}
            className="min-h-[72px] rounded-xl border-white/10 bg-black/30 text-white placeholder:text-white/40"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send(input);
              }
            }}
          />
          <Button
            type="button"
            className="h-[72px] rounded-xl bg-[#FF6B35] px-4 text-[#080814] hover:bg-[#ff844f]"
            onClick={() => void send(input)}
            disabled={loading}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
