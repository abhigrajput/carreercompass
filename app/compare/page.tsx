"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProGate } from "@/components/ProGate";
import { CAREERS } from "@/lib/careers";
import {
  CAREER_COMPARE_DATA,
  type CompareCareerId,
} from "@/lib/career-compare-data";
import { loadStudentProfile } from "@/lib/student-storage";
import type { HollandScoreMap } from "@/types";

const DEFAULT_IDS: CompareCareerId[] = [
  "software-engineer",
  "doctor",
  "ias-officer",
];

function fitScore(id: CompareCareerId, hollandScores?: HollandScoreMap | null) {
  const data = CAREER_COMPARE_DATA[id];
  if (!hollandScores) return 70;
  const total =
    (hollandScores.R ?? 0) * data.fitWeights.R +
    (hollandScores.I ?? 0) * data.fitWeights.I +
    (hollandScores.A ?? 0) * data.fitWeights.A +
    (hollandScores.S ?? 0) * data.fitWeights.S +
    (hollandScores.E ?? 0) * data.fitWeights.E +
    (hollandScores.C ?? 0) * data.fitWeights.C;
  return Math.max(45, Math.min(98, Math.round(total / 120)));
}

function toneRank(rank: number): string {
  if (rank === 0) return "bg-emerald-500/15 text-emerald-200";
  if (rank === 1) return "bg-yellow-500/15 text-yellow-200";
  return "bg-red-500/15 text-red-200";
}

