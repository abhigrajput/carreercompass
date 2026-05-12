"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Bell, LogOut, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, buttonVariants } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const links = [
  { href: "/explore", key: "explore" as const },
  { href: "/games", key: "games" as const },
  { href: "/colleges", key: "colleges" as const },
  { href: "/scholarships", key: "scholarships" as const },
  { href: "/exams", key: "exams" as const },
  { href: "/leaderboard", key: "leaderboard" as const },
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
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push("/");
  };

  const displayName = user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? null;
  const initial = displayName?.charAt(0)?.toUpperCase() ?? "U";

  return (
    <header className="print:hidden fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#080814]/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <motion.span
            className="font-display text-lg font-semibold tracking-tight text-white"
            whileHover={{ scale: 1.02 }}
          >
            <span className="text-[#FF6B35]">Career</span>
            <span className="text-[#FFD60A]">Compass</span>
          </motion.span>
          <span className="hidden rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-widest text-white/60 sm:inline">
            Karnataka
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm transition hover:bg-white/5 hover:text-white",
                navActive(pathname, l.href)
                  ? "bg-white/10 text-white"
                  : "text-white/70",
              )}
            >
              {t(`nav.${l.key}`)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />

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
            <Menu className="h-5 w-5" />
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
                {t("nav.onboarding")}
              </Link>
            </div>
          )}
        </div>
      </div>

      {open ? (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-white/10 bg-[#080814] px-4 py-3 lg:hidden"
        >
          <div className="flex flex-col gap-1">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className={cn(
                "rounded-lg px-3 py-2 text-sm",
                navActive(pathname, "/dashboard")
                  ? "bg-white/10 font-medium text-white"
                  : "text-white/80",
              )}
            >
              {t("nav.dashboard")}
            </Link>
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm",
                  navActive(pathname, l.href)
                    ? "bg-white/10 font-medium text-white"
                    : "text-white/80",
                )}
              >
                {t(`nav.${l.key}`)}
              </Link>
            ))}
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
                  onClick={() => { setOpen(false); void handleLogout(); }}
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
                  {t("nav.onboarding")}
                </Link>
              </>
            )}
          </div>
        </motion.div>
      ) : null}
    </header>
  );
}
