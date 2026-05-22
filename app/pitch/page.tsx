"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const SLIDES = [
  {
    title: "CareerCompass Karnataka",
    subtitle: "India's First Regional-Language AI Career Platform",
    tag: "Seed Round — ₹50–80 Lakhs",
    body: "Free. Kannada-first. Built for 8.7 lakh SSLC students.",
  },
  {
    title: "The Problem",
    subtitle: "93% of Karnataka students know only 7 careers",
    bullets: [
      "No guidance in Kannada",
      "Counsellors cost ₹2,000–15,000/session",
      "Generic apps ignore Karnataka context",
    ],
  },
  {
    title: "Market Size",
    subtitle: "TAM → SAM → SOM",
    bullets: [
      "TAM: ₹85,000 Cr (India career counselling)",
      "SAM: ₹2,400 Cr (Karnataka + South India)",
      "SOM: ₹120 Cr (3 cities, 3-year target)",
    ],
  },
  {
    title: "Our Solution",
    subtitle: "CareerCompass: Free, AI-Powered, Kannada-First",
    bullets: [
      "Psychology discovery game",
      "AI chat in Kannada / Hindi / English",
      "Karnataka college map + roadmaps",
    ],
  },
  {
    title: "Product",
    subtitle: "Built in 30 days. Live today.",
    bullets: [
      "32+ pages · 50 careers · 3 cities",
      "Next.js + DeepSeek + Supabase",
      "careercompass.vercel.app",
    ],
  },
  {
    title: "Traction",
    subtitle: "Built. Deployed. Ready to scale.",
    bullets: [
      "PWA installable on Android",
      "Holland Code career game",
      "School B2B portal ready",
    ],
  },
  {
    title: "Business Model",
    subtitle: "3 revenue streams",
    bullets: [
      "B2C: ₹99/mo Student Pro",
      "B2B: ₹15K–2L/yr school packs",
      "Marketplace: 20% mentor commission",
    ],
  },
  {
    title: "Why We Win",
    subtitle: "vs Mindler, iDC, generic apps",
    bullets: [
      "Kannada + Karnataka focus ✅",
      "Free tier + AI chat ✅",
      "Gamified discovery ✅",
    ],
  },
  {
    title: "Go To Market",
    subtitle: "Phased rollout",
    bullets: [
      "Phase 1: 3 cities, 10 schools, 5K students",
      "Phase 2: All Karnataka, 100 schools",
      "Phase 3: South India expansion",
    ],
  },
  {
    title: "Team",
    subtitle: "Founder-led execution",
    bullets: [
      "Abhishek Rajput — CSE, VTU",
      "Solo founder: full-stack + AI + product",
      "Advisors: TBD",
    ],
  },
  {
    title: "Use of Funds",
    subtitle: "₹60 Lakhs seed",
    bullets: [
      "Product & Tech: ₹15L (30%)",
      "Sales & Marketing: ₹20L (33%)",
      "School partnerships: ₹10L (17%)",
    ],
  },
  {
    title: "The Ask",
    subtitle: "Raising ₹50–80 Lakhs Seed",
    bullets: [
      "18-month runway → 1L students",
      "Vision: Karnataka's career OS → India's career OS",
      "Schedule a call → contact@careercompass.in",
    ],
  },
];

export default function PitchPage() {
  const [idx, setIdx] = useState(0);
  const total = SLIDES.length;
  const slide = SLIDES[idx];

  const next = useCallback(
    () => setIdx((i) => Math.min(total - 1, i + 1)),
    [total],
  );
  const prev = useCallback(() => setIdx((i) => Math.max(0, i - 1)), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  const progress = ((idx + 1) / total) * 100;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#080814] text-white">
      <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <span className="text-xs text-white/50">
          {idx + 1} / {total}
        </span>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" size="icon" onClick={prev} disabled={idx === 0} aria-label="Previous slide">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button type="button" variant="ghost" size="icon" onClick={next} disabled={idx === total - 1} aria-label="Next slide">
            <ChevronRight className="h-5 w-5" />
          </Button>
          <Button type="button" variant="ghost" size="icon" onClick={() => void document.documentElement.requestFullscreen()} aria-label="Fullscreen">
            <Maximize2 className="h-5 w-5" />
          </Button>
          <Button type="button" variant="outline" size="sm" className="border-white/20" onClick={() => window.print()}>
            PDF
          </Button>
        </div>
      </header>
      <div className="h-1 bg-white/10">
        <motion.div
          className="h-full bg-gradient-to-r from-[#FF6B35] to-[#FFD60A]"
          style={{ width: `${progress}%` }}
        />
      </div>
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <AnimatePresence mode="wait">
          <motion.div key={idx} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="max-w-2xl">
            <h1 className="font-display text-4xl font-bold md:text-5xl">{slide.title}</h1>
            <p className="mt-4 text-xl text-[#FFD60A]">{slide.subtitle}</p>
            {"body" in slide && slide.body ? <p className="mt-6 text-lg text-white/70">{slide.body}</p> : null}
            {"tag" in slide && slide.tag ? <p className="mt-4 text-sm text-[#FF6B35]">{slide.tag}</p> : null}
            {"bullets" in slide && slide.bullets ? (
              <ul className="mt-8 space-y-3 text-left text-lg text-white/80">
                {slide.bullets.map((b) => (
                  <li key={b} className="rounded-lg border border-white/10 bg-white/5 px-4 py-2">{b}</li>
                ))}
              </ul>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
