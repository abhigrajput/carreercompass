"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Metrics {
  totalStudents?: number;
  studentsToday?: number;
  studentsThisWeek?: number;
  proSubscribers?: number;
  gamesPlayed?: number;
  communityPosts?: number;
  mentorBookings?: number;
  totalRevenue?: number;
  topCareers?: { career: string; count: number }[];
  cityBreakdown?: { city: string; count: number }[];
  signupsByDay?: { day: string; count: number }[];
  latestSignups?: { name: string; city: string; created_at: string }[];
}

const fetcher = (url: string, token: string) =>
  fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then((r) =>
    r.json(),
  ) as Promise<Metrics>;

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const login = async () => {
    setErr(null);
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = (await res.json()) as { ok?: boolean; token?: string };
    if (!res.ok || !data.token) {
      setErr("Invalid password");
      return;
    }
    setToken(data.token);
    sessionStorage.setItem("cc_admin_token", data.token);
  };

  useEffect(() => {
    const t = sessionStorage.getItem("cc_admin_token");
    if (t) setToken(t);
  }, []);

  const { data: m, mutate } = useSWR(
    token ? ["/api/admin/metrics", token] : null,
    ([url, t]) => fetcher(url, t as string),
    { refreshInterval: 60_000 },
  );

  if (!token) {
    return (
      <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4 pt-24">
        <h1 className="font-display text-2xl text-white">Admin login</h1>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-4 border-white/10 bg-black/30 text-white"
          placeholder="Password"
        />
        {err ? <p className="mt-2 text-sm text-red-300">{err}</p> : null}
        <Button
          type="button"
          className="mt-4 bg-[#FF6B35] text-[#080814]"
          onClick={() => void login()}
        >
          Enter
        </Button>
      </div>
    );
  }

  const cards = [
    { label: "Total Students", val: m?.totalStudents ?? 0 },
    { label: "Today", val: m?.studentsToday ?? 0 },
    { label: "This Week", val: m?.studentsThisWeek ?? 0 },
    { label: "Pro Users", val: m?.proSubscribers ?? 0 },
    { label: "Games Played", val: m?.gamesPlayed ?? 0 },
    { label: "Revenue (₹)", val: m?.totalRevenue ?? 0 },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-24">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl text-white">CareerCompass Analytics — Live</h1>
        <Button type="button" variant="outline" className="border-white/20 text-white" onClick={() => void mutate()}>
          Refresh
        </Button>
      </div>
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Card key={c.label} className="border-white/10 bg-[#12121F]">
            <CardHeader><CardTitle className="text-sm text-white/60">{c.label}</CardTitle></CardHeader>
            <CardContent><p className="font-display text-2xl text-[#FFD60A]">{c.val}</p></CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-white/10 bg-[#12121F]">
        <CardHeader><CardTitle className="text-white">Top careers</CardTitle></CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={m?.topCareers ?? []}>
              <XAxis dataKey="career" tick={{ fill: "#aaa", fontSize: 10 }} />
              <YAxis tick={{ fill: "#aaa" }} />
              <Tooltip />
              <Bar dataKey="count" fill="#FF6B35" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
