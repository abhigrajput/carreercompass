import fs from "fs";

const d = "div";
const content = `"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function DemoPage() {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch("/api/demo").then((r) => r.json()).then(setData);
  }, []);
  const p = data?.profile;
  return (
    <${d} className="mx-auto max-w-4xl px-4 pb-24 pt-24">
      <${d} className="mb-4 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm text-amber-100">
        Demo Mode — Ravi Kumar, Class 11, Bengaluru
      </${d}>
      <h1 className="font-display text-3xl text-white">Demo Dashboard</h1>
      {p ? (
        <${d} className="mt-6 grid gap-4 sm:grid-cols-3">
          <Card className="border-white/10 bg-[#12121F]"><CardContent className="p-4"><p className="text-white/60">Streak</p><p className="text-2xl text-white">{p.streakDays}d</p></CardContent></Card>
          <Card className="border-white/10 bg-[#12121F]"><CardContent className="p-4"><p className="text-white/60">Points</p><p className="text-2xl text-[#FFD60A]">{p.points}</p></CardContent></Card>
          <Card className="border-white/10 bg-[#12121F]"><CardContent className="p-4"><p className="text-sm text-white">{data.personalityType}</p></CardContent></Card>
        </${d}>
      ) : null}
      <Link href="/onboarding"><Button className="mt-8 bg-[#FF6B35] text-[#080814]">Start your real journey</Button></Link>
    </${d}>
  );
}
`;

fs.writeFileSync("app/demo/page.tsx", content);
console.log("wrote demo");
