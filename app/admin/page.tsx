"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Metrics {
  totalStudents: number;
  signupsToday: number;
  signupsThisWeek: number;
  proUsers: number;
  gamesPlayed: number;
  communityPosts: number;
  mentorBookings: number;
}

type BroadcastData = {
  history: { type: string; message: string; createdAt: string }[];
  audienceCounts: Record<
    "all" | "bengaluru" | "mysuru" | "hubballi" | "pro",
    number
  >;
};

type ModerationPost = {
  id: string;
  studentName: string;
  city: string;
  content: string;
  likes: number;
  createdAt: string;
  flagged: boolean;
};

type SecurityData = {
  recentErrors: { id: string; error: string; url: string; createdAt: string }[];
  rateLimitHits: number;
  topIps: { ipAddress: string; count: number }[];
  blockedIps: { id: string; ipAddress: string; reason: string; blockedAt: string }[];
};

type TabId = "analytics" | "broadcast" | "moderation" | "security";

const fetcher = <T,>(url: string, token: string) =>
  fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then((r) =>
    r.json(),
  ) as Promise<T>;

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [tab, setTab] = useState<TabId>("analytics");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastTarget, setBroadcastTarget] =
    useState<"all" | "bengaluru" | "mysuru" | "hubballi" | "pro">("all");
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [moderationFilter, setModerationFilter] =
    useState<"all" | "flagged">("all");
  const [blockIp, setBlockIp] = useState("");
  const [blockReason, setBlockReason] = useState("");

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
    const storedToken = sessionStorage.getItem("cc_admin_token");
    if (storedToken) setToken(storedToken);
  }, []);

  const { data: metrics, mutate: mutateMetrics } = useSWR(
    token ? ["/api/admin/metrics", token] : null,
    ([url, t]) => fetcher<Metrics>(url, t as string),
    { refreshInterval: 60_000 },
  );
  const { data: broadcasts, mutate: mutateBroadcasts } = useSWR(
    token ? ["/api/admin/broadcast", token] : null,
    ([url, t]) => fetcher<BroadcastData>(url, t as string),
  );
  const { data: moderation, mutate: mutateModeration } = useSWR(
    token ? ["/api/admin/moderation", token] : null,
    ([url, t]) => fetcher<{ posts: ModerationPost[] }>(url, t as string),
  );
  const { data: security, mutate: mutateSecurity } = useSWR(
    token ? ["/api/admin/security", token] : null,
    ([url, t]) => fetcher<SecurityData>(url, t as string),
  );

  const visiblePosts = useMemo(() => {
    const posts = moderation?.posts ?? [];
    return moderationFilter === "flagged"
      ? posts.filter((post) => post.flagged)
      : posts;
  }, [moderation?.posts, moderationFilter]);

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
    { label: "Total Students", val: metrics?.totalStudents ?? 0 },
    { label: "Today", val: metrics?.signupsToday ?? 0 },
    { label: "This Week", val: metrics?.signupsThisWeek ?? 0 },
    { label: "Pro Users", val: metrics?.proUsers ?? 0 },
    { label: "Games Played", val: metrics?.gamesPlayed ?? 0 },
    { label: "Community Posts", val: metrics?.communityPosts ?? 0 },
  ];

  async function refreshAll() {
    await Promise.all([
      mutateMetrics(),
      mutateBroadcasts(),
      mutateModeration(),
      mutateSecurity(),
    ]);
  }

  async function sendBroadcast() {
    if (!token || !broadcastMessage.trim()) return;
    await fetch("/api/admin/broadcast", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: broadcastMessage.trim(),
        target: broadcastTarget,
      }),
    });
    setBroadcastMessage("");
    await mutateBroadcasts();
  }

  async function deletePost(id: string) {
    if (!token) return;
    await fetch(`/api/admin/post/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setSelectedPosts((current) => current.filter((item) => item !== id));
    await mutateModeration();
    await mutateMetrics();
  }

  async function bulkDelete() {
    if (!token || selectedPosts.length === 0) return;
    await Promise.all(
      selectedPosts.map(async (id) => {
        await fetch(`/api/admin/post/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      }),
    );
    setSelectedPosts([]);
    await mutateModeration();
    await mutateMetrics();
  }

  async function addBlockedIp() {
    if (!token || !blockIp.trim()) return;
    await fetch("/api/admin/security", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ipAddress: blockIp.trim(),
        reason: blockReason.trim(),
      }),
    });
    setBlockIp("");
    setBlockReason("");
    await mutateSecurity();
  }

  async function removeBlockedIp(ipAddress: string) {
    if (!token) return;
    await fetch("/api/admin/security", {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ipAddress }),
    });
    await mutateSecurity();
  }

  const audiencePreview = broadcasts?.audienceCounts?.[broadcastTarget] ?? 0;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-24">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="font-display text-3xl text-white">
          CareerCompass Admin
        </h1>
        <Button
          type="button"
          variant="outline"
          className="border-white/20 text-white"
          onClick={() => void refreshAll()}
        >
          Refresh
        </Button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {(["analytics", "broadcast", "moderation", "security"] as TabId[]).map(
          (item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              className={`rounded-full px-4 py-2 text-sm ${
                tab === item
                  ? "bg-[#FF6B35] text-[#080814]"
                  : "bg-[#12121F] text-white/70"
              }`}
            >
              {item[0].toUpperCase() + item.slice(1)}
            </button>
          ),
        )}
      </div>

      {tab === "analytics" ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => (
              <Card key={card.label} className="border-white/10 bg-[#12121F]">
                <CardHeader>
                  <CardTitle className="text-sm text-white/60">
                    {card.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-display text-2xl text-[#FFD60A]">
                    {card.val}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="border-white/10 bg-[#12121F]">
            <CardHeader>
              <CardTitle className="text-white">New admin tools</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-black/20 p-4 text-sm text-white/75">
                Broadcast notifications to all students, a city cohort, or Pro users.
              </div>
              <div className="rounded-xl bg-black/20 p-4 text-sm text-white/75">
                Moderate recent community posts with flagged filtering and bulk delete.
              </div>
              <div className="rounded-xl bg-black/20 p-4 text-sm text-white/75">
                Monitor recent errors, rate-limit activity, and manage the IP blocklist.
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {tab === "broadcast" ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <Card className="border-white/10 bg-[#12121F]">
            <CardHeader>
              <CardTitle className="text-white">Broadcast</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                maxLength={200}
                placeholder="Write a student notification..."
                className="min-h-[140px] w-full rounded-xl border border-white/10 bg-black/30 p-4 text-white"
              />
              <select
                value={broadcastTarget}
                onChange={(e) =>
                  setBroadcastTarget(
                    e.target.value as
                      | "all"
                      | "bengaluru"
                      | "mysuru"
                      | "hubballi"
                      | "pro",
                  )
                }
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white"
              >
                <option value="all">All</option>
                <option value="bengaluru">Bengaluru</option>
                <option value="mysuru">Mysuru</option>
                <option value="hubballi">Hubballi</option>
                <option value="pro">Pro Users</option>
              </select>
              <p className="text-sm text-white/60">
                This will send to ~{audiencePreview} students
              </p>
              <Button
                type="button"
                className="bg-[#FF6B35] text-[#080814] hover:bg-[#ff844f]"
                onClick={() => void sendBroadcast()}
              >
                Send
              </Button>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-[#12121F]">
            <CardHeader>
              <CardTitle className="text-white">Recent broadcasts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(broadcasts?.history ?? []).map((item) => (
                <div
                  key={`${item.createdAt}-${item.message}`}
                  className="rounded-xl bg-black/20 p-4"
                >
                  <p className="text-xs uppercase text-white/45">
                    {item.type.replace("broadcast:", "")}
                  </p>
                  <p className="mt-2 text-sm text-white">{item.message}</p>
                  <p className="mt-1 text-xs text-white/45">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      ) : null}

      {tab === "moderation" ? (
        <Card className="border-white/10 bg-[#12121F]">
          <CardHeader>
            <CardTitle className="text-white">Moderation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={moderationFilter}
                onChange={(e) =>
                  setModerationFilter(e.target.value as "all" | "flagged")
                }
                className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white"
              >
                <option value="all">All</option>
                <option value="flagged">Flagged</option>
              </select>
              <Button
                type="button"
                variant="outline"
                className="border-red-500/30 text-red-200"
                onClick={() => void bulkDelete()}
              >
                Bulk delete ({selectedPosts.length})
              </Button>
            </div>
            <div className="space-y-3">
              {visiblePosts.map((post) => (
                <div key={post.id} className="rounded-xl bg-black/20 p-4">
                  <div className="mb-2 flex items-start justify-between gap-4">
                    <label className="flex items-center gap-3 text-sm text-white">
                      <input
                        type="checkbox"
                        checked={selectedPosts.includes(post.id)}
                        onChange={(e) =>
                          setSelectedPosts((current) =>
                            e.target.checked
                              ? [...current, post.id]
                              : current.filter((item) => item !== post.id),
                          )
                        }
                      />
                      {post.studentName} · {post.city}
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-red-500/30 text-red-200"
                      onClick={() => void deletePost(post.id)}
                    >
                      Delete
                    </Button>
                  </div>
                  <p className="text-sm text-white/80">{post.content}</p>
                  <p className="mt-2 text-xs text-white/45">
                    {post.likes} likes · {new Date(post.createdAt).toLocaleString()}
                    {post.flagged ? " · flagged" : ""}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {tab === "security" ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <Card className="border-white/10 bg-[#12121F]">
            <CardHeader>
              <CardTitle className="text-white">Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl bg-black/20 p-4 text-white">
                Rate limit hits:{" "}
                <span className="text-[#FFD60A]">
                  {security?.rateLimitHits ?? 0}
                </span>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-white/60">
                  Top IPs by request count
                </p>
                {(security?.topIps ?? []).map((item) => (
                  <div
                    key={item.ipAddress}
                    className="flex justify-between rounded-lg bg-black/20 p-3 text-sm text-white/80"
                  >
                    <span>{item.ipAddress}</span>
                    <span>{item.count}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-3 rounded-xl bg-black/20 p-4">
                <p className="text-sm text-white/60">Add blocked IP</p>
                <Input
                  value={blockIp}
                  onChange={(e) => setBlockIp(e.target.value)}
                  className="border-white/10 bg-black/30 text-white"
                  placeholder="IP address"
                />
                <Input
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="border-white/10 bg-black/30 text-white"
                  placeholder="Reason"
                />
                <Button
                  type="button"
                  className="bg-[#FF6B35] text-[#080814] hover:bg-[#ff844f]"
                  onClick={() => void addBlockedIp()}
                >
                  Add block
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-white/10 bg-[#12121F]">
              <CardHeader>
                <CardTitle className="text-white">Blocked IPs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(security?.blockedIps ?? []).map((item) => (
                  <div key={item.id} className="rounded-xl bg-black/20 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-white">{item.ipAddress}</p>
                        <p className="text-xs text-white/45">{item.reason}</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        className="border-red-500/30 text-red-200"
                        onClick={() => void removeBlockedIp(item.ipAddress)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-[#12121F]">
              <CardHeader>
                <CardTitle className="text-white">Recent error logs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(security?.recentErrors ?? []).map((item) => (
                  <div key={item.id} className="rounded-xl bg-black/20 p-4">
                    <p className="text-sm text-white">
                      {item.error || "Unknown error"}
                    </p>
                    <p className="mt-1 text-xs text-white/45">{item.url}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}
    </div>
  );
}
