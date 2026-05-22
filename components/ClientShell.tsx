"use client";

import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { BottomNav } from "@/components/BottomNav";
import { GlobalErrorReporter } from "@/components/GlobalErrorReporter";

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
