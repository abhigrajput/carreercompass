"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Heart, MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { buildSignedHeaders } from "@/lib/client-api";
import { loadStudentProfile } from "@/lib/student-storage";
import { CAREERS } from "@/lib/careers";
import { careerDisplayName } from "@/lib/career-utils";
import type { LocaleCode } from "@/types";

type Post = {
  id: string;
  student_name: string;
  student_city: string;
  content: string;
  post_type: string;
  career_tag?: string | null;
  likes: number;
  created_at: string;
};

function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function CommunityPage() {
  const { t, i18n } = useTranslation("common");
  const lang = i18n.language as LocaleCode;
  const profile = loadStudentProfile();

  const [posts, setPosts] = useState<Post[]>([]);
  const [tab, setTab] = useState<"all" | "question" | "achievement" | "city">("all");
  const [content, setContent] = useState("");
  const [ptype, setPtype] = useState("Question");
  const [careerTag, setCareerTag] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/community")
      .then((r) => r.json())
      .then((j: { posts?: Post[] }) => setPosts(j.posts ?? []));
  }, []);

  const filtered = useMemo(() => {
    let list = posts;
    if (tab === "question") list = list.filter((p) => p.post_type === "Question");
    if (tab === "achievement") list = list.filter((p) => p.post_type === "Achievement");
    if (tab === "city" && profile?.city) {
      const city =
        profile.city === "bengaluru"
          ? "Bengaluru"
          : profile.city === "mysuru"
            ? "Mysuru"
            : "Hubballi";
      list = list.filter((p) => p.student_city === city);
    }
    return list;
  }, [posts, tab, profile?.city]);

  const submit = async () => {
    if (!content.trim() || content.length > 280) {
      setToastMsg(t("community.tooLong"));
      window.setTimeout(() => setToastMsg(null), 2500);
      return;
    }
    if (!profile?.authToken || !profile?.id) {
      setToastMsg(t("community.loginLike"));
      window.setTimeout(() => setToastMsg(null), 2500);
      return;
    }
    const res = await fetch("/api/community", {
      method: "POST",
      headers: await buildSignedHeaders({
        studentId: profile?.id,
        studentName: profile?.name ?? "Student",
        studentCity:
          profile?.city === "bengaluru"
            ? "Bengaluru"
            : profile?.city === "mysuru"
              ? "Mysuru"
              : "Hubballi",
        content: content.trim(),
        postType: ptype,
        careerTag: careerTag || null,
        isAnonymous,
      }),
      body: JSON.stringify({
        studentId: profile?.id,
        studentName: profile?.name ?? "Student",
        studentCity:
          profile?.city === "bengaluru"
            ? "Bengaluru"
            : profile?.city === "mysuru"
              ? "Mysuru"
              : "Hubballi",
        content: content.trim(),
        postType: ptype,
        careerTag: careerTag || null,
        isAnonymous,
      }),
    });
    const j = (await res.json()) as { post?: Post };
    if (j.post) {
      setPosts((p) => [j.post!, ...p]);
      setContent("");
      setIsAnonymous(false);
      setToastMsg(t("community.posted"));
      window.setTimeout(() => setToastMsg(null), 2500);
    }
  };

  const like = async (post: Post) => {
    if (!profile?.id) {
      setToastMsg(t("community.loginLike"));
      window.setTimeout(() => setToastMsg(null), 2500);
      return;
    }
    const res = await fetch("/api/community", {
      method: "PATCH",
      headers: await buildSignedHeaders({ postId: post.id, studentId: profile.id }),
      body: JSON.stringify({ postId: post.id, studentId: profile.id }),
    });
    const j = (await res.json()) as { likes?: number; liked?: boolean };
    if (typeof j.likes === "number") {
      setPosts((list) =>
        list.map((p) => (p.id === post.id ? { ...p, likes: j.likes! } : p)),
      );
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-24">
      <h1 className="font-display text-3xl text-white">{t("community.title")}</h1>
      <p className="mt-2 text-white/65">{t("community.subtitle")}</p>
      {toastMsg ? (
        <p className="mt-4 rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white/90">
          {toastMsg}
        </p>
      ) : null}

      <div className="mt-8 rounded-2xl border border-white/10 bg-[#12121F] p-4">
        <div className="mb-3 flex items-center gap-3">
          <span className="text-xs text-white/50">Post as:</span>
          <button
            type="button"
            onClick={() => setIsAnonymous((current) => !current)}
            className={`rounded-full border px-3 py-1 text-xs transition ${
              isAnonymous
                ? "border-[#FF6B35] bg-[#FF6B35]/10 text-[#FF6B35]"
                : "border-white/20 text-white/60"
            }`}
          >
            {isAnonymous ? "🎭 Anonymous" : `👤 ${profile?.name ?? "You"}`}
          </button>
        </div>
        <Textarea
          value={content}
          maxLength={280}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t("community.placeholder")}
          className="min-h-[88px] border-white/10 bg-black/30 text-white"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {["Question", "Achievement", "Advice", "CareerStory"].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPtype(p)}
              className={`rounded-full border px-3 py-1 text-xs ${
                ptype === p
                  ? "border-[#FF6B35] bg-[#FF6B35]/20 text-white"
                  : "border-white/15 text-white/70"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <select
          className="mt-3 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
          value={careerTag}
          onChange={(e) => setCareerTag(e.target.value)}
        >
          <option value="">{t("community.careerTagOptional")}</option>
          {CAREERS.slice(0, 20).map((c) => (
            <option key={c.id} value={c.id}>
              {careerDisplayName(c, lang)}
            </option>
          ))}
        </select>
        <Button
          type="button"
          className="mt-3 w-full rounded-xl bg-[#FF6B35] text-[#080814]"
          onClick={() => void submit()}
        >
          {t("community.post")}
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {(
          [
            ["all", t("community.tabAll")],
            ["question", t("community.tabQuestions")],
            ["achievement", t("community.tabAchievements")],
            ["city", t("community.tabCity")],
          ] as const
        ).map(([k, lab]) => (
          <Button
            key={k}
            type="button"
            variant={tab === k ? "default" : "outline"}
            size="sm"
            className={
              tab === k
                ? "rounded-full bg-[#FF6B35] text-[#080814]"
                : "rounded-full border-white/15 text-white"
            }
            onClick={() => setTab(k)}
          >
            {lab}
          </Button>
        ))}
      </div>

      <div className="mt-8 space-y-4">
        {filtered.map((p) => (
          <motion.article
            key={p.id}
            layout
            className="rounded-2xl border border-white/10 bg-[#12121F] p-4"
          >
            <div className="flex items-start gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${
                  p.student_name.toLowerCase().startsWith("anonymous")
                    ? "bg-white/10"
                    : "bg-[#FF6B35]/30"
                }`}
              >
                {p.student_name.toLowerCase().startsWith("anonymous")
                  ? "?"
                  : p.student_name.slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-medium text-white">{p.student_name}</span>
                  <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-white/60">
                    {p.student_city}
                  </span>
                  <span className="text-[10px] text-white/40">{timeAgo(p.created_at)}</span>
                </div>
                <p className="mt-2 text-sm text-white/85">{p.content}</p>
                {p.career_tag ? (
                  <span className="mt-2 inline-block rounded-full border border-[#FFD60A]/30 bg-[#FFD60A]/10 px-2 py-0.5 text-[10px] text-[#FFD60A]">
                    #{p.career_tag}
                  </span>
                ) : null}
                <div className="mt-3 flex gap-3">
                  <button
                    type="button"
                    className="flex items-center gap-1 text-xs text-white/70 hover:text-red-300"
                    onClick={() => void like(p)}
                  >
                    <Heart className="h-4 w-4" /> {p.likes}
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-1 text-xs text-white/70"
                    onClick={() => {
                      setToastMsg(t("community.replySoon"));
                      window.setTimeout(() => setToastMsg(null), 2500);
                    }}
                  >
                    <MessageCircle className="h-4 w-4" /> {t("community.reply")}
                  </button>
                </div>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
