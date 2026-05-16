"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Send, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChatMessage, LocaleCode, StudentProfile } from "@/types";
import { CAREERS } from "@/lib/careers";
import { cn } from "@/lib/utils";

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

function cityLabel(city: StudentProfile["city"] | undefined): string {
  if (city === "mysuru") return "Mysuru";
  if (city === "hubballi") return "Hubballi–Dharwad";
  if (city === "bengaluru") return "Bengaluru";
  return "Karnataka";
}

const EMOTION_UI: Record<string, { emoji: string; labelKey: string }> = {
  confused: { emoji: "\u{1F615}", labelKey: "chat.emotions.confused" },
  excited: { emoji: "\u{1F525}", labelKey: "chat.emotions.excited" },
  anxious: { emoji: "\u{1F630}", labelKey: "chat.emotions.anxious" },
  motivated: { emoji: "\u26A1", labelKey: "chat.emotions.motivated" },
  bored: { emoji: "\u{1F634}", labelKey: "chat.emotions.bored" },
  curious: { emoji: "\u{1F914}", labelKey: "chat.emotions.curious" },
  neutral: { emoji: "\u2728", labelKey: "chat.emotions.neutral" },
};

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
  const [careersDiscussed, setCareersDiscussed] = useState<string[]>([]);
  const [suggestedCareer, setSuggestedCareer] = useState<string | null>(null);
  const [emotionsByMessageId, setEmotionsByMessageId] = useState<
    Record<string, string>
  >({});
  const [recording, setRecording] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const welcomeSeeded = useRef(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const stopRecording = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    try {
      recognitionRef.current?.stop();
    } catch {
      /* */
    }
    recognitionRef.current = null;
    setRecording(false);
  }, []);

  const startRecording = useCallback(() => {
    if (typeof window === "undefined") return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setError(t("chat.voiceUnsupported"));
      return;
    }
    setError(null);
    const rec = new SR();
    rec.lang =
      language === "kn" ? "kn-IN" : language === "hi" ? "hi-IN" : "en-IN";
    rec.continuous = false;
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => {
      const text = e.results[0]?.[0]?.transcript ?? "";
      if (text) setInput((prev) => (prev ? `${prev} ${text}` : text));
      stopRecording();
    };
    rec.onend = () => {
      stopRecording();
    };
    rec.onerror = () => {
      stopRecording();
    };
    recognitionRef.current = rec;
    setRecording(true);
    try {
      rec.start();
    } catch {
      setRecording(false);
      return;
    }
    silenceTimerRef.current = setTimeout(() => {
      stopRecording();
    }, 5000);
  }, [language, stopRecording, t]);

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
    setSuggestedCareer(null);

    try {
      const chatMessages = nextMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: chatMessages,
          language,
          studentName: name,
          city: cityLabel(profile?.city),
          careersDiscussed,
        }),
      });
      const data = (await res.json()) as {
        content?: string;
        error?: string;
        emotionDetected?: string;
        suggestedCareer?: string | null;
      };
      if (!res.ok) {
        throw new Error(data.error ?? "request_failed");
      }
      if (!data.content) {
        throw new Error(data.error ?? "empty");
      }
      const em = data.emotionDetected ?? "neutral";
      setEmotionsByMessageId((m) => ({ ...m, [userMsg.id]: em }));

      if (data.suggestedCareer) {
        setSuggestedCareer(data.suggestedCareer);
        setCareersDiscussed((c) =>
          c.includes(data.suggestedCareer!) ? c : [...c, data.suggestedCareer!],
        );
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

  const suggestedCareerName =
    suggestedCareer &&
    CAREERS.find((c) => c.id === suggestedCareer)?.name;

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
          DeepSeek AI
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestedCareer && suggestedCareerName ? (
          <div className="rounded-xl border border-[#FF6B35]/30 bg-[#FF6B35]/10 px-3 py-2 text-sm text-white/90">
            {t("chat.suggestedCareer", { name: suggestedCareerName })}
          </div>
        ) : null}

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
                className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    m.role === "user"
                      ? "bg-[#FF6B35] text-[#080814]"
                      : "border border-white/10 bg-white/5 text-white",
                  )}
                >
                  <p>{m.content}</p>
                  <p
                    className={cn(
                      "mt-2 text-[10px] uppercase tracking-wide",
                      m.role === "user" ? "text-[#080814]/50" : "text-white/40",
                    )}
                  >
                    {new Date(m.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                {m.role === "user" && emotionsByMessageId[m.id] ? (
                  <p className="mt-1 text-xs text-white/50">
                    {(() => {
                      const em = emotionsByMessageId[m.id];
                      const ui = EMOTION_UI[em] ?? EMOTION_UI.neutral;
                      return `${ui.emoji} ${t(ui.labelKey)}`;
                    })()}
                  </p>
                ) : null}
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
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              className={cn(
                "h-[34px] rounded-xl border-white/15",
                recording
                  ? "animate-pulse border-red-500/60 bg-red-500/20 text-red-200"
                  : "text-white hover:bg-white/10",
              )}
              onClick={() => {
                if (recording) {
                  stopRecording();
                } else {
                  startRecording();
                }
              }}
              disabled={loading}
              aria-label={t("chat.voice")}
            >
              {recording ? (
                <MicOff className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </Button>
            <Button
              type="button"
              className="h-[34px] flex-1 rounded-xl bg-[#FF6B35] px-3 text-[#080814] hover:bg-[#ff844f]"
              onClick={() => void send(input)}
              disabled={loading}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
