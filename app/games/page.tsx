"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, RotateCcw, Sparkles } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { ProGate } from "@/components/ProGate";
import { buildSignedHeaders } from "@/lib/client-api";
import { useSwipe } from "@/lib/swipe";
import {
  loadStudentProfile,
  patchStudentProfile,
} from "@/lib/student-storage";
import { cn } from "@/lib/utils";
import type { HollandScoreMap, PersonalityInsights } from "@/types";

/* ───── RIASEC traits ───── */

type Trait = "R" | "I" | "A" | "S" | "E" | "C";
type Traits = Partial<Record<Trait, number>>;
type Scores = Record<Trait, number>;

const ZERO_SCORES: Scores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };

const TRAIT_META: Record<Trait, { label: string; color: string }> = {
  R: { label: "Realistic", color: "#FF6B35" },
  I: { label: "Investigative", color: "#06d6a0" },
  A: { label: "Artistic", color: "#FFD60A" },
  S: { label: "Social", color: "#38bdf8" },
  E: { label: "Enterprising", color: "#c084fc" },
  C: { label: "Conventional", color: "#f87171" },
};

/* ───── questions ───── */

interface QuestionOption {
  icon: string;
  label: string;
  sub: string;
  traits: Traits;
}

interface Question {
  id: number;
  type: "story" | "scenario" | "visual";
  scene?: string;
  text: string;
  sub: string;
  options: QuestionOption[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    type: "story",
    scene:
      "It\u2019s a quiet Sunday morning. You have the whole day free with no plans.",
    text: "What do you find yourself naturally doing?",
    sub: "Pick the one that feels most like you.",
    options: [
      { icon: "\u{1F527}", label: "Building or fixing something", sub: "Tinkering, DIY, making things work", traits: { R: 3 } },
      { icon: "\u{1F4D6}", label: "Reading and researching", sub: "Books, articles, deep dives", traits: { I: 3 } },
      { icon: "\u{1F3A8}", label: "Creating something artistic", sub: "Drawing, music, writing, crafts", traits: { A: 3 } },
      { icon: "\u{1F4DE}", label: "Calling friends and family", sub: "Catching up, making plans together", traits: { S: 3 } },
    ],
  },
  {
    id: 2,
    type: "visual",
    text: "Which workspace makes you feel most alive?",
    sub: "Trust your gut \u2014 choose what excites you.",
    options: [
      { icon: "\u{1F3D7}\uFE0F", label: "Workshop / field site", sub: "Tools, machines, outdoors", traits: { R: 3 } },
      { icon: "\u{1F52C}", label: "Research lab", sub: "Experiments, data, discovery", traits: { I: 3 } },
      { icon: "\u{1F3AC}", label: "Creative studio", sub: "Design, film, music", traits: { A: 3 } },
      { icon: "\u{1F3E5}", label: "Hospital / school", sub: "Helping people daily", traits: { S: 3 } },
      { icon: "\u{1F4CA}", label: "Corporate office", sub: "Meetings, strategy, deals", traits: { E: 3 } },
      { icon: "\u{1F5C2}\uFE0F", label: "Quiet organised office", sub: "Systems, processes, data", traits: { C: 3 } },
    ],
  },
  {
    id: 3,
    type: "scenario",
    scene:
      "Your friend is going through a tough time \u2014 failing exams, stressed, and not talking to anyone.",
    text: "What is your natural first response?",
    sub: "Be honest \u2014 what would you actually do?",
    options: [
      { icon: "\u{1F91D}", label: "Sit with them and just listen", sub: "Let them vent without advice", traits: { S: 3 } },
      { icon: "\u{1F4CB}", label: "Make a study plan together", sub: "Fix the problem practically", traits: { C: 2, I: 1 } },
      { icon: "\u{1F4A1}", label: "Research resources and share", sub: "Articles, tutors, scholarships", traits: { I: 2, S: 1 } },
      { icon: "\u{1F3A4}", label: "Give them a motivational talk", sub: "Energise and inspire them", traits: { E: 3 } },
    ],
  },
  {
    id: 4,
    type: "story",
    scene: "You find \u20B910,000 unexpectedly. No obligations attached.",
    text: "What do you do with it?",
    sub: "First instinct wins here.",
    options: [
      { icon: "\u{1F6E0}\uFE0F", label: "Buy tools or equipment", sub: "For a project you\u2019ve been planning", traits: { R: 3 } },
      { icon: "\u{1F4DA}", label: "Buy courses and books", sub: "Invest in learning something new", traits: { I: 2, C: 1 } },
      { icon: "\u2708\uFE0F", label: "Plan a trip", sub: "New experiences and places", traits: { A: 2, S: 1 } },
      { icon: "\u{1F4BC}", label: "Invest or save it smartly", sub: "Think long-term returns", traits: { E: 2, C: 1 } },
    ],
  },
  {
    id: 5,
    type: "visual",
    text: "Which image makes your heart beat a little faster?",
    sub: "Pure instinct \u2014 no overthinking.",
    options: [
      { icon: "\u{1F3D4}\uFE0F", label: "Summit of a mountain", sub: "Extreme, physical, conquered", traits: { R: 2, E: 1 } },
      { icon: "\u{1F9E9}", label: "A solved complex puzzle", sub: "Logic, satisfaction, clarity", traits: { I: 3 } },
      { icon: "\u{1F3AD}", label: "Standing ovation on stage", sub: "Performing, applause, expression", traits: { A: 2, E: 1 } },
      { icon: "\u{1F468}\u200D\u{1F469}\u200D\u{1F467}", label: "A family you helped", sub: "Impact, gratitude, connection", traits: { S: 3 } },
      { icon: "\u{1F4C8}", label: "Your startup going viral", sub: "Growth, ambition, hustle", traits: { E: 3 } },
      { icon: "\u{1F4C1}", label: "A perfectly organised system", sub: "Order, efficiency, control", traits: { C: 3 } },
    ],
  },
  {
    id: 6,
    type: "scenario",
    scene:
      "Your group project is behind schedule. The presentation is in 2 days.",
    text: "What role do you naturally take?",
    sub: "What actually happens \u2014 not what you wish you would do.",
    options: [
      { icon: "\u26A1", label: "Just start doing the work", sub: "Roll up sleeves, fix things fast", traits: { R: 2, C: 1 } },
      { icon: "\u{1F50D}", label: "Analyse what went wrong first", sub: "Find the root cause, then act", traits: { I: 3 } },
      { icon: "\u{1F3A8}", label: "Redesign the entire presentation", sub: "Make it visually stunning", traits: { A: 3 } },
      { icon: "\u{1F91D}", label: "Motivate and coordinate the team", sub: "Get everyone moving together", traits: { S: 1, E: 2 } },
    ],
  },
  {
    id: 7,
    type: "story",
    scene:
      "You have one full year \u2014 no exams, no pressure \u2014 to do whatever you love.",
    text: "How do you spend that year?",
    sub: "Dream big. What would actually make you happy?",
    options: [
      { icon: "\u{1F33F}", label: "Building something with your hands", sub: "A garden, a machine, a house", traits: { R: 3 } },
      { icon: "\u{1F52D}", label: "Researching a fascinating topic", sub: "Science, history, human behaviour", traits: { I: 3 } },
      { icon: "\u{1F3B5}", label: "Making art that moves people", sub: "Music, film, writing, design", traits: { A: 3 } },
      { icon: "\u{1F30D}", label: "Travelling and helping communities", sub: "Volunteering, teaching, connecting", traits: { S: 2, E: 1 } },
    ],
  },
  {
    id: 8,
    type: "visual",
    text: "Which kind of problem do you secretly enjoy solving?",
    sub: "The one you lose track of time doing.",
    options: [
      { icon: "\u2699\uFE0F", label: "How things work mechanically", sub: "Engines, circuits, structures", traits: { R: 3 } },
      { icon: "\u{1F9E0}", label: "Why people behave a certain way", sub: "Psychology, patterns, data", traits: { I: 2, S: 1 } },
      { icon: "\u270F\uFE0F", label: "How to communicate an idea beautifully", sub: "Design, storytelling, branding", traits: { A: 3 } },
      { icon: "\u{1F4AC}", label: "How to help someone feel better", sub: "Empathy, conflict, support", traits: { S: 3 } },
      { icon: "\u{1F4B0}", label: "How to grow money or a business", sub: "Strategy, markets, negotiation", traits: { E: 3 } },
      { icon: "\u{1F4D0}", label: "How to organise a complex system", sub: "Processes, spreadsheets, plans", traits: { C: 3 } },
    ],
  },
  {
    id: 9,
    type: "scenario",
    scene:
      "You have to give a speech in front of 200 people tomorrow. No escape.",
    text: "What is your honest reaction right now?",
    sub: "Be completely real with yourself.",
    options: [
      { icon: "\u{1F630}", label: "Dread \u2014 I will keep it short and technical", sub: "Just data and facts, no drama", traits: { R: 1, I: 1, C: 1 } },
      { icon: "\u{1F624}", label: "I will over-prepare every word", sub: "Research, script, practice 10 times", traits: { I: 2, C: 1 } },
      { icon: "\u{1F60F}", label: "This is my moment \u2014 I love this", sub: "I am born for the spotlight", traits: { A: 1, E: 2 } },
      { icon: "\u{1F60A}", label: "Nervous but focused on helping people", sub: "I want my words to matter to them", traits: { S: 3 } },
    ],
  },
  {
    id: 10,
    type: "story",
    scene: "Your ideal Saturday involves waking up with no plans.",
    text: "How does your perfect day unfold?",
    sub: "Go with what genuinely energises you.",
    options: [
      { icon: "\u{1F528}", label: "Hands deep in a project", sub: "Fixing, making, building something real", traits: { R: 3 } },
      { icon: "\u{1F4F0}", label: "Learning something completely new", sub: "Documentaries, papers, experiments", traits: { I: 3 } },
      { icon: "\u{1F3A7}", label: "Creating something from scratch", sub: "Music, art, a story, a design", traits: { A: 3 } },
      { icon: "\u2615", label: "Deep conversations with people", sub: "Cafes, debates, meaningful talks", traits: { S: 2, E: 1 } },
    ],
  },
  {
    id: 11,
    type: "visual",
    text: "Which achievement would make you feel the most proud?",
    sub: "Imagine 10 years from now. Which legacy matters most?",
    options: [
      { icon: "\u{1F3C6}", label: "Built something that still stands", sub: "A bridge, a product, a machine", traits: { R: 3 } },
      { icon: "\u{1F48A}", label: "A discovery that saved lives", sub: "Research, medicine, science", traits: { I: 3 } },
      { icon: "\u{1F3AC}", label: "Created something that moved millions", sub: "A film, a song, a design", traits: { A: 3 } },
      { icon: "\u{1F469}\u200D\u{1F3EB}", label: "Shaped thousands of lives", sub: "Teaching, mentoring, healing", traits: { S: 3 } },
      { icon: "\u{1F981}", label: "Built a company from zero", sub: "Jobs created, wealth built", traits: { E: 3 } },
      { icon: "\u{1F3DB}\uFE0F", label: "Changed a broken system", sub: "Policy, law, government", traits: { C: 2, E: 1 } },
    ],
  },
  {
    id: 12,
    type: "scenario",
    scene:
      "If you could press a button and fix ONE thing about the world right now.",
    text: "What do you fix?",
    sub: "Your gut answer reveals a lot about you.",
    options: [
      { icon: "\u{1F331}", label: "Climate and the physical world", sub: "Pollution, infrastructure, nature", traits: { R: 2, I: 1 } },
      { icon: "\u{1F9EC}", label: "Disease and human health", sub: "Cancer, mental illness, poverty", traits: { I: 2, S: 1 } },
      { icon: "\u{1F393}", label: "Education and opportunity gaps", sub: "Every child gets a real chance", traits: { S: 2, A: 1 } },
      { icon: "\u2696\uFE0F", label: "Inequality and justice systems", sub: "Fair laws, equal rights, real freedom", traits: { E: 2, S: 1 } },
    ],
  },
];

