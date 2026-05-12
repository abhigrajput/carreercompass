"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Copy,
  Edit3,
  MessageCircle,
  Route,
  Save,
  Share2,
  User,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  loadStudentProfile,
  saveStudentProfile,
} from "@/lib/student-storage";
import type {
  CitySlug,
  LocaleCode,
  StreamSlug,
  StudentClass,
  StudentProfile,
} from "@/types";

const MOCK_SCORES = [
  { domain: "Engineering", score: 80 },
  { domain: "Medicine", score: 60 },
  { domain: "Tech", score: 90 },
];

const CLASS_OPTIONS: StudentClass[] = ["10", "11", "12"];
const CITY_OPTIONS: CitySlug[] = ["bengaluru", "mysuru", "hubballi"];
const LANG_OPTIONS: LocaleCode[] = ["en", "kn", "hi"];
const STREAM_OPTIONS: StreamSlug[] = ["science", "commerce", "arts"];

const CITY_LABELS: Record<CitySlug, string> = {
  bengaluru: "Bengaluru",
  mysuru: "Mysuru",
  hubballi: "Hubballi",
};
const LANG_LABELS: Record<LocaleCode, string> = {
  en: "English",
  kn: "ಕನ್ನಡ",
  hi: "हिन्दी",
};
const STREAM_LABELS: Record<StreamSlug, string> = {
  science: "Science",
  commerce: "Commerce",
  arts: "Arts",
};

