"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  Gamepad2,
  MapPinned,
  Sparkles,
  Heart,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { cn } from "@/lib/utils";

const HERO_LINES = [
  "Find Your Path",
  "ನಿಮ್ಮ ದಾರಿ ಕಂಡುಕೊಳ್ಳಿ",
  "अपना रास्ता खोजें",
];

const FLOAT_ICONS = ["💻", "🩺", "⚖️", "🎨", "🏛️", "✈️"];

export default function LandingPage() {
  const [heroIdx, setHeroIdx] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setHeroIdx((i) => (i + 1) % HERO_LINES.length);
    }, 3000);
    return () => window.clearInterval(id);
  }, []);

  const heroText = useMemo(() => HERO_LINES[heroIdx], [heroIdx]);

  return (
    <div className="relative overflow-hidden bg-[#080814]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,107,53,0.35),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(255,214,10,0.18),_transparent_60%)]" />

      {/* Floating icons */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {FLOAT_ICONS.map((icon, i) => (
          <motion.span
            key={icon}
            className="absolute text-3xl opacity-20 sm:text-4xl"
            style={{
              left: `${8 + i * 14}%`,
              top: `${15 + (i % 3) * 22}%`,
            }}
            animate={{
              y: [0, -12, 0],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 5 + i * 0.4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {icon}
          </motion.span>
        ))}
      </div>

      {/* Section 1 — Hero */}
      <section className="relative mx-auto max-w-6xl px-4 pb-16 pt-28">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl space-y-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
              <Sparkles className="h-3.5 w-3.5 text-[#FFD60A]" />
              Karnataka • Class 10–12 • Multilingual
            </div>
            <motion.h1
              key={heroText}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="font-display text-4xl leading-tight text-white sm:text-5xl lg:text-6xl"
            >
              <span className="bg-gradient-to-r from-[#FF6B35] via-[#FFD60A] to-white bg-clip-text text-transparent">
                {heroText}
              </span>
            </motion.h1>
            <p className="max-w-xl text-lg text-white/80">
              Karnataka&apos;s first AI-powered career guide. Free. In your language.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/onboarding"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "group rounded-xl bg-[#FF6B35] px-8 text-base font-semibold text-[#080814] shadow-glow hover:bg-[#ff844f]",
                )}
              >
                Start Free
                <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/explore"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10",
                )}
              >
                Explore Careers
              </Link>
            </div>
          </motion.div>
          <div className="relative w-full max-w-sm rounded-[28px] border border-white/10 bg-[#12121F]/80 p-5 shadow-glow backdrop-blur">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/50">Language</span>
              <LanguageSwitcher />
            </div>
            <p className="mt-4 text-sm text-white/75">
              Switch anytime — your roadmap and chat follow along.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2 — Stats */}
      <section className="border-y border-white/10 bg-black/20 py-6">
        <p className="text-center text-sm font-medium uppercase tracking-[0.2em] text-[#FFD60A]/90">
          8.7L+ Karnataka Students | 50+ Careers | 3 Cities | Free Forever
        </p>
      </section>

      {/* Section 3 — How it works */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="mb-10 text-center font-display text-3xl text-white">
          How it works
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              step: "1",
              title: "Tell us about yourself",
              body: "Name, class, city, and language — under a minute.",
            },
            {
              step: "2",
              title: "Play ability games",
              body: "Scenario-based mini games aligned to career domains.",
            },
            {
              step: "3",
              title: "Get your AI roadmap",
              body: "A practical 90‑day plan with Karnataka‑specific resources.",
            },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="rounded-2xl border border-white/10 bg-[#12121F] p-6"
            >
              <span className="text-3xl font-bold text-[#FF6B35]">{item.step}</span>
              <h3 className="mt-3 font-display text-xl text-white">{item.title}</h3>
              <p className="mt-2 text-sm text-white/65">{item.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Section 4 — Features */}
      <section className="border-t border-white/10 bg-black/10 py-16">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 md:grid-cols-3">
          {[
            {
              icon: Bot,
              emoji: "🤖",
              title: "AI Career Chat",
              body: "Talk to our AI in Kannada, Hindi or English.",
            },
            {
              icon: Gamepad2,
              emoji: "🎮",
              title: "Ability Games",
              body: "Discover your strengths through fun challenges.",
            },
            {
              icon: MapPinned,
              emoji: "🗺️",
              title: "College Mapper",
              body: "Find the right college in Bengaluru, Mysuru or Hubballi.",
            },
          ].map((card, idx) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
              className="rounded-2xl border border-white/10 bg-[#12121F]/90 p-6 shadow-glow"
            >
              <span className="text-2xl">{card.emoji}</span>
              <card.icon className="mb-3 mt-2 h-8 w-8 text-[#FF6B35]" />
              <h3 className="font-display text-xl text-white">{card.title}</h3>
              <p className="mt-2 text-sm text-white/70">{card.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Section 5 — Cities */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="mb-8 text-center font-display text-3xl text-white">
          Rooted in Karnataka cities
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { name: "Bengaluru", count: "4.2L+" },
            { name: "Mysuru", count: "1.1L+" },
            { name: "Hubballi", count: "90k+" },
          ].map((c) => (
            <div
              key={c.name}
              className="rounded-2xl border border-[#FF6B35]/25 bg-gradient-to-br from-[#12121F] to-black/50 p-6 text-center"
            >
              <p className="font-display text-2xl text-white">{c.name}</p>
              <p className="mt-2 text-sm text-white/55">
                Serving <span className="text-[#FFD60A]">{c.count}</span> students
                (indicative)
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 6 — Footer */}
      <footer
        id="about"
        className="border-t border-white/10 bg-black/30 px-4 py-12"
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:justify-between">
          <div>
            <p className="font-display text-xl text-white">
              <span className="text-[#FF6B35]">Career</span>
              <span className="text-[#FFD60A]">Compass</span>{" "}
              <span className="text-sm text-white/50">Karnataka</span>
            </p>
            <p className="mt-2 max-w-sm text-sm text-white/60">
              Find Your Path — in English, Kannada, or Hindi.
            </p>
          </div>
          <nav className="flex flex-wrap gap-6 text-sm text-white/75">
            <Link href="/explore" className="hover:text-[#FFD60A]">
              Explore
            </Link>
            <Link href="/games" className="hover:text-[#FFD60A]">
              Games
            </Link>
            <Link href="/colleges" className="hover:text-[#FFD60A]">
              Colleges
            </Link>
            <Link href="#about" className="hover:text-[#FFD60A]">
              About
            </Link>
          </nav>
          <div className="flex gap-4 text-sm">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              className="text-white/55 hover:text-white"
            >
              X / Twitter
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="text-white/55 hover:text-white"
            >
              Instagram
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              className="text-white/55 hover:text-white"
            >
              LinkedIn
            </a>
          </div>
        </div>
        <p className="mx-auto mt-10 max-w-6xl text-center text-sm text-white/45">
          Made with <Heart className="inline h-4 w-4 text-[#FF6B35]" /> for
          Karnataka&apos;s students
        </p>
      </footer>
    </div>
  );
}
