"use client";

import { useEffect, useState } from "react";
import { Newspaper } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { loadStudentProfile } from "@/lib/student-storage";
import type { CareerNewsItem, LocaleCode } from "@/types";

function labels(language: LocaleCode) {
  if (language === "kn") {
    return {
      title: "ಇಂದಿನ Career News",
      subtitle: "ಕರ್ನಾಟಕ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಉಪಯುಕ್ತವಾದ ಇಂದಿನ 5 ಪ್ರಮುಖ ಅಪ್ಡೇಟ್‌ಗಳು.",
      loading: "ಇಂದಿನ ಅಪ್ಡೇಟ್‌ಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...",
      relevance: "ಸಂಬಂಧಿತ ವೃತ್ತಿಗಳು",
    };
  }
  if (language === "hi") {
    return {
      title: "आज की Career News",
      subtitle: "कर्नाटक के छात्रों के लिए आज की 5 उपयोगी करियर अपडेट्स।",
      loading: "आज की अपडेट्स लोड हो रही हैं...",
      relevance: "संबंधित करियर",
    };
  }
  return {
    title: "Today's Career News",
    subtitle: "Five useful daily updates for Karnataka students.",
    loading: "Loading today's updates...",
    relevance: "Relevant careers",
  };
}

const CATEGORY_LABELS: Record<CareerNewsItem["category"], string> = {
  tech: "Tech Jobs",
  medical: "Medical",
  government: "Government",
  startup: "Startup",
  education: "Education",
};

export default function NewsPage() {
  const profile = loadStudentProfile();
  const language = (profile?.language ?? "en") as LocaleCode;
  const copy = labels(language);
  const [items, setItems] = useState<CareerNewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/news")
      .then((res) => res.json())
      .then((data: { items?: CareerNewsItem[] }) => {
        setItems(data.items ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-24">
      <div className="mb-8">
        <h1 className="font-display text-4xl text-white">{copy.title}</h1>
        <p className="mt-2 text-white/65">{copy.subtitle}</p>
      </div>

      {loading ? <p className="text-white/60">{copy.loading}</p> : null}

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <Card key={`${item.headline}-${item.source}`} className="rounded-2xl border-white/10 bg-[#12121F]">
            <CardHeader>
              <CardTitle className="flex items-start gap-3 text-white">
                <Newspaper className="mt-1 h-5 w-5 text-[#FFD60A]" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-[#FF6B35]">
                    {CATEGORY_LABELS[item.category]}
                  </p>
                  <p className="mt-1 font-display text-xl">{item.headline}</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-white/75">
              <p>{item.summary}</p>
              <p className="text-xs text-white/45">{item.source}</p>
              <div className="rounded-xl bg-black/30 p-3">
                <p className="mb-2 text-xs uppercase tracking-wide text-white/45">
                  {copy.relevance}
                </p>
                <div className="flex flex-wrap gap-2">
                  {item.relevantCareers.map((career) => (
                    <span
                      key={career}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80"
                    >
                      {career}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
