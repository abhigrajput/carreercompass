"use client";

import { useEffect, useState } from "react";
import { getStudentId, patchStudentProfile } from "@/lib/student-storage";

export function ProGate({
  feature,
  children,
  fallback,
}: {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const studentId = getStudentId();
    if (!studentId) {
      setLoading(false);
      return;
    }

    void fetch("/api/pro-check", {
      headers: { "x-student-id": studentId },
    })
      .then((res) => res.json())
      .then((data: { isPro?: boolean }) => {
        const next = Boolean(data.isPro);
        setIsPro(next);
        patchStudentProfile({ isPro: next });
      })
      .catch(() => {
        setIsPro(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#12121F] p-5 text-sm text-white/60">
        Checking {feature} access...
      </div>
    );
  }

  if (!isPro) {
    return (
      fallback ?? (
        <div className="rounded-2xl border border-[#FFD60A]/30 bg-[#FFD60A]/10 p-5 text-sm text-white/85">
          Upgrade to Pro to unlock {feature}.
        </div>
      )
    );
  }

  return <>{children}</>;
}