/* ───── personality types ───── */

interface CareerMatch {
  rank: string;
  name: string;
  id: string;
  reason: string;
  salary: string;
  match: number;
}

interface PersonalityType {
  name: string;
  icon: string;
  tagline: string;
  traits: Scores;
  careers: CareerMatch[];
}

const PERSONALITY_TYPES: Record<string, PersonalityType> = {
  RI: { name: "The Builder-Scientist", icon: "\u{1F52C}", tagline: "You solve real-world problems with technical precision. Happiest when your hands and mind work together.", traits: { R: 85, I: 80, A: 30, S: 25, E: 40, C: 55 }, careers: [{ rank: "\u{1F947}", name: "Biomedical Engineer", id: "biomedical-engineer", reason: "Combines hands-on building with scientific research", salary: "\u20B98\u201335 LPA", match: 96 }, { rank: "\u{1F948}", name: "Civil Engineer", id: "civil-engineer", reason: "Designing structures that require deep analytical thinking", salary: "\u20B95\u201320 LPA", match: 88 }, { rank: "\u{1F949}", name: "Data Scientist", id: "data-scientist", reason: "Solving complex technical problems with data and systems", salary: "\u20B910\u201350 LPA", match: 79 }] },
  RA: { name: "The Creative Builder", icon: "\u{1F3D7}\uFE0F", tagline: "You build things that are functional AND beautiful. Art meets engineering in everything you create.", traits: { R: 85, I: 35, A: 80, S: 30, E: 40, C: 45 }, careers: [{ rank: "\u{1F947}", name: "Architect", id: "architect", reason: "Structurally sound AND visually stunning is your superpower", salary: "\u20B95\u201320 LPA", match: 96 }, { rank: "\u{1F948}", name: "Industrial Designer", id: "ux-designer", reason: "Creating products that work well and look beautiful", salary: "\u20B96\u201322 LPA", match: 88 }, { rank: "\u{1F949}", name: "Game Developer", id: "game-developer", reason: "Building interactive worlds requires technical and creative mastery", salary: "\u20B96\u201325 LPA", match: 79 }] },
  IA: { name: "The Innovative Thinker", icon: "\u{1F4A1}", tagline: "You question everything and express findings beautifully. Rare \u2014 you think rigorously AND create beautifully.", traits: { R: 30, I: 85, A: 80, S: 35, E: 45, C: 40 }, careers: [{ rank: "\u{1F947}", name: "UX Designer", id: "ux-designer", reason: "Combining research, psychology, and design to solve human problems", salary: "\u20B95\u201325 LPA", match: 96 }, { rank: "\u{1F948}", name: "Science Journalist", id: "journalist", reason: "Translating complex ideas into compelling stories", salary: "\u20B94\u201315 LPA", match: 88 }, { rank: "\u{1F949}", name: "AI / ML Engineer", id: "data-scientist", reason: "Mathematics, creativity, and problem solving combined", salary: "\u20B912\u201360 LPA", match: 79 }] },
  IS: { name: "The Analytical Healer", icon: "\u{1F9E0}", tagline: "You combine deep thinking with genuine care for people. You want to understand humans, not just help them.", traits: { R: 25, I: 85, A: 35, S: 80, E: 30, C: 50 }, careers: [{ rank: "\u{1F947}", name: "Psychologist", id: "psychologist", reason: "Deep human analysis + genuine desire to heal", salary: "\u20B95\u201320 LPA", match: 96 }, { rank: "\u{1F948}", name: "Doctor (MBBS)", id: "doctor", reason: "Science-driven healing that changes lives", salary: "\u20B910\u201350 LPA", match: 88 }, { rank: "\u{1F949}", name: "Research Scientist", id: "science", reason: "You can spend years understanding one thing deeply", salary: "\u20B96\u201325 LPA", match: 79 }] },
  IE: { name: "The Visionary Analyst", icon: "\u{1F4CA}", tagline: "You see patterns others miss and turn them into bold strategies. You build systems that last.", traits: { R: 30, I: 85, A: 40, S: 30, E: 80, C: 55 }, careers: [{ rank: "\u{1F947}", name: "Management Consultant", id: "commerce", reason: "Analysing companies and devising strategy \u2014 pure I+E territory", salary: "\u20B912\u201350 LPA", match: 96 }, { rank: "\u{1F948}", name: "Startup Founder", id: "entrepreneur", reason: "Analytical rigour + boldness to build something from nothing", salary: "Unlimited", match: 88 }, { rank: "\u{1F949}", name: "Chartered Accountant", id: "ca", reason: "Using data and insight to make high-stakes decisions", salary: "\u20B97\u201330 LPA", match: 79 }] },
  AS: { name: "The Compassionate Creator", icon: "\u{1F3A8}", tagline: "You create to connect. Art is your language of love and your work always has a human heart.", traits: { R: 25, I: 35, A: 85, S: 80, E: 40, C: 30 }, careers: [{ rank: "\u{1F947}", name: "Teacher / Educator", id: "teacher", reason: "Creative delivery + genuine care for students growth", salary: "\u20B93\u201315 LPA", match: 96 }, { rank: "\u{1F948}", name: "Graphic Designer", id: "ux-designer", reason: "Creating work that emotionally moves real people", salary: "\u20B95\u201322 LPA", match: 88 }, { rank: "\u{1F949}", name: "Counsellor / Social Worker", id: "psychologist", reason: "Using empathy and creativity to support people", salary: "\u20B93\u201312 LPA", match: 79 }] },
  AE: { name: "The Visionary Performer", icon: "\u{1F3AD}", tagline: "You were born to lead through creativity. The stage, the boardroom, the pitch deck \u2014 all your domain.", traits: { R: 25, I: 35, A: 85, S: 45, E: 80, C: 30 }, careers: [{ rank: "\u{1F947}", name: "Film Director / Creator", id: "creative", reason: "Leading creative teams to produce culture-changing work", salary: "\u20B93L\u2013Unlimited", match: 96 }, { rank: "\u{1F948}", name: "Marketing Strategist", id: "commerce", reason: "Using creative storytelling to build brands people love", salary: "\u20B96\u201325 LPA", match: 88 }, { rank: "\u{1F949}", name: "Creative Entrepreneur", id: "entrepreneur", reason: "You have the vision AND drive to build a creative empire", salary: "Unlimited", match: 79 }] },
  SE: { name: "The People\u2019s Champion", icon: "\u{1F91D}", tagline: "You inspire people to act. You genuinely care AND have the energy to lead. That combination is rare.", traits: { R: 25, I: 35, A: 40, S: 85, E: 80, C: 35 }, careers: [{ rank: "\u{1F947}", name: "IAS / IPS Officer", id: "government", reason: "Leading systems that serve millions \u2014 ultimate S+E career", salary: "\u20B98\u201320 LPA + perks", match: 96 }, { rank: "\u{1F948}", name: "Doctor + Administrator", id: "doctor", reason: "Healing people AND building systems that heal more", salary: "\u20B915\u201350 LPA", match: 88 }, { rank: "\u{1F949}", name: "Social Entrepreneur", id: "entrepreneur", reason: "Building organisations that solve human problems at scale", salary: "Variable + impact", match: 79 }] },
  EC: { name: "The Organised Leader", icon: "\u{1F4CB}", tagline: "You build empires on solid foundations. You lead with strategy not chaos and your systems outlast everyone.", traits: { R: 30, I: 45, A: 30, S: 40, E: 85, C: 85 }, careers: [{ rank: "\u{1F947}", name: "Chartered Accountant / CFO", id: "ca", reason: "Leading financial systems with precision and vision", salary: "\u20B97\u201330 LPA", match: 96 }, { rank: "\u{1F948}", name: "Product Manager", id: "tech", reason: "Organising complexity and leading teams to deliver", salary: "\u20B98\u201335 LPA", match: 88 }, { rank: "\u{1F949}", name: "Corporate Lawyer", id: "lawyer", reason: "Building legal arguments with rigour and leadership", salary: "\u20B95\u201330 LPA", match: 79 }] },
  SC: { name: "The Caring Organiser", icon: "\u{1F4DA}", tagline: "You organise the world so others can thrive. Behind every great institution is someone like you.", traits: { R: 30, I: 45, A: 35, S: 80, E: 40, C: 80 }, careers: [{ rank: "\u{1F947}", name: "School Teacher / Principal", id: "teacher", reason: "Organising education while genuinely caring about students", salary: "\u20B93\u201315 LPA", match: 96 }, { rank: "\u{1F948}", name: "HR Manager", id: "commerce", reason: "Supporting people while building systems that help them grow", salary: "\u20B95\u201318 LPA", match: 88 }, { rank: "\u{1F949}", name: "Hospital Administrator", id: "medicine", reason: "Managing complex healthcare to serve more patients", salary: "\u20B96\u201320 LPA", match: 79 }] },
};

