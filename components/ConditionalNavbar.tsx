"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";

const HIDDEN_ROUTES = ["/onboarding", "/auth"];

export function ConditionalNavbar() {
  const pathname = usePathname();
  if (HIDDEN_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`))) {
    return null;
  }
  return <Navbar />;
}
