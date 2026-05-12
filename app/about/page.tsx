"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  Gamepad2,
  GraduationCap,
  Heart,
  Mail,
  MapPin,
  Route,
  Sparkles,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

const STEPS = [
  {
    num: "1",
    icon: BookOpen,
    title: "Tell us about yourself",
    desc: "Name, class, city, and preferred language — takes under a minute.",
  },
  {
    num: "2",
    icon: Gamepad2,
    title: "Play ability games",
    desc: "Scenario-based mini-games that map your strengths to career domains.",
  },
  {
    num: "3",
    icon: Route,
    title: "Get your AI roadmap",
    desc: "A practical 90-day career plan with Karnataka-specific resources.",
  },
];

const CITIES = [
  {
    name: "Bengaluru",
    desc: "Tech hub with 4.2L+ students across 200+ colleges.",
  },
  {
    name: "Mysuru",
    desc: "Heritage city home to the University of Mysore and 1.1L+ students.",
  },
  {
    name: "Hubballi",
    desc: "North Karnataka's education centre with 90k+ students.",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-[#080814]">
      {/* Hero */}
      <section className="relative mx-auto max-w-5xl px-4 pb-16 pt-28 text-center">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,107,53,0.25),_transparent_55%)]" />
        <motion.div
          initial="hidden"
          animate="visible"
          custom={0}
          variants={fadeUp}
          className="relative"
        >
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-white/70">
            <Sparkles className="h-3.5 w-3.5 text-[#FFD60A]" />
            About CareerCompass
          </div>
          <h1 className="font-display text-4xl leading-tight text-white sm:text-5xl">
            We believe every Karnataka student deserves{" "}
            <span className="bg-gradient-to-r from-[#FF6B35] to-[#FFD60A] bg-clip-text text-transparent">
              world-class career guidance
            </span>{" "}
            — free, in their language.
          </h1>
        </motion.div>
      </section>

      {/* Problem */}
      <section className="border-y border-white/10 bg-black/20 py-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={0}
          variants={fadeUp}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="font-display text-3xl text-white">
            93% of students know only{" "}
            <span className="text-[#FF6B35]">7–10 careers</span>.
          </p>
          <p className="mt-4 text-lg text-white/65">
            We want to change that.
          </p>
        </motion.div>
      </section>

      {/* Solution — How it works */}
      <section className="mx-auto max-w-5xl px-4 py-20">
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={0}
          variants={fadeUp}
          className="mb-12 text-center font-display text-3xl text-white"
        >
          How CareerCompass Works
        </motion.h2>
        <div className="grid gap-8 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i + 1}
              variants={fadeUp}
            >
              <Card className="h-full rounded-2xl border border-white/10 bg-[#12121F]">
                <CardContent className="p-6">
                  <span className="text-4xl font-bold text-[#FF6B35]">
                    {step.num}
                  </span>
                  <step.icon className="mt-3 h-8 w-8 text-[#FFD60A]" />
                  <h3 className="mt-4 font-display text-xl text-white">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm text-white/65">{step.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Founder */}
      <section className="border-y border-white/10 bg-black/10 py-16">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={0}
          variants={fadeUp}
          className="mx-auto max-w-3xl px-4 text-center"
        >
          <GraduationCap className="mx-auto mb-4 h-12 w-12 text-[#FFD60A]" />
          <h2 className="font-display text-2xl text-white">
            Built by a student, for students
          </h2>
          <p className="mt-4 text-white/65">
            KLE Institute of Technology, VTU — because we know what it&apos;s
            like to face career confusion without guidance.
          </p>
        </motion.div>
      </section>

      {/* Cities */}
      <section className="mx-auto max-w-5xl px-4 py-20">
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={0}
          variants={fadeUp}
          className="mb-12 text-center font-display text-3xl text-white"
        >
          Cities We Serve
        </motion.h2>
        <div className="grid gap-6 md:grid-cols-3">
          {CITIES.map((city, i) => (
            <motion.div
              key={city.name}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i + 1}
              variants={fadeUp}
            >
              <Card className="h-full rounded-2xl border border-[#FF6B35]/25 bg-gradient-to-br from-[#12121F] to-black/50">
                <CardContent className="p-6 text-center">
                  <MapPin className="mx-auto h-8 w-8 text-[#FF6B35]" />
                  <h3 className="mt-3 font-display text-2xl text-white">
                    {city.name}
                  </h3>
                  <p className="mt-2 text-sm text-white/60">{city.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Contact + CTA */}
      <section className="border-t border-white/10 bg-black/20 py-16">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={0}
          variants={fadeUp}
          className="mx-auto max-w-3xl space-y-8 px-4 text-center"
        >
          <div className="flex items-center justify-center gap-2 text-white/70">
            <Mail className="h-5 w-5 text-[#FFD60A]" />
            <a
              href="mailto:careercompass.karnataka@gmail.com"
              className="text-white hover:text-[#FFD60A]"
            >
              careercompass.karnataka@gmail.com
            </a>
          </div>
          <div>
            <a
              href="mailto:careercompass.karnataka@gmail.com?subject=School%20Partnership%20Inquiry"
              className="inline-flex items-center justify-center rounded-xl bg-[#FF6B35] px-8 py-3 text-base font-semibold text-[#080814] hover:bg-[#ff844f]"
            >
              Apply for School Partnership
            </a>
          </div>
          <p className="text-sm text-white/40">
            Made with{" "}
            <Heart className="inline h-4 w-4 text-[#FF6B35]" /> for
            Karnataka&apos;s students.
          </p>
        </motion.div>
      </section>
    </div>
  );
}
