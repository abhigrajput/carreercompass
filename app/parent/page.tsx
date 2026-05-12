"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { MessageCircle } from "lucide-react";
import i18n from "@/lib/i18n";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type InterestRow = {
  career_id?: string;
  career_name?: string;
  interest_score?: number | null;
};

type GameRow = {
  career_domain?: string;
  score?: number | null;
  total_questions?: number | null;
  correct_answers?: number | null;
  played_at?: string | null;
};

type RoadmapRow = {
  career_id?: string;
  career_name?: string | null;
  roadmap_data?: unknown;
  created_at?: string | null;
};

type ParentPayload = {
  demo?: boolean;
  error?: string;
  student?: {
    name?: string;
    class?: string;
    city?: string;
    known_goal?: string | null;
    language?: string | null;
  } | null;
  interests?: InterestRow[];
  games?: GameRow[];
  roadmaps?: RoadmapRow[];
};

function roadmapPreview(data: unknown): string {
  if (data == null) {
    return "";
  }
  if (typeof data === "string") {
    return data.slice(0, 400);
  }
  try {
    const s = JSON.stringify(data, null, 2);
    return s.length > 600 ? `${s.slice(0, 600)}…` : s;
  } catch {
    return "";
  }
}

function ParentInner() {
  const { t } = useTranslation("common");
  const params = useSearchParams();
  const token = params.get("token") ?? "";

  const [loading, setLoading] = useState(!!token);
  const [invalid, setInvalid] = useState(false);
  const [payload, setPayload] = useState<ParentPayload | null>(null);
  const [pageUrl, setPageUrl] = useState("");

  useEffect(() => {
    setPageUrl(typeof window !== "undefined" ? window.location.href : "");
  }, []);

  useEffect(() => {
    void i18n.changeLanguage("kn");
  }, []);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setInvalid(false);
      setPayload(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setInvalid(false);
    (async () => {
      try {
        const res = await fetch(
          `/api/parent?token=${encodeURIComponent(token)}`,
        );
        const json = (await res.json()) as ParentPayload & {
          error?: string;
        };
        if (cancelled) {
          return;
        }
        if (res.status === 404 || json.error === "invalid_or_expired") {
          setInvalid(true);
          setPayload(null);
          return;
        }
        if (!res.ok) {
          setInvalid(true);
          setPayload(null);
          return;
        }
        setPayload(json);
      } catch {
        if (!cancelled) {
          setInvalid(true);
          setPayload(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const studentName = payload?.student?.name ?? t("parent.student");

  const shareUrl = pageUrl;

  const whatsappFamilyHref = useMemo(() => {
    if (!shareUrl) {
      return "";
    }
    const text = `${studentName} ಅವರ CareerCompass ಪ್ರಗತಿ ನೋಡಿ: ${shareUrl}`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  }, [shareUrl, studentName]);

  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 pt-24 font-kannada">
      <div className="mb-8 space-y-2 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-[#FF6B35]">
          CareerCompass
        </p>
        <h1 className="font-display text-4xl text-white">{t("parent.title")}</h1>
        <p className="text-white/70">{t("parent.intro")}</p>
      </div>

      {!token ? (
        <Card className="rounded-2xl border-white/10 bg-[#12121F]">
          <CardContent className="py-8 text-center text-sm text-white/70">
            {t("parent.tokenMissing")}
          </CardContent>
        </Card>
      ) : null}

      {token && loading ? (
        <p className="text-center text-white/70">{t("common.loading")}</p>
      ) : null}

      {token && !loading && invalid ? (
        <Card className="rounded-2xl border-red-500/30 bg-[#12121F]">
          <CardContent className="py-8 text-center text-sm text-red-200">
            {t("parent.invalidToken")}
          </CardContent>
        </Card>
      ) : null}

      {payload?.demo ? (
        <Card className="mb-8 rounded-2xl border-[#FFD60A]/30 bg-[#12121F]">
          <CardHeader>
            <CardTitle className="text-white">{t("parent.noServerData")}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-white/75">
            <p>{t("parent.demo")}</p>
          </CardContent>
        </Card>
      ) : null}

      {payload && !payload.demo && !invalid ? (
        <>
          <div className="mb-6 flex flex-wrap justify-center gap-3">
            {whatsappFamilyHref ? (
              <a
                href={whatsappFamilyHref}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  buttonVariants({ variant: "default", size: "default" }),
                  "rounded-xl bg-[#25D366] text-[#080814] hover:bg-[#1ebe57]",
                )}
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                {t("parent.shareFamily")}
              </a>
            ) : null}
          </div>

          <Card className="mb-6 rounded-2xl border-white/10 bg-[#12121F]">
            <CardHeader>
              <CardTitle className="text-lg text-white">
                {t("parent.student")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-white/80">
              <p>
                <span className="text-white/50">ಹೆಸರು:</span>{" "}
                {payload.student?.name ?? "—"}
              </p>
              <p>
                <span className="text-white/50">ತರಗತಿ:</span>{" "}
                {payload.student?.class ?? "—"}
              </p>
              <p>
                <span className="text-white/50">ನಗರ:</span>{" "}
                {payload.student?.city ?? "—"}
              </p>
              {payload.student?.known_goal ? (
                <p>
                  <span className="text-white/50">ಗುರಿ:</span>{" "}
                  {payload.student.known_goal}
                </p>
              ) : null}
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="rounded-2xl border-white/10 bg-[#12121F]">
              <CardHeader>
                <CardTitle className="text-lg text-white">
                  {t("parent.explored")}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-white/75">
                {payload.interests && payload.interests.length > 0 ? (
                  <ul className="list-disc space-y-2 pl-5">
                    {payload.interests.map((row) => (
                      <li key={`${row.career_id}-${row.career_name}`}>
                        {row.career_name ?? row.career_id ?? "—"}
                        {row.interest_score != null
                          ? ` · ${row.interest_score}`
                          : ""}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-white/50">{t("parent.emptyInterests")}</p>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-white/10 bg-[#12121F]">
              <CardHeader>
                <CardTitle className="text-lg text-white">
                  {t("parent.games")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-white/75">
                {payload.games && payload.games.length > 0 ? (
                  payload.games.map((g, i) => (
                    <div
                      key={`${g.played_at}-${i}`}
                      className="rounded-xl border border-white/10 bg-black/25 px-3 py-2"
                    >
                      <p className="font-medium text-white">
                        {g.career_domain ?? "—"}
                      </p>
                      <p>
                        {t("parent.scoreLabel")}: {g.correct_answers ?? 0}/
                        {g.total_questions ?? 0} ({g.score ?? 0}%)
                      </p>
                      {g.played_at ? (
                        <p className="text-xs text-white/45">
                          {t("parent.lastPlayed")}:{" "}
                          {new Date(g.played_at).toLocaleString("kn-IN")}
                        </p>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <p className="text-white/50">{t("parent.emptyGames")}</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6 rounded-2xl border-white/10 bg-[#12121F]">
            <CardHeader>
              <CardTitle className="text-lg text-white">
                {t("parent.roadmapsSection")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-white/75">
              {payload.roadmaps && payload.roadmaps.length > 0 ? (
                payload.roadmaps.map((r, i) => (
                  <div
                    key={`${r.career_id}-${i}`}
                    className="rounded-xl border border-white/10 bg-black/25 p-4"
                  >
                    <p className="font-display text-lg text-white">
                      {r.career_name ?? r.career_id ?? t("parent.roadmapSaved")}
                    </p>
                    {r.created_at ? (
                      <p className="mb-2 text-xs text-white/45">
                        {new Date(r.created_at).toLocaleString("kn-IN")}
                      </p>
                    ) : null}
                    <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-lg bg-black/40 p-3 text-xs text-white/70">
                      {roadmapPreview(r.roadmap_data)}
                    </pre>
                  </div>
                ))
              ) : (
                <p className="text-white/50">{t("parent.emptyRoadmaps")}</p>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}

export default function ParentPage() {
  const { t } = useTranslation("common");
  return (
    <Suspense
      fallback={
        <div className="px-4 pt-24 text-white/70">{t("common.loading")}</div>
      }
    >
      <ParentInner />
    </Suspense>
  );
}
