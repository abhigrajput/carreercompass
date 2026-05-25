"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, buttonVariants } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { loadStudentProfile } from "@/lib/student-storage";
import type { StudentProfile } from "@/types";
import type { User } from "@supabase/supabase-js";

const mainLinks = [
  { href: "/explore", key: "explore" as const },
  { href: "/games", key: "games" as const },
  { href: "/community", key: "community" as const },
  { href: "/mentors", key: "mentors" as const },
];

const toolsLinks = [
  { href: "/timetable", key: "timetable" as const },
  { href: "/study-timer", key: "studyTimer" as const },
  { href: "/compare", key: "compare" as const },
  { href: "/mock-interview", key: "mockInterview" as const },
  { href: "/news", key: "news" as const },
  { href: "/scholarships", key: "scholarships" as const },
  { href: "/exams", key: "exams" as const },
  { href: "/colleges", key: "colleges" as const },
];

function navActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const { t } = useTranslation("common");
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const toolsRef = useRef<HTMLDivElement>(null);

  const [profile, setProfile] = useState<StudentProfile | null>(null);

  useEffect(() => {
    setProfile(loadStudentProfile());
  }, [pathname]);

  const points = profile?.points ?? 0;

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!toolsRef.current?.contains(e.target as Node)) {
        setToolsOpen(false);
      }
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push("/");
  };

  const displayName =
    user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? null;
  const initial = displayName?.charAt(0)?.toUpperCase() ?? "U";

  return (
    <header
      className="print:hidden fixed inset-x-0 top-0 z-50 border-b border-[rgba(255,107,53,0.1)] backdrop-blur-[20px]"
      style={{ background: "rgba(8, 8, 20, 0.8)" }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <motion.span
            className="font-display text-lg font-semibold tracking-tight"
            whileHover={{ scale: 1.02 }}
          >
            <span className="text-white">Career</span>
            <span className="bg-gradient-to-r from-[#FF6B35] to-[#FFD60A] bg-clip-text text-transparent">
              Compass
            </span>
          </motion.span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {mainLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "relative rounded-lg px-3 py-2 text-sm transition hover:text-white",
                navActive(pathname, l.href) ? "text-white" : "text-white/70",
              )}
            >
              {t(`nav.${l.key}`)}
              {navActive(pathname, l.href) ? (
                <motion.span
                  layoutId="navline"
                  className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-gradient-to-r from-[#FF6B35] to-[#FFD60A]"
                />
              ) : null}
            </Link>
          ))}

          <div className="relative" ref={toolsRef}>
            <button
              type="button"
              onClick={() => setToolsOpen((v) => !v)}
              className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-white/70 hover:text-white"
            >
              {t("nav.tools")}
              <ChevronDown className="h-4 w-4" />
            </button>
            <AnimatePresence>
              {toolsOpen ? (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="absolute right-0 mt-1 min-w-[200px] rounded-xl border border-white/10 bg-[#12121F] py-1 shadow-xl"
                >
                  {toolsLinks.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setToolsOpen(false)}
                      className="block px-4 py-2 text-sm text-white/85 hover:bg-white/10"
                    >
                      {t(`nav.${l.key}`)}
                    </Link>
                  ))}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />

          {profile?.id ? (
            <span className="hidden rounded-full border border-[#FFD60A]/30 bg-[#FFD60A]/10 px-2 py-0.5 text-xs text-[#FFD60A] sm:inline">
              ⭐ {points}
            </span>
          ) : null}

          <Button
            variant="ghost"
            size="icon"
            className="relative text-white/60 hover:text-white"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#FF6B35]" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {user ? (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-lg px-2 py-1 text-sm text-white/80 hover:bg-white/5"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FF6B35] text-xs font-bold text-[#080814]">
                  {initial}
                </span>
                <span className="max-w-[100px] truncate">{displayName}</span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="text-white/60 hover:text-white"
                onClick={() => void handleLogout()}
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                href="/auth"
                className="rounded-lg px-3 py-2 text-sm text-white/70 hover:text-white"
              >
                {t("nav.login")}
              </Link>
              <Link
                href="/onboarding"
                className={cn(
                  buttonVariants({ variant: "default", size: "default" }),
                  "rounded-lg bg-[#FF6B35] text-[#080814] shadow-glow hover:bg-[#ff844f]",
                )}
              >
                {t("nav.startFree")}
              </Link>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-white/10 bg-[#080814] px-4 py-4 lg:hidden"
          >
            <div className="flex max-h-[80vh] flex-col gap-1 overflow-y-auto">
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm text-white/80"
              >
                {t("nav.dashboard")}
              </Link>
              {mainLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm text-white/80"
                >
                  {t(`nav.${l.key}`)}
                </Link>
              ))}
              <p className="px-3 pt-2 text-[10px] uppercase tracking-widest text-white/40">
                {t("nav.tools")}
              </p>
              {toolsLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm text-white/80"
                >
                  {t(`nav.${l.key}`)}
                </Link>
              ))}
              <Link
                href="/skill-games"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm text-white/80"
              >
                {t("nav.skillGames")}
              </Link>
              {user ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2 text-sm text-white/80"
                  >
                    {t("nav.profile")}
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      void handleLogout();
                    }}
                    className="rounded-lg px-3 py-2 text-left text-sm text-red-300"
                  >
                    {t("nav.logout")}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2 text-sm text-white/80"
                  >
                    {t("nav.login")}
                  </Link>
                  <Link
                    href="/onboarding"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-[#FFD60A]"
                  >
                    {t("nav.startFree")}
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
