"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { buildSignedHeaders } from "@/lib/client-api";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { saveStudentProfile } from "@/lib/student-storage";
import type {
  CitySlug,
  LocaleCode,
  StudentClass,
  StudentProfile,
  StreamSlug,
} from "@/types";

export default function OnboardingPage() {
  const { t, i18n } = useTranslation("common");
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [cls, setCls] = useState<StudentClass>("10");
  const [city, setCity] = useState<CitySlug>("bengaluru");
  const [language, setLanguage] = useState<LocaleCode>("en");
  const [knowsGoal, setKnowsGoal] = useState<boolean | null>(null);
  const [goal, setGoal] = useState("");
  const [stream, setStream] = useState<StreamSlug | "">("");
  const [submitting, setSubmitting] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [website, setWebsite] = useState("");

  const baseProfile = (): StudentProfile => ({
    name: name.trim(),
    class: cls,
    city,
    language,
    stream: stream || null,
    knownGoal: goal.trim() || null,
    schoolName: schoolName.trim() || null,
  });

  const persistRemote = async (
    profile: StudentProfile,
  ): Promise<StudentProfile> => {
    try {
      const payload = {
        ...profile,
        school_name: profile.schoolName ?? null,
        referred_by: referralCode.trim() || null,
        website,
      };
      const res = await fetch("/api/student", {
        method: "POST",
        headers: await buildSignedHeaders(payload),
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as {
        student?: { id: string };
        ok?: boolean;
        token?: string;
      };
      if (json.student?.id) {
        return { ...profile, id: json.student.id, authToken: json.token ?? null };
      }
    } catch {
      /* offline */
    }
    return profile;
  };

  const finishToExplore = async () => {
    setSubmitting(true);
    const profile = { ...baseProfile(), knownGoal: null };
    const saved = await persistRemote(profile);
    saveStudentProfile(saved);
    await i18n.changeLanguage(saved.language);
    router.push("/explore");
    setSubmitting(false);
  };

  const finishToRoadmap = async () => {
    setSubmitting(true);
    const profile = baseProfile();
    const saved = await persistRemote(profile);
    saveStudentProfile(saved);
    await i18n.changeLanguage(saved.language);
    router.push("/roadmap");
    setSubmitting(false);
  };

  const progress = step / 3;

  return (
    <div className="flex min-h-screen flex-col bg-[#080814] px-4 pb-safe pt-8">
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col">
        <div className="mb-6 space-y-3">
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#FF6B35] to-[#FFD60A]"
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.35 }}
            />
          </div>
          <p className="text-center text-xs uppercase tracking-[0.35em] text-[#FF6B35]">
            {t("onboarding.stepLabel", { step, total: 3 })}
          </p>
          <h1 className="text-center font-display text-2xl text-white sm:text-3xl">
            {t("onboarding.title")}
          </h1>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="s1"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
              className="flex flex-1 flex-col space-y-4 rounded-2xl border border-white/10 bg-[#12121F] p-6 shadow-glow"
            >
              <Input
                name="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
              />
              <label className="space-y-2 text-sm text-white/80">
                <span>{t("onboarding.name")}</span>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl border-white/10 bg-black/30 text-white"
                  placeholder="Ananya"
                />
              </label>

              <label className="space-y-2 text-sm text-white/80">
                <span>{t("onboarding.class")}</span>
                <select
                  value={cls}
                  onChange={(e) => setCls(e.target.value as StudentClass)}
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
                >
                  <option value="10">10</option>
                  <option value="11">11</option>
                  <option value="12">12</option>
                </select>
              </label>

              <label className="space-y-2 text-sm text-white/80">
                <span>{t("onboarding.city")}</span>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value as CitySlug)}
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
                >
                  <option value="bengaluru">{t("onboarding.cities.bengaluru")}</option>
                  <option value="mysuru">{t("onboarding.cities.mysuru")}</option>
                  <option value="hubballi">{t("onboarding.cities.hubballi")}</option>
                </select>
              </label>

              <label className="space-y-2 text-sm text-white/80">
                <span>{t("onboarding.schoolName")}</span>
                <Input
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="rounded-xl border-white/10 bg-black/30 text-white"
                  placeholder={t("onboarding.schoolPlaceholder")}
                />
              </label>

              <label className="space-y-2 text-sm text-white/80">
                <span>{t("onboarding.language")}</span>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as LocaleCode)}
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
                >
                  <option value="en">English</option>
                  <option value="kn">ಕನ್ನಡ</option>
                  <option value="hi">हिंदी</option>
                </select>
              </label>

              <label className="space-y-2 text-sm text-white/80">
                <span>Stream (optional)</span>
                <select
                  value={stream}
                  onChange={(e) => setStream(e.target.value as StreamSlug | "")}
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
                >
                  <option value="">—</option>
                  <option value="science">Science</option>
                  <option value="commerce">Commerce</option>
                  <option value="arts">Arts</option>
                </select>
              </label>

              <label className="space-y-2 text-sm text-white/80">
                <span>{t("onboarding.referralCode")}</span>
                <Input
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  className="rounded-xl border-white/10 bg-black/30 text-white"
                  placeholder={t("onboarding.referralPlaceholder")}
                />
              </label>

              <Button
                type="button"
                className="mt-auto w-full rounded-xl bg-[#FF6B35] py-6 text-[#080814] hover:bg-[#ff844f]"
                disabled={!name.trim()}
                onClick={() => setStep(2)}
              >
                {t("onboarding.next")}
              </Button>
            </motion.div>
          ) : null}

          {step === 2 ? (
            <motion.div
              key="s2"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
              className="flex flex-1 flex-col space-y-6 rounded-2xl border border-white/10 bg-[#12121F] p-6 shadow-glow"
            >
              <p className="text-lg text-white">{t("onboarding.goalQuestion")}</p>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={knowsGoal === true ? "default" : "outline"}
                  className={
                    knowsGoal === true
                      ? "rounded-xl bg-[#FFD60A] py-8 text-[#080814] hover:bg-[#ffe566]"
                      : "rounded-xl border-white/10 bg-white/5 py-8 text-white hover:bg-white/10"
                  }
                  onClick={() => setKnowsGoal(true)}
                >
                  {t("onboarding.yes")}
                </Button>
                <Button
                  type="button"
                  variant={knowsGoal === false ? "default" : "outline"}
                  className={
                    knowsGoal === false
                      ? "rounded-xl bg-[#FFD60A] py-8 text-[#080814] hover:bg-[#ffe566]"
                      : "rounded-xl border-white/10 bg-white/5 py-8 text-white hover:bg-white/10"
                  }
                  onClick={() => setKnowsGoal(false)}
                >
                  {t("onboarding.no")}
                </Button>
              </div>

              <div className="mt-auto flex flex-col gap-3">
                <Button
                  type="button"
                  className="w-full rounded-xl bg-[#FF6B35] py-6 text-[#080814] hover:bg-[#ff844f]"
                  disabled={knowsGoal === null || submitting}
                  onClick={() => {
                    if (knowsGoal === false) {
                      void finishToExplore();
                    } else if (knowsGoal === true) {
                      setStep(3);
                    }
                  }}
                >
                  {knowsGoal === false
                    ? t("onboarding.goExplore")
                    : t("onboarding.next")}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="text-white/70"
                  onClick={() => setStep(1)}
                >
                  {t("onboarding.back")}
                </Button>
              </div>
            </motion.div>
          ) : null}

          {step === 3 ? (
            <motion.div
              key="s3"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
              className="flex flex-1 flex-col space-y-5 rounded-2xl border border-white/10 bg-[#12121F] p-6 shadow-glow"
            >
              <p className="text-white/85">{t("onboarding.goalPlaceholder")}</p>
              <Textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="min-h-[140px] rounded-xl border-white/10 bg-black/30 text-white"
                rows={5}
              />
              <Button
                type="button"
                className="mt-auto w-full rounded-xl bg-[#FFD60A] py-6 text-[#080814] hover:bg-[#ffe566]"
                disabled={!goal.trim() || submitting}
                onClick={() => void finishToRoadmap()}
              >
                {t("onboarding.saveRoadmap")}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="text-white/70"
                onClick={() => setStep(2)}
              >
                {t("onboarding.back")}
              </Button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
