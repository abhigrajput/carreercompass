"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const Navbar = dynamic(
  () => import("@/components/Navbar").then((m) => m.Navbar),
  { ssr: false },
);

const HIDDEN_ROUTES = ["/onboarding", "/auth"];

export function ConditionalNavbar() {
  const pathname = usePathname();
  if (HIDDEN_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`))) {
    return null;
  }
  return <Navbar />;
}