export default function ProfilePage() {
  useTranslation("common");
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<StudentProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const [shareToken, setShareToken] = useState<string | null>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareErr, setShareErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "https://careercompass.in";

  const shareUrl = shareToken
    ? `${baseUrl}/parent?token=${encodeURIComponent(shareToken)}`
    : null;

  const whatsappHref = shareUrl
    ? `https://wa.me/?text=${encodeURIComponent(
        `CareerCompass — ಪಾಲಕರು ಈ ಲಿಂಕ್ ಮೂಲಕ ಪ್ರಗತಿ ನೋಡಬಹುದು: ${shareUrl}`,
      )}`
    : null;

  useEffect(() => {
    const p = loadStudentProfile();
    setProfile(p);
    setDraft(p);
  }, []);

  const startEditing = () => {
    setDraft(profile ? { ...profile } : null);
    setEditing(true);
    setSaveMsg(null);
  };

  const handleSave = async () => {
    if (!draft) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      saveStudentProfile(draft);
      setProfile({ ...draft });
      await fetch("/api/student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      setSaveMsg("Profile saved!");
      setEditing(false);
    } catch {
      setSaveMsg("Failed to sync to server — saved locally.");
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const generateParentLink = async () => {
    if (!profile?.id) {
      setShareErr("Complete onboarding first to share with parents.");
      return;
    }
    setShareLoading(true);
    setShareErr(null);
    try {
      const res = await fetch("/api/parent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: profile.id }),
      });
      const data = (await res.json()) as { token?: string; error?: string };
      if (!res.ok || !data.token) {
        setShareErr(data.error ?? "Could not generate link.");
        return;
      }
      setShareToken(data.token);
    } catch {
      setShareErr("Could not generate link.");
    } finally {
      setShareLoading(false);
    }
  };

  const copyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setShareErr("Failed to copy.");
    }
  };

  if (profile === null && typeof window !== "undefined") {
    return (
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-28 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <User className="mx-auto mb-4 h-16 w-16 text-white/30" />
          <h1 className="font-display text-3xl text-white">
            No Profile Found
          </h1>
          <p className="mt-3 text-white/60">
            Complete onboarding to set up your profile.
          </p>
          <Link
            href="/onboarding"
            className="mt-6 inline-flex rounded-xl bg-[#FF6B35] px-6 py-3 font-semibold text-[#080814] hover:bg-[#ff844f]"
          >
            Start Onboarding
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 pt-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-wrap items-center justify-between gap-4"
      >
        <h1 className="font-display text-3xl text-white sm:text-4xl">
          My Profile
        </h1>
        {!editing && (
          <Button
            onClick={startEditing}
            className="rounded-xl bg-[#FF6B35] text-[#080814] hover:bg-[#ff844f]"
          >
            <Edit3 className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        )}
      </motion.div>

      {saveMsg && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={cn(
            "mb-6 rounded-xl px-4 py-3 text-sm",
            saveMsg.includes("Failed")
              ? "border border-red-500/30 bg-red-500/10 text-red-200"
              : "border border-[#06d6a0]/30 bg-[#06d6a0]/10 text-[#06d6a0]",
          )}
        >
          {saveMsg}
        </motion.div>
      )}

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Card className="mb-8 rounded-2xl border border-white/10 bg-[#12121F]">
          <CardHeader>
            <CardTitle className="font-display text-xl text-white">
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            {editing && draft ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-white/50">Name</label>
                  <Input
                    value={draft.name}
                    onChange={(e) =>
                      setDraft({ ...draft, name: e.target.value })
                    }
                    className="border-white/15 bg-black/30 text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/50">Class</label>
                  <select
                    value={draft.class}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        class: e.target.value as StudentClass,
                      })
                    }
                    className="w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
                  >
                    {CLASS_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        Class {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/50">City</label>
                  <select
                    value={draft.city}
                    onChange={(e) =>
                      setDraft({ ...draft, city: e.target.value as CitySlug })
                    }
                    className="w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
                  >
                    {CITY_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {CITY_LABELS[c]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/50">Language</label>
                  <select
                    value={draft.language}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        language: e.target.value as LocaleCode,
                      })
                    }
                    className="w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
                  >
                    {LANG_OPTIONS.map((l) => (
                      <option key={l} value={l}>
                        {LANG_LABELS[l]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/50">Stream</label>
                  <select
                    value={draft.stream ?? ""}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        stream: (e.target.value || null) as StreamSlug | null,
                      })
                    }
                    className="w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
                  >
                    <option value="">Not selected</option>
                    {STREAM_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {STREAM_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/50">Email</label>
                  <Input
                    type="email"
                    value={draft.email ?? ""}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        email: e.target.value || null,
                      })
                    }
                    placeholder="optional"
                    className="border-white/15 bg-black/30 text-white"
                  />
                </div>
                <div className="sm:col-span-2 flex gap-3 pt-2">
                  <Button
                    onClick={() => void handleSave()}
                    disabled={saving}
                    className="rounded-xl bg-[#06d6a0] text-[#080814] hover:bg-[#06d6a0]/80"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? "Saving…" : "Save"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditing(false);
                      setDraft(profile);
                    }}
                    className="rounded-xl border-white/15 text-white hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 text-sm sm:grid-cols-2">
                <InfoRow label="Name" value={profile?.name} />
                <InfoRow
                  label="Class"
                  value={profile?.class ? `Class ${profile.class}` : undefined}
                />
                <InfoRow
                  label="City"
                  value={
                    profile?.city ? CITY_LABELS[profile.city] : undefined
                  }
                />
                <InfoRow
                  label="Language"
                  value={
                    profile?.language
                      ? LANG_LABELS[profile.language]
                      : undefined
                  }
                />
                <InfoRow
                  label="Stream"
                  value={
                    profile?.stream
                      ? STREAM_LABELS[profile.stream]
                      : "Not selected"
                  }
                />
                <InfoRow
                  label="Email"
                  value={profile?.email ?? "Not provided"}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Career Interests */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="mb-8 rounded-2xl border border-white/10 bg-[#12121F]">
          <CardHeader>
            <CardTitle className="font-display text-xl text-white">
              My Career Interests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-white/50">
              Explore careers to build your interest list.
            </p>
            <Link
              href="/explore"
              className="mt-4 inline-flex rounded-xl bg-[#FF6B35]/15 px-4 py-2 text-sm font-medium text-[#FF6B35] hover:bg-[#FF6B35]/25"
            >
              Explore Careers
            </Link>
          </CardContent>
        </Card>
      </motion.div>

      {/* Game Scores */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card className="mb-8 rounded-2xl border border-white/10 bg-[#12121F]">
          <CardHeader>
            <CardTitle className="font-display text-xl text-white">
              My Game Scores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MOCK_SCORES}>
                  <XAxis
                    dataKey="domain"
                    tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }}
                    axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
                    axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                    tickLine={false}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#12121F",
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: 12,
                      color: "#fff",
                    }}
                  />
                  <Bar
                    dataKey="score"
                    fill="#FF6B35"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Roadmap Link */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="mb-8 rounded-2xl border border-dashed border-[#FFD60A]/30 bg-[#12121F]/60">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <h3 className="font-display text-lg text-white">My Roadmap</h3>
              <p className="mt-1 text-sm text-white/50">
                View your personalised career roadmap.
              </p>
            </div>
            <Link
              href="/roadmap"
              className="inline-flex items-center rounded-xl bg-[#FFD60A]/15 px-4 py-2 text-sm font-medium text-[#FFD60A] hover:bg-[#FFD60A]/25"
            >
              <Route className="mr-2 h-4 w-4" />
              View Roadmap
            </Link>
          </CardContent>
        </Card>
      </motion.div>

      {/* Share with Parents */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Card className="rounded-2xl border border-[#FFD60A]/25 bg-[#12121F]">
          <CardHeader>
            <CardTitle className="font-display text-xl text-white">
              <Share2 className="mr-2 inline h-5 w-5 text-[#FFD60A]" />
              Share with Parents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-white/60">
              Generate a secure link so your parents can view your progress.
            </p>
            {shareErr && (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {shareErr}
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => void generateParentLink()}
                disabled={shareLoading}
                className="rounded-xl bg-[#FF6B35] text-[#080814] hover:bg-[#ff844f]"
              >
                <Share2 className="mr-2 h-4 w-4" />
                {shareLoading ? "Generating…" : "Share with Parents"}
              </Button>
              {shareUrl && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => void copyLink()}
                    className="rounded-xl border-white/15 text-white hover:bg-white/10"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    {copied ? "Copied!" : "Copy Link"}
                  </Button>
                  {whatsappHref && (
                    <Link
                      href={whatsappHref}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center rounded-xl border border-emerald-500/40 px-4 py-2 text-sm text-emerald-200 hover:bg-emerald-500/10"
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      WhatsApp Share
                    </Link>
                  )}
                </>
              )}
            </div>
            {shareUrl && (
              <p className="break-all rounded-xl bg-black/30 px-3 py-2 font-mono text-xs text-white/80">
                {shareUrl}
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | undefined;
}) {
  return (
    <div>
      <p className="text-xs text-white/45">{label}</p>
      <p className="mt-0.5 text-white">{value ?? "—"}</p>
    </div>
  );
}
