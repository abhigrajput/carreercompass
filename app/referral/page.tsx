"use client";

import { useState } from "react";
import { loadStudentProfile } from "@/lib/student-storage";
import { Button } from "@/components/ui/button";

export default function ReferralPage() {
  const profile = loadStudentProfile();
  const code = profile?.id ? profile.id.slice(0, 8).toUpperCase() : "CCDEMO";
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wa = "https://wa.me/?text=" + encodeURIComponent("Join CareerCompass with my code " + code + " — free career guide for Karnataka students!");

  return (
    <div className="mx-auto max-w-lg px-4 pb-24 pt-24 text-center">
      <h1 className="font-display text-3xl text-white">Refer friends</h1>
      <p className="mt-2 text-white/65">Earn 50 points per friend who joins</p>
      <p className="mt-8 font-mono text-4xl font-bold text-[#FFD60A]">{code}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button type="button" onClick={() => void copy()} className="bg-[#FF6B35] text-[#080814]">{copied ? "Copied!" : "Copy code"}</Button>
        <a href={wa} target="_blank" rel="noreferrer"><Button type="button" variant="outline" className="border-white/20 text-white">WhatsApp</Button></a>
      </div>
      <ul className="mt-10 space-y-2 text-left text-sm text-white/70">
        <li>3 referrals → Community Builder badge + 200 pts</li>
        <li>5 referrals → 1 month Pro free</li>
        <li>10 referrals → Karnataka Ambassador + 3 months Pro</li>
      </ul>
    </div>
  );
}