function calcResult(scores: Scores): string {
  const sorted = (Object.entries(scores) as [Trait, number][]).sort(
    (a, b) => b[1] - a[1],
  );
  const top2 = sorted
    .slice(0, 2)
    .map((x) => x[0])
    .sort()
    .join("");
  if (PERSONALITY_TYPES[top2]) return top2;
  const combos = Object.keys(PERSONALITY_TYPES);
  return combos.find((c) => c.includes(sorted[0][0])) ?? "IS";
}

function normalizeHollandScores(scores: Scores): HollandScoreMap {
  const maxScore = Math.max(...Object.values(scores), 1);
  return {
    R: Math.round((scores.R / maxScore) * 100),
    I: Math.round((scores.I / maxScore) * 100),
    A: Math.round((scores.A / maxScore) * 100),
    S: Math.round((scores.S / maxScore) * 100),
    E: Math.round((scores.E / maxScore) * 100),
    C: Math.round((scores.C / maxScore) * 100),
  };
}

/* ───── hero title cycling ───── */

const HERO_LINES = [
  "Discover Your Path",
  "\u0CA8\u0CBF\u0CAE\u0CCD\u0CAE \u0CA6\u0CBE\u0CB0\u0CBF \u0C95\u0C82\u0CA1\u0CC1\u0C95\u0CC6\u0CBE\u0CB3\u0CCD\u0CB3\u0CBF",
  "\u0905\u092A\u0928\u093E \u0930\u093E\u0938\u094D\u0924\u093E \u0916\u094B\u091C\u0947\u0902",
];