export default function ComparePage() {
  const profile = loadStudentProfile();
  const [selectedIds, setSelectedIds] = useState<CompareCareerId[]>(DEFAULT_IDS);
  const [analysis, setAnalysis] = useState<{
    summary: string;
    bestMatchCareerId: string;
    reasons: string[];
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const selected = useMemo(
    () => selectedIds.map((id) => CAREERS.find((career) => career.id === id)).filter(Boolean),
    [selectedIds],
  );

  const fitScores = useMemo(
    () =>
      selectedIds.map((id) => ({
        id,
        score: fitScore(id, profile?.hollandScores ?? null),
      })),
    [profile?.hollandScores, selectedIds],
  );

  const salaryRanks = [...selectedIds].sort(
    (a, b) => CAREER_COMPARE_DATA[b].avgSalaryLpa - CAREER_COMPARE_DATA[a].avgSalaryLpa,
  );
  const timeRanks = [...selectedIds].sort(
    (a, b) => CAREER_COMPARE_DATA[a].yearsToJob - CAREER_COMPARE_DATA[b].yearsToJob,
  );
  const securityRanks = [...selectedIds].sort(
    (a, b) => CAREER_COMPARE_DATA[b].jobSecurity - CAREER_COMPARE_DATA[a].jobSecurity,
  );
  const balanceRanks = [...selectedIds].sort(
    (a, b) => CAREER_COMPARE_DATA[b].workLifeBalance - CAREER_COMPARE_DATA[a].workLifeBalance,
  );

  const getRankClass = (order: CompareCareerId[], id: CompareCareerId) =>
    toneRank(order.indexOf(id));

  async function runAnalysis() {
    setLoading(true);
    try {
      const res = await fetch("/api/compare-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          careerIds: selectedIds,
          language: profile?.language ?? "en",
          hollandScores: profile?.hollandScores ?? null,
        }),
      });
      const data = (await res.json()) as {
        summary?: string;
        bestMatchCareerId?: string;
        reasons?: string[];
      };
      if (data.summary && data.bestMatchCareerId && Array.isArray(data.reasons)) {
        setAnalysis({
          summary: data.summary,
          bestMatchCareerId: data.bestMatchCareerId,
          reasons: data.reasons,
        });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-24">
      <div className="mb-8">
        <h1 className="font-display text-4xl text-white">Career Comparison Tool</h1>
        <p className="mt-2 text-white/65">
          Compare up to 3 career paths side by side and check how well each fits your profile.
        </p>
      </div>

      <Card className="mb-6 rounded-2xl border-white/10 bg-[#12121F]">
        <CardHeader>
          <CardTitle className="text-white">Choose careers</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <select
              key={index}
              value={selectedIds[index]}
              onChange={(e) => {
                const next = [...selectedIds];
                next[index] = e.target.value as CompareCareerId;
                setSelectedIds(next);
                setAnalysis(null);
              }}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white"
            >
              {Object.keys(CAREER_COMPARE_DATA).map((id) => {
                const career = CAREERS.find((item) => item.id === id);
                return (
                  <option key={id} value={id}>
                    {career?.name ?? id}
                  </option>
                );
              })}
            </select>
          ))}
        </CardContent>
      </Card>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#12121F]">
        <table className="min-w-full text-sm text-white">
          <thead>
            <tr className="border-b border-white/10">
              <th className="p-4 text-left text-white/50">Feature</th>
              {selected.map((career) => (
                <th key={career?.id} className="p-4 text-left font-display text-lg">
                  {career?.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              {
                label: "Avg Salary",
                render: (id: CompareCareerId) => CAREER_COMPARE_DATA[id].salaryLabel,
                rank: salaryRanks,
              },
              {
                label: "Time to Job",
                render: (id: CompareCareerId) => CAREER_COMPARE_DATA[id].timeToJobLabel,
                rank: timeRanks,
              },
              {
                label: "Entrance Exam",
                render: (id: CompareCareerId) => CAREER_COMPARE_DATA[id].entranceExam,
                rank: selectedIds,
              },
              {
                label: "Job Security",
                render: (id: CompareCareerId) => CAREER_COMPARE_DATA[id].jobSecurityLabel,
                rank: securityRanks,
              },
              {
                label: "Work-Life Balance",
                render: (id: CompareCareerId) => CAREER_COMPARE_DATA[id].workLifeBalanceLabel,
                rank: balanceRanks,
              },
              {
                label: "Karnataka Colleges",
                render: (id: CompareCareerId) => CAREER_COMPARE_DATA[id].collegesLabel,
                rank: salaryRanks,
              },
              {
                label: "AI Match Score",
                render: (id: CompareCareerId) =>
                  `${fitScores.find((item) => item.id === id)?.score ?? 70}%`,
                rank: [...fitScores].sort((a, b) => b.score - a.score).map((item) => item.id),
              },
            ].map((row) => (
              <tr key={row.label} className="border-b border-white/10">
                <td className="p-4 text-white/60">{row.label}</td>
                {selectedIds.map((id) => (
                  <td key={`${row.label}-${id}`} className="p-4">
                    <span className={`rounded-full px-3 py-1 ${getRankClass(row.rank as CompareCareerId[], id)}`}>
                      {row.render(id)}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border-white/10 bg-[#12121F]">
          <CardHeader>
            <CardTitle className="text-white">Compare with my personality</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-white/75">
            <p>
              Your current Holland profile is used to estimate fit scores. This becomes more accurate after you complete the discovery game.
            </p>
            <div className="flex flex-wrap gap-2">
              {fitScores.map((item) => {
                const career = CAREERS.find((entry) => entry.id === item.id);
                return (
                  <span
                    key={item.id}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1"
                  >
                    {career?.name}: {item.score}%
                  </span>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <ProGate
          feature="advanced career comparison analysis"
          fallback={
            <Card className="rounded-2xl border-[#FFD60A]/30 bg-[#FFD60A]/10">
              <CardHeader>
                <CardTitle className="text-white">Which is better for me?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-white/80">
                <p>Unlock deeper AI comparison analysis and personalized reasoning.</p>
                <Link
                  href="/pricing"
                  className="inline-flex rounded-xl bg-[#FF6B35] px-4 py-2 font-medium text-[#080814]"
                >
                  Upgrade to Pro
                </Link>
              </CardContent>
            </Card>
          }
        >
          <Card className="rounded-2xl border-white/10 bg-[#12121F]">
            <CardHeader>
              <CardTitle className="text-white">Which is better for me?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-white/80">
              <Button
                type="button"
                onClick={() => void runAnalysis()}
                disabled={loading}
                className="rounded-xl bg-[#FF6B35] text-[#080814] hover:bg-[#ff844f]"
              >
                {loading ? "Analysing..." : "Get AI analysis"}
              </Button>
              {analysis ? (
                <div className="space-y-3">
                  <p>{analysis.summary}</p>
                  <ul className="space-y-2">
                    {analysis.reasons.map((reason) => (
                      <li key={reason}>• {reason}</li>
                    ))}
                  </ul>
                  <p className="text-[#FFD60A]">
                    Best match: {CAREERS.find((item) => item.id === analysis.bestMatchCareerId)?.name}
                  </p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </ProGate>
      </div>
    </div>
  );
}
