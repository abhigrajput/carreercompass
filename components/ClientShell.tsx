"use client";

import dynamic from "next/dynamic";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { GlobalErrorReporter } from "@/components/GlobalErrorReporter";

const BottomNav = dynamic(
  () => import("@/components/BottomNav").then((m) => m.BottomNav),
  { ssr: false },
);

export function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ServiceWorkerRegister />
      <GlobalErrorReporter />
      {children}
      <BottomNav />
    </>
  );
}