const TYPE_BADGES: Record<string, string> = {
  story: "Story",
  scenario: "Scenario",
  visual: "Visual Pick",
};

/* ───── component ───── */

type Screen = "intro" | "game" | "results";

export default function GamesPage() {
  const { t } = useTranslation("common");

  const [screen, setScreen] = useState<Screen>("intro");
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [scores, setScores] = useState<Scores>({ ...ZERO_SCORES });
  const [heroIdx, setHeroIdx] = useState(0);
  const [saved, setSaved] = useState(false);
  const [insights, setInsights] = useState<PersonalityInsights | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  /* hero rotation */
  useEffect(() => {
    if (screen !== "intro") return;
    const id = window.setInterval(
      () => setHeroIdx((i) => (i + 1) % HERO_LINES.length),
      3000,
    );
    return () => window.clearInterval(id);
  }, [screen]);

  const question = QUESTIONS[qIndex];
  const progress = (qIndex + 1) / QUESTIONS.length;
  const selected = answers[question?.id];

  const pick = useCallback(
    (optIdx: number) => {
      if (!question) return;
      setAnswers((prev) => ({ ...prev, [question.id]: optIdx }));
    },
    [question],
  );

  const goNext = useCallback(() => {
    if (selected == null || !question) return;
    const opt = question.options[selected];
    const nextScores = { ...scores };
    for (const [trait, pts] of Object.entries(opt.traits) as [Trait, number][]) {
      nextScores[trait] = (nextScores[trait] ?? 0) + pts;
    }
    setScores(nextScores);

    if (qIndex < QUESTIONS.length - 1) {
      setQIndex(qIndex + 1);
    } else {
      setScreen("results");
    }
  }, [selected, question, scores, qIndex]);

  const goBack = useCallback(() => {
    if (qIndex > 0) setQIndex(qIndex - 1);
  }, [qIndex]);

  const restart = useCallback(() => {
    setScreen("intro");
    setQIndex(0);
    setAnswers({});
    setScores({ ...ZERO_SCORES });
    setSaved(false);
    setInsights(null);
    setInsightsLoading(false);
  }, []);

  /* save to supabase */
  const resultKey = useMemo(() => calcResult(scores), [scores]);
  const personality = PERSONALITY_TYPES[resultKey];
  const normalizedScores = useMemo(() => normalizeHollandScores(scores), [scores]);
  const swipeHandlers = useSwipe(
    selected != null ? () => void goNext() : undefined,
    qIndex > 0 ? goBack : undefined,
  );

  useEffect(() => {
    if (screen !== "results" || saved) return;
    setSaved(true);
    const profile = loadStudentProfile();
    patchStudentProfile({
      personalityType: personality?.name ?? null,
      hollandScores: normalizedScores,
    });
    if (!profile?.authToken) return;
    const payload = {
      studentId: profile?.id ?? null,
      careerDomain: resultKey,
      score: Math.max(...Object.values(scores)),
      totalQuestions: QUESTIONS.length,
      correctAnswers: QUESTIONS.length,
    };
    void (async () => {
      const headers = await buildSignedHeaders(payload);
      await fetch("/api/game-results", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
    })().catch(() => {});
  }, [normalizedScores, personality?.name, resultKey, saved, screen, scores]);

  useEffect(() => {
    if (screen !== "results" || !personality || insights || insightsLoading) return;

    setInsightsLoading(true);
    void fetch("/api/personality-insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        personalityType: personality.name,
        hollandScores: normalizedScores,
        language: loadStudentProfile()?.language ?? "en",
      }),
    })
      .then((res) => res.json())
      .then((data: { insights?: PersonalityInsights }) => {
        if (data.insights) {
          setInsights(data.insights);
        }
      })
      .finally(() => {
        setInsightsLoading(false);
      });
  }, [insights, insightsLoading, normalizedScores, personality, screen]);

  /* max trait value for bar scaling */
  const maxTrait = Math.max(...Object.values(scores), 1);

  /* ───── Intro Screen ───── */
  if (screen === "intro") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#080814] px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-lg text-center"
        >
          <div className="mb-6 flex justify-center">
            <Sparkles className="h-10 w-10 text-[#FFD60A]" />
          </div>
          <AnimatePresence mode="wait">
            <motion.h1
              key={heroIdx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
              className="font-display text-4xl font-bold text-white sm:text-5xl"
            >
              {HERO_LINES[heroIdx]}
            </motion.h1>
          </AnimatePresence>
          <p className="mx-auto mt-4 max-w-md text-white/65">
            {t("games.introSub")}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {["Story-based", "Scenario", "Visual", "5\u20137 mins", "Free"].map(
              (tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70"
                >
                  {tag}
                </span>
              ),
            )}
          </div>
          <Button
            type="button"
            className="mt-8 rounded-xl bg-[#FF6B35] px-8 py-6 text-lg text-[#080814] hover:bg-[#ff844f]"
            onClick={() => setScreen("game")}
          >
            {t("games.startGame")} <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </div>
    );
  }

  /* ───── Results Screen ───── */
  if (screen === "results" && personality) {
    const topCareer = personality.careers[0];
    return (
      <div className="mx-auto max-w-2xl px-4 pb-16 pt-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Personality card */}
          <div className="rounded-2xl border border-white/10 bg-[#12121F] p-8 text-center">
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-block text-6xl"
            >
              {personality.icon}
            </motion.span>
            <p className="mt-4 text-xs uppercase tracking-[0.3em] text-[#FF6B35]">
              {t("games.yourType")}
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold text-white">
              {personality.name}
            </h2>
            <p className="mt-2 italic text-white/60">{personality.tagline}</p>

            {/* RIASEC bars */}
            <div className="mx-auto mt-8 max-w-sm space-y-3">
              {(Object.keys(TRAIT_META) as Trait[]).map((tr, i) => (
                <div key={tr} className="flex items-center gap-3 text-sm">
                  <span className="w-28 text-left text-white/70">
                    {TRAIT_META[tr].label}
                  </span>
                  <div className="relative h-4 flex-1 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{ backgroundColor: TRAIT_META[tr].color }}
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.round((scores[tr] / maxTrait) * 100)}%`,
                      }}
                      transition={{ delay: 0.3 + i * 0.08, duration: 0.6 }}
                    />
                  </div>
                  <span className="w-8 text-right font-mono text-xs text-white/50">
                    {scores[tr]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Career matches */}
          <div>
            <h3 className="mb-4 font-display text-xl text-white">
              {t("games.topCareers")}
            </h3>
            <div className="space-y-3">
              {personality.careers.map((c, i) => (
                <motion.div
                  key={c.id + i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.12 }}
                  className="flex items-center gap-4 rounded-2xl border border-white/10 bg-[#12121F] p-5"
                >
                  <span className="text-3xl">{c.rank}</span>
                  <div className="flex-1">
                    <p className="font-display text-lg font-semibold text-white">
                      {c.name}
                    </p>
                    <p className="text-sm text-white/60">{c.reason}</p>
                    <p className="mt-1 text-xs text-white/45">{c.salary}</p>
                  </div>
                  <span className="font-mono text-lg font-bold text-[#FF6B35]">
                    {c.match}%
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-display text-xl text-white">
              Deep Personality Insights
            </h3>
            <ProGate
              feature="full AI personality insights"
              fallback={
                <div className="rounded-2xl border border-[#FFD60A]/30 bg-[#FFD60A]/10 p-5 text-white/85">
                  <p className="font-display text-lg text-white">
                    Unlock Full Insights (Pro)
                  </p>
                  <p className="mt-2 text-sm text-white/70">
                    Get deeper strengths, blind spots, study style advice, and work-environment guidance based on your Holland profile.
                  </p>
                  <Link
                    href="/pricing"
                    className="mt-4 inline-flex rounded-xl bg-[#FF6B35] px-4 py-2 text-sm font-medium text-[#080814]"
                  >
                    Upgrade to Pro
                  </Link>
                </div>
              }
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-[#12121F] p-5">
                  <p className="mb-3 text-xs uppercase tracking-wide text-[#FF6B35]">
                    Core strengths
                  </p>
                  <ul className="space-y-2 text-sm text-white/80">
                    {(insights?.strengths ?? []).map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[#12121F] p-5">
                  <p className="mb-3 text-xs uppercase tracking-wide text-[#FF6B35]">
                    Hidden weaknesses
                  </p>
                  <ul className="space-y-2 text-sm text-white/80">
                    {(insights?.weaknesses ?? []).map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[#12121F] p-5 md:col-span-2">
                  <p className="mb-2 text-xs uppercase tracking-wide text-[#FF6B35]">
                    Ideal work environment
                  </p>
                  <p className="text-sm text-white/80">
                    {insightsLoading
                      ? "Generating your insight profile..."
                      : insights?.idealEnvironment}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[#12121F] p-5">
                  <p className="mb-3 text-xs uppercase tracking-wide text-[#FF6B35]">
                    Similar role models
                  </p>
                  <ul className="space-y-2 text-sm text-white/80">
                    {(insights?.roleModels ?? []).map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[#12121F] p-5">
                  <p className="mb-3 text-xs uppercase tracking-wide text-[#FF6B35]">
                    Careers to avoid
                  </p>
                  <ul className="space-y-2 text-sm text-white/80">
                    {(insights?.careersToAvoid ?? []).map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[#12121F] p-5 md:col-span-2">
                  <p className="mb-2 text-xs uppercase tracking-wide text-[#FF6B35]">
                    Best study style
                  </p>
                  <p className="text-sm text-white/80">{insights?.studyStyle}</p>
                </div>
              </div>
            </ProGate>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/explore`}
              className={cn(
                buttonVariants({ variant: "default" }),
                "rounded-xl bg-[#FF6B35] px-6 py-5 text-[#080814] hover:bg-[#ff844f]",
              )}
            >
              Explore {topCareer.name} <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href={`/roadmap?career=${topCareer.id}`}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "rounded-xl border-[#FFD60A]/40 px-6 py-5 text-[#FFD60A]",
              )}
            >
              {t("games.ctaRoadmap")} <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Button
              type="button"
              variant="ghost"
              className="rounded-xl text-white/60 hover:text-white"
              onClick={restart}
            >
              <RotateCcw className="mr-2 h-4 w-4" /> {t("games.retake")}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ───── Game Screen (12 questions) ───── */
  return (
    <div className="mx-auto max-w-2xl px-4 pb-16 pt-24">
      {/* progress bar */}
      <div className="mb-2 h-2 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#FF6B35] to-[#FFD60A]"
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.35 }}
        />
      </div>
      <div className="mb-6 flex items-center justify-between text-sm text-white/60">
        <span>
          {t("games.questionProgress", {
            current: qIndex + 1,
            total: QUESTIONS.length,
          })}
        </span>
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs">
          {TYPE_BADGES[question.type]}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.3 }}
          className="space-y-5"
          {...swipeHandlers}
        >
          {/* scene box */}
          {question.scene ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm italic leading-relaxed text-white/80">
                {question.scene}
              </p>
            </div>
          ) : null}

          <h2 className="font-display text-2xl font-bold text-white">
            {question.text}
          </h2>
          <p className="text-sm text-white/50">{question.sub}</p>

          {/* options */}
          <div
            className={
              question.type === "visual"
                ? "grid grid-cols-2 gap-3 sm:grid-cols-3"
                : "space-y-3"
            }
          >
            {question.options.map((opt, idx) => {
              const isSelected = selected === idx;
              return question.type === "visual" ? (
                <button
                  key={idx}
                  type="button"
                  onClick={() => pick(idx)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-2xl border p-5 text-center transition",
                    isSelected
                      ? "border-[#FF6B35] bg-[#FF6B35]/10 shadow-[0_0_24px_rgba(255,107,53,0.15)]"
                      : "border-white/10 bg-[#12121F] hover:border-white/25",
                  )}
                >
                  <span className="text-4xl">{opt.icon}</span>
                  <span className="text-sm font-semibold text-white">
                    {opt.label}
                  </span>
                  <span className="text-xs text-white/50">{opt.sub}</span>
                </button>
              ) : (
                <button
                  key={idx}
                  type="button"
                  onClick={() => pick(idx)}
                  className={cn(
                    "flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition",
                    isSelected
                      ? "border-[#FF6B35] bg-[#FF6B35]/10 shadow-[0_0_24px_rgba(255,107,53,0.15)]"
                      : "border-white/10 bg-[#12121F] hover:border-white/25",
                  )}
                >
                  <span className="text-3xl">{opt.icon}</span>
                  <div>
                    <p className="font-semibold text-white">{opt.label}</p>
                    <p className="text-sm text-white/50">{opt.sub}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* nav buttons */}
      <div className="mt-8 flex justify-between">
        <Button
          type="button"
          variant="ghost"
          className="text-white/60"
          disabled={qIndex === 0}
          onClick={goBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> {t("games.back")}
        </Button>
        <Button
          type="button"
          className="rounded-xl bg-[#FF6B35] px-6 text-[#080814] hover:bg-[#ff844f]"
          disabled={selected == null}
          onClick={goNext}
        >
          {qIndex === QUESTIONS.length - 1
            ? t("games.finish")
            : t("games.next")}{" "}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
