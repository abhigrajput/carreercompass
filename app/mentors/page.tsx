"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { loadStudentProfile } from "@/lib/student-storage";

type Mentor = {
  id: string;
  name: string;
  career: string;
  company?: string | null;
  city: string;
  experience_years?: number | null;
  languages?: string[] | null;
  bio?: string | null;
  price_per_session?: number | null;
};

export default function MentorsPage() {
  const { t } = useTranslation("common");
  const profile = loadStudentProfile();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [domain, setDomain] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Mentor | null>(null);
  const [form, setForm] = useState({
    name: profile?.name ?? "",
    email: profile?.email ?? "",
    date: "",
    message: "",
  });
  const [done, setDone] = useState(false);

  useEffect(() => {
    void fetch("/api/mentors")
      .then((r) => r.json())
      .then((j: { mentors?: Mentor[] }) => setMentors(j.mentors ?? []));
  }, []);

  const filtered = useMemo(() => {
    if (domain === "all") return mentors;
    return mentors.filter((m) =>
      m.career.toLowerCase().includes(domain.toLowerCase()),
    );
  }, [mentors, domain]);

  const submit = async () => {
    if (!selected) return;
    await fetch("/api/mentor-booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mentorId: selected.id,
        studentId: profile?.id,
        studentName: form.name,
        studentEmail: form.email,
        preferredDate: form.date || null,
        message: form.message,
      }),
    });
    setDone(true);
    setOpen(false);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-24">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-white">{t("mentors.title")}</h1>
          <p className="mt-2 text-white/65">{t("mentors.subtitle")}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="rounded-xl border-[#FFD60A]/40 text-[#FFD60A]"
          onClick={() => window.open("/contact", "_blank")}
        >
          {t("mentors.becomeMentor")}
        </Button>
      </div>

      <select
        className="mt-6 w-full max-w-xs rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white sm:w-auto"
        value={domain}
        onChange={(e) => setDomain(e.target.value)}
      >
        <option value="all">{t("mentors.filterAll")}</option>
        <option value="engineer">Engineering / Tech</option>
        <option value="Doctor">Medicine</option>
        <option value="Design">Design</option>
        <option value="CA">Commerce / CA</option>
        <option value="IAS">Civil services</option>
      </select>

      {done ? (
        <p className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          {t("mentors.bookingSuccess")}
        </p>
      ) : null}

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {filtered.map((m) => (
          <motion.div
            key={m.id}
            layout
            className="flex flex-col rounded-2xl border border-white/10 bg-[#12121F] p-5"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#FF6B35]/25 text-lg font-bold text-white">
                {m.name
                  .split(" ")
                  .map((x) => x[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div className="min-w-0">
                <p className="font-display text-lg text-white">{m.name}</p>
                <p className="text-sm text-[#FFD60A]">{m.career}</p>
                <p className="text-xs text-white/50">{m.company}</p>
                <p className="text-xs text-white/50">{m.city}</p>
              </div>
            </div>
            <p className="mt-3 line-clamp-3 text-sm text-white/70">{m.bio}</p>
            <p className="mt-2 text-xs text-white/50">
              {(m.languages ?? []).join(" · ")}
            </p>
            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-sm text-emerald-200">
                ₹{m.price_per_session ?? 199} / session
              </p>
              <Button
                type="button"
                className="rounded-xl bg-[#FF6B35] text-[#080814]"
                onClick={() => {
                  setSelected(m);
                  setOpen(true);
                  setDone(false);
                }}
              >
                {t("mentors.book")}
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-white/10 bg-[#12121F] text-white">
          <DialogHeader>
            <DialogTitle>{t("mentors.bookTitle")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder={t("onboarding.name")}
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="border-white/10 bg-black/30 text-white"
            />
            <Input
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="border-white/10 bg-black/30 text-white"
            />
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className="border-white/10 bg-black/30 text-white"
            />
            <Textarea
              placeholder={t("mentors.message")}
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              className="border-white/10 bg-black/30 text-white"
            />
            <Button
              type="button"
              className="w-full bg-[#FF6B35] text-[#080814]"
              onClick={() => void submit()}
            >
              {t("mentors.submit")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
