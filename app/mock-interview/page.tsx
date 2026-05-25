"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MessageCircle, Share2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { CAREERS } from "@/lib/careers";
import { shareContent } from "@/lib/share";
import { loadStudentProfile } from "@/lib/student-storage";
import type { LocaleCode, MockInterviewTurn } from "@/types";

function labels(language: LocaleCode) {
  if (language === "kn") {
    return {
      title: "AI Mock Interview",
      subtitle: "ನಿಮ್ಮ ಆಸಕ್ತಿಯ ವೃತ್ತಿಯನ್ನು ಆಯ್ಕೆ ಮಾಡಿ ಮತ್ತು 5 ಪ್ರಶ್ನೆಗಳ ಸಂದರ್ಶನ ಅಭ್ಯಾಸ ಮಾಡಿ.",
      chooseCareer: "ವೃತ್ತಿ ಆಯ್ಕೆ ಮಾಡಿ",
      start: "ಸಂದರ್ಶನ ಪ್ರಾರಂಭಿಸಿ",
      answer: "ನಿಮ್ಮ ಉತ್ತರ",
      submit: "ಉತ್ತರ ಸಲ್ಲಿಸಿ",
      next: "ಮುಂದಿನ ಪ್ರಶ್ನೆ",
      summary: "ಅಂತಿಮ ಫಲಿತಾಂಶ",
      strongest: "ಅತ್ಯಂತ ಬಲವಾದ ಅಂಶ",
      weakest: "ಸುಧಾರಿಸಬೇಕಾದ ಅಂಶ",
      share: "WhatsApp ನಲ್ಲಿ ಹಂಚಿಕೊಳ್ಳಿ",
      restart: "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ",
      loading: "AI ಪ್ರಶ್ನೆ ತಯಾರಿಸುತ್ತಿದೆ...",
    };
  }
  if (language === "hi") {
    return {
      title: "AI Mock Interview",
      subtitle: "अपना करियर चुनें और 5 सवालों वाला इंटरव्यू अभ्यास करें।",
      chooseCareer: "करियर चुनें",
      start: "इंटरव्यू शुरू करें",
      answer: "आपका उत्तर",
      submit: "उत्तर भेजें",
      next: "अगला सवाल",
      summary: "अंतिम सारांश",
      strongest: "सबसे मजबूत बात",
      weakest: "सबसे कमजोर बात",
      share: "WhatsApp पर शेयर करें",
      restart: "फिर से शुरू करें",
      loading: "AI अगला सवाल बना रहा है...",
    };
  }
  return {
    title: "AI Mock Interview",
    subtitle: "Pick a career and practice a 5-question interview tailored to your answers.",
    chooseCareer: "Choose a career",
    start: "Start interview",
    answer: "Your answer",
    submit: "Submit answer",
    next: "Next question",
    summary: "Final summary",
    strongest: "Strongest point",
    weakest: "Needs improvement",
    share: "Share on WhatsApp",
    restart: "Start again",
    loading: "AI is preparing the next question...",
  };
}

