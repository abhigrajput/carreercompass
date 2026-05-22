"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Search, Gamepad2, MessageCircle, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/dashboard", key: "home", icon: Home },
  { href: "/explore", key: "explore", icon: Search },
  { href: "/games", key: "games", icon: Gamepad2 },
  { href: "/chat", key: "chat", icon: MessageCircle },
  { href: "/profile", key: "profile", icon: User },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard" || pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useTranslation("common");

  const labels: Record<string, string> = {
    home: t("nav.dashboard"),
    explore: t("nav.explore"),
    games: t("nav.games"),
    chat: t("nav.chat"),
    profile: t("nav.profile"),
  };

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[rgba(255,107,53,0.2)] bg-[rgba(8,8,20,0.95)] backdrop-blur-md md:hidden print:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      aria-label="Mobile navigation"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 py-2">
        {tabs.map((tab) => {
          const active = isActive(pathname, tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="relative flex min-w-[56px] flex-1 flex-col items-center gap-0.5 py-1 text-[10px]"
              aria-current={active ? "page" : undefined}
            >
              <motion.span whileTap={{ scale: 0.9 }} className="flex flex-col items-center">
                <Icon
                  className={cn(
                    "h-5 w-5",
                    active ? "text-[#FF6B35]" : "text-white/55",
                  )}
                  aria-hidden
                />
                <span
                  className={cn(
                    "mt-0.5 font-medium",
                    active ? "text-[#FF6B35]" : "text-white/55",
                  )}
                >
                  {labels[tab.key]}
                </span>
                {active ? (
                  <span className="mt-1 h-1 w-1 rounded-full bg-[#FF6B35]" />
                ) : (
                  <span className="mt-1 h-1 w-1" />
                )}
              </motion.span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
