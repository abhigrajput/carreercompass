"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Engine } from "@tsparticles/engine";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { cn } from "@/lib/utils";

const FLOAT_CARDS = [
  { icon: "💻", title: "Tech", salary: "₹40 LPA" },
  { icon: "🩺", title: "Medicine", salary: "₹50 LPA" },
  { icon: "⚖️", title: "Law", salary: "₹30 LPA" },
  { icon: "🎨", title: "Design", salary: "₹25 LPA" },
  { icon: "🏛️", title: "IAS", salary: "₹20 LPA" },
  { icon: "✈️", title: "Pilot", salary: "₹60 LPA" },
];

function useCountUp(target: number, active: boolean) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf: number;
    const start = performance.now();
    const dur = 1400;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      setV(Math.floor(target * p));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active]);
  return v;
}

export default function LandingPage() {
  const [particlesReady, setParticlesReady] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    void initParticlesEngine(async (engine: Engine) => {
      await loadSlim(engine);
    }).then(() => setParticlesReady(true));
  }, []);

  const particleOptions = useMemo(
    () => ({
      fullScreen: { enable: false },
      background: { color: "transparent" },
      fpsLimit: 60,
      particles: {
        number: { value: 60 },
        color: { value: ["#FF6B35", "#FFD60A"] },
        links: {
          enable: true,
          distance: 150,
          color: "#FF6B35",
          opacity: 0.12,
          width: 1,
        },
        move: { enable: true, speed: 0.35, random: true },
        size: { value: { min: 1, max: 3 } },
        opacity: { value: 0.45 },
      },
      detectRetina: true,
    }),
    [],
  );

  const s1 = useCountUp(870000, statsVisible);
  const s2 = useCountUp(50, statsVisible);
  const s3 = useCountUp(3, statsVisible);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setStatsVisible(true);
      },
      { threshold: 0.2 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#080814] text-white">
      <div className="pointer-events-none absolute inset-0 z-0 opacity-90">
        {particlesReady ? (
          <Particles id="landing-particles" options={particleOptions} className="h-screen w-full" />
        ) : null}
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,107,53,0.2),_transparent_55%)]" />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-end px-4 pt-6">
        <LanguageSwitcher />
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col gap-12 px-4 pb-16 pt-8 lg:flex-row lg:items-center">
        <div className="max-w-xl flex-1 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#FF6B35]/60 bg-transparent px-3 py-1 text-xs text-white/90">
            🇮🇳 Made for Karnataka
          </div>
          <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl md:text-[56px]">
            <span className="text-white">Find Your</span>
            <br />
            <span className="bg-gradient-to-r from-[#FF6B35] to-[#FFD60A] bg-clip-text text-transparent">
              Career Path
            </span>
            <br />
            <span className="text-2xl text-white/50 sm:text-3xl">ನಿಮ್ಮ ದಾರಿ</span>
          </h1>
          <p className="max-w-md text-lg text-white/65">
            Karnataka&apos;s first AI-powered career guide. Free. In Kannada. Built for YOU.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/onboarding"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-12 rounded-3xl bg-[#FF6B35] px-8 text-[#080814] hover:bg-[#ff844f]",
              )}
            >
              Start Free <ArrowRight className="ml-2 inline h-4 w-4" />
            </Link>
            <Link
              href="/games"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-12 rounded-3xl border-[#FF6B35] bg-transparent text-[#FF6B35] hover:bg-[#FF6B35]/10",
              )}
            >
              Play Career Game
            </Link>
          </div>
          <p className="text-sm text-white/50">
            ⭐ Trusted by students in Bengaluru, Mysuru &amp; Hubballi
          </p>
        </div>

        <div className="relative mx-auto grid flex-1 grid-cols-2 gap-4 sm:max-w-lg">
          {FLOAT_CARDS.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: 1,
                y: [0, -6, 0],
              }}
              transition={{
                delay: i * 0.08,
                y: { duration: 3 + i * 0.2, repeat: Infinity, ease: "easeInOut" },
              }}
              className="rounded-2xl border border-white/10 bg-[#12121F]/90 p-4 shadow-[0_0_20px_rgba(255,107,53,0.2)]"
              style={{ rotate: i % 2 === 0 ? -4 : 4 }}
            >
              <p className="text-2xl">{c.icon}</p>
              <p className="font-display text-sm text-white">{c.title}</p>
              <p className="text-xs text-emerald-300">{c.salary}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section ref={statsRef} className="relative z-10 border-y border-white/5 bg-[#12121F] py-12">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:grid-cols-4">
          <div>
            <p className="font-display text-2xl text-[#FFD60A]">
              {s1.toLocaleString("en-IN")}+
            </p>
            <p className="text-sm text-white/60">Karnataka SSLC Students</p>
          </div>
          <div>
            <p className="font-display text-2xl text-[#FFD60A]">{s2}+</p>
            <p className="text-sm text-white/60">Career Paths</p>
          </div>
          <div>
            <p className="font-display text-2xl text-[#FFD60A]">{s3}</p>
            <p className="text-sm text-white/60">Cities Served</p>
          </div>
          <div>
            <p className="font-display text-2xl text-[#FFD60A]">100%</p>
            <p className="text-sm text-white/60">Free</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 mx-auto max-w-6xl space-y-10 px-4 py-16">
        <h2 className="font-display text-2xl text-white">How it works</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {[
            { n: "1", title: "Tell us about yourself", body: "Quick onboarding — city, class, language.", icon: "🧑‍🎓" },
            { n: "2", title: "Play the career discovery game", body: "RIASEC-style scenarios reveal your strengths.", icon: "🎮" },
            { n: "3", title: "Get your AI-powered roadmap", body: "Colleges, exams, and next steps for Karnataka.", icon: "🗺️" },
          ].map((s) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="relative rounded-2xl border border-white/10 bg-[#12121F] p-6"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#FF6B35]/20 text-lg">
                {s.icon}
              </div>
              <p className="text-xs text-[#FF6B35]">Step {s.n}</p>
              <p className="font-display text-lg text-white">{s.title}</p>
              <p className="mt-2 text-sm text-white/65">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Feature cards */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 pb-16">
        <div className="grid gap-6 md:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="rounded-2xl border border-white/10 bg-[#12121F] p-6"
          >
            <p className="text-2xl">🤖</p>
            <h3 className="mt-2 font-display text-lg text-white">AI Career Guide</h3>
            <p className="mt-2 text-sm text-white/65">
              Chat in Kannada, Hindi, or English. Our AI asks the right questions and finds YOUR perfect career match.
            </p>
            <Link href="/chat" className="mt-4 inline-block text-sm text-[#FFD60A]">
              Try AI Chat →
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl border border-white/10 bg-[#12121F] p-6"
          >
            <p className="text-2xl">🎮</p>
            <h3 className="mt-2 font-display text-lg text-white">Psychology Games</h3>
            <p className="mt-2 text-sm text-white/65">
              12 science-backed questions reveal your hidden strengths. Discover if you&apos;re a Builder, Healer, or Visionary.
            </p>
            <Link href="/games" className="mt-4 inline-block text-sm text-[#FFD60A]">
              Play Now →
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-white/10 bg-[#12121F] p-6"
          >
            <p className="text-2xl">🗺️</p>
            <h3 className="mt-2 font-display text-lg text-white">Karnataka College Map</h3>
            <p className="mt-2 text-sm text-white/65">
              Find colleges in Bengaluru, Mysuru, and Hubballi that align with your career and CET score.
            </p>
            <Link href="/colleges" className="mt-4 inline-block text-sm text-[#FFD60A]">
              Explore Colleges →
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Cities */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 pb-16">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { city: "Bengaluru", badge: "Tech Capital", body: "Infosys, Wipro, and a vibrant startup scene for internships." },
            { city: "Mysuru", badge: "Heritage + Growth", body: "CFTRI, NIE, and strong science & design ecosystems." },
            { city: "Hubballi", badge: "North Karnataka Hub", body: "KLE, BVB — growing opportunities closer to home." },
          ].map((c) => (
            <div key={c.city} className="rounded-2xl border border-white/10 bg-[#12121F] p-6">
              <p className="text-xs uppercase tracking-widest text-[#FF6B35]">{c.badge}</p>
              <h3 className="font-display text-xl text-white">{c.city}</h3>
              <p className="mt-2 text-sm text-white/65">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 pb-20">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              q: "CareerCompass helped me realise I should be a UX designer, not an engineer. Now I have a portfolio and internship.",
              a: "Preethi, Class 12, Bengaluru",
            },
            {
              q: "The Kannada interface made everything so clear. My parents finally understood my career choice.",
              a: "Raju, Class 10, Hubballi",
            },
            {
              q: "I scored S-rank in the Medicine game. Now I am fully focused on NEET preparation.",
              a: "Divya, Class 11, Mysuru",
            },
          ].map((x) => (
            <div key={x.a} className="rounded-2xl border border-[#FFD60A]/20 bg-[#12121F]/80 p-5 text-sm text-white/80">
              <p>&ldquo;{x.q}&rdquo;</p>
              <p className="mt-3 text-xs text-[#FFD60A]">— {x.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-black/40 px-4 py-12">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-4">
          <div>
            <p className="font-display text-lg">
              <span className="text-white">Career</span>
              <span className="bg-gradient-to-r from-[#FF6B35] to-[#FFD60A] bg-clip-text text-transparent">
                Compass
              </span>
            </p>
            <p className="mt-2 text-sm text-white/55">Built for Karnataka students.</p>
          </div>
          <div>
            <p className="text-xs uppercase text-white/40">Product</p>
            <ul className="mt-2 space-y-1 text-sm text-white/70">
              <li><Link href="/explore">Explore</Link></li>
              <li><Link href="/games">Games</Link></li>
              <li><Link href="/colleges">Colleges</Link></li>
              <li><Link href="/scholarships">Scholarships</Link></li>
              <li><Link href="/exams">Exams</Link></li>
              <li><Link href="/timetable">Timetable</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase text-white/40">Resources</p>
            <ul className="mt-2 space-y-1 text-sm text-white/70">
              <li><Link href="/about">About</Link></li>
              <li>Blog (coming soon)</li>
              <li><Link href="/contact">Contact</Link></li>
              <li>School Partnership</li>
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase text-white/40">Connect</p>
            <ul className="mt-2 space-y-1 text-sm text-white/70">
              <li>Twitter</li>
              <li>Instagram</li>
              <li>LinkedIn</li>
              <li>WhatsApp Community</li>
            </ul>
          </div>
        </div>
        <p className="mx-auto mt-10 max-w-6xl text-center text-xs text-white/45">
          Made with ❤️ for Karnataka&apos;s 8.7 lakh students | © 2026 CareerCompass Karnataka
        </p>
      </footer>
    </div>
  );
}