export default function MockInterviewPage() {
  const profile = loadStudentProfile();
  const language = (profile?.language ?? "en") as LocaleCode;
  const copy = labels(language);

  const [careerId, setCareerId] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [turns, setTurns] = useState<MockInterviewTurn[]>([]);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const selectedCareer = useMemo(
    () => CAREERS.find((career) => career.id === careerId) ?? null,
    [careerId],
  );

  const averageScore = useMemo(() => {
    if (turns.length === 0) return 0;
    return Math.round(
      turns.reduce((sum, turn) => sum + turn.feedback.score, 0) / turns.length,
    );
  }, [turns]);

  const strongestTurn = useMemo(
    () =>
      turns.length > 0
        ? [...turns].sort((a, b) => b.feedback.score - a.feedback.score)[0]
        : null,
    [turns],
  );

  const weakestTurn = useMemo(
    () =>
      turns.length > 0
        ? [...turns].sort((a, b) => a.feedback.score - b.feedback.score)[0]
        : null,
    [turns],
  );

  async function requestQuestion(nextNumber: number, history: MockInterviewTurn[]) {
    if (!selectedCareer) return;
    const res = await fetch("/api/mock-interview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "question",
        careerId: selectedCareer.id,
        careerName: selectedCareer.name,
        questionNumber: nextNumber,
        history: history.map((turn) => ({
          question: turn.question,
          answer: turn.answer,
        })),
        language,
      }),
    });
    const data = (await res.json()) as { question?: string };
    setQuestion(data.question ?? "");
    setQuestionNumber(nextNumber);
  }

  async function startInterview() {
    if (!selectedCareer) return;
    setLoading(true);
    setTurns([]);
    setAnswer("");
    try {
      await requestQuestion(1, []);
    } finally {
      setLoading(false);
    }
  }

  async function submitAnswer() {
    if (!selectedCareer || !question || !answer.trim()) return;
    setLoading(true);

    try {
      const feedbackRes = await fetch("/api/mock-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "feedback",
          careerId: selectedCareer.id,
          careerName: selectedCareer.name,
          question,
          answer,
          language,
        }),
      });

      const feedbackData = (await feedbackRes.json()) as {
        feedback?: { score: number; good: string; improve: string };
      };

      const nextTurns = [
        ...turns,
        {
          question,
          answer,
          feedback: feedbackData.feedback ?? {
            score: 5,
            good: "You answered clearly.",
            improve: "Add one specific example next time.",
          },
        },
      ];

      setTurns(nextTurns);
      setAnswer("");

      if (nextTurns.length >= 5) {
        setQuestion("");
        setSaving(true);
        await fetch("/api/mock-interview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "save",
            studentId: profile?.id ?? null,
            careerId: selectedCareer.id,
            questions: nextTurns.map((turn) => turn.question),
            answers: nextTurns.map((turn) => turn.answer),
            scores: nextTurns.map((turn) => turn.feedback.score),
          }),
        });
        setSaving(false);
        return;
      }

      await requestQuestion(nextTurns.length + 1, nextTurns);
    } finally {
      setLoading(false);
    }
  }

  async function shareResult() {
    if (!selectedCareer || turns.length < 5) return;
    const text = `I completed a CareerCompass AI mock interview for ${selectedCareer.name} and scored ${averageScore}/10 overall.`;
    await shareContent("CareerCompass Mock Interview", text, window.location.href);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 pt-24">
      <div className="mb-8">
        <h1 className="font-display text-4xl text-white">{copy.title}</h1>
        <p className="mt-2 text-white/65">{copy.subtitle}</p>
      </div>

      <Card className="rounded-2xl border-white/10 bg-[#12121F]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-white">
            <Sparkles className="h-5 w-5 text-[#FFD60A]" />
            {copy.chooseCareer}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <select
            value={careerId}
            onChange={(e) => setCareerId(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
          >
            <option value="">Select a career</option>
            {CAREERS.slice(0, 24).map((career) => (
              <option key={career.id} value={career.id}>
                {career.name}
              </option>
            ))}
          </select>

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              onClick={() => void startInterview()}
              disabled={!selectedCareer || loading}
              className="rounded-xl bg-[#FF6B35] text-[#080814] hover:bg-[#ff844f]"
            >
              {copy.start}
            </Button>
            <Link
              href="/pricing"
              className="rounded-xl border border-[#FFD60A]/30 px-4 py-2 text-sm text-[#FFD60A]"
            >
              Unlock Pro feedback
            </Link>
          </div>
        </CardContent>
      </Card>

      {question ? (
        <Card className="mt-6 rounded-2xl border-white/10 bg-[#12121F]">
          <CardHeader>
            <CardTitle className="text-white">
              Question {questionNumber} / 5
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="rounded-xl border border-white/10 bg-black/30 p-4 text-white">
              {question}
            </p>
            <Textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={copy.answer}
              className="min-h-[150px] rounded-xl border-white/10 bg-black/30 text-white placeholder:text-white/40"
            />
            <Button
              type="button"
              onClick={() => void submitAnswer()}
              disabled={loading || !answer.trim()}
              className="rounded-xl bg-[#FF6B35] text-[#080814] hover:bg-[#ff844f]"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              {copy.submit}
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {loading ? (
        <p className="mt-4 text-sm text-white/60">{copy.loading}</p>
      ) : null}

      {turns.length > 0 ? (
        <div className="mt-6 space-y-4">
          {turns.map((turn, index) => (
            <Card key={`${turn.question}-${index}`} className="rounded-2xl border-white/10 bg-[#12121F]">
              <CardContent className="space-y-3 p-5">
                <p className="text-sm text-white/50">Q{index + 1}</p>
                <p className="text-white">{turn.question}</p>
                <p className="rounded-xl bg-black/30 p-3 text-sm text-white/80">
                  {turn.answer}
                </p>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-xl border border-[#FF6B35]/30 bg-[#FF6B35]/10 p-3 text-white">
                    <p className="text-xs text-white/50">Score</p>
                    <p className="font-display text-2xl">{turn.feedback.score}/10</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/80">
                    <p className="mb-1 text-xs text-white/50">Good</p>
                    {turn.feedback.good}
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/80">
                    <p className="mb-1 text-xs text-white/50">Improve</p>
                    {turn.feedback.improve}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {turns.length === 5 ? (
        <Card className="mt-6 rounded-2xl border-[#FFD60A]/30 bg-[#12121F]">
          <CardHeader>
            <CardTitle className="font-display text-white">{copy.summary}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-3xl text-[#FFD60A]">{averageScore}/10</p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl bg-black/30 p-4 text-white/85">
                <p className="mb-1 text-xs text-white/50">{copy.strongest}</p>
                <p>{strongestTurn?.feedback.good}</p>
              </div>
              <div className="rounded-xl bg-black/30 p-4 text-white/85">
                <p className="mb-1 text-xs text-white/50">{copy.weakest}</p>
                <p>{weakestTurn?.feedback.improve}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                onClick={() => void shareResult()}
                className="rounded-xl bg-[#FF6B35] text-[#080814] hover:bg-[#ff844f]"
              >
                <Share2 className="mr-2 h-4 w-4" />
                {copy.share}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setTurns([]);
                  setQuestion("");
                  setQuestionNumber(0);
                  setAnswer("");
                }}
                className="rounded-xl border-white/10 text-white"
              >
                {copy.restart}
              </Button>
            </div>
            {saving ? <p className="text-sm text-white/50">Saving interview...</p> : null}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
