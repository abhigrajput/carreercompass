"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

export type BadgeToast = {
  id: string;
  emoji: string;
  name: string;
  desc: string;
};

function beep() {
  try {
    const ctx = new AudioContext();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    o.frequency.value = 880;
    g.gain.value = 0.04;
    o.start();
    o.stop(ctx.currentTime + 0.12);
  } catch {
    /* */
  }
}

export function BadgeUnlockQueue() {
  const [queue, setQueue] = useState<BadgeToast[]>([]);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    const onUnlock = (e: Event) => {
      const ce = e as CustomEvent<BadgeToast>;
      if (!ce.detail) return;
      setQueue((q) => [...q, ce.detail]);
    };
    window.addEventListener("cc-badge-unlock", onUnlock);
    return () => window.removeEventListener("cc-badge-unlock", onUnlock);
  }, []);

  const active = queue[0] ?? null;

  useEffect(() => {
    if (!active) return;
    beep();
    void confetti({ particleCount: 120, spread: 70, origin: { y: 0.25 } });
    const t = window.setTimeout(() => {
      setQueue((q) => q.slice(1));
    }, 3000);
    return () => clearTimeout(t);
  }, [active]);

  return (
    <AnimatePresence>
      {active ? (
        <motion.div
          key={active.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-start justify-center bg-black/70 pt-24"
        >
          <motion.div
            initial={{ y: -120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="mx-4 max-w-sm rounded-2xl border border-[#FFD60A]/40 bg-[#12121F] p-6 text-center shadow-glow"
          >
            <p className="text-5xl">{active.emoji}</p>
            <p className="mt-3 font-display text-xl text-white">{active.name}</p>
            <p className="mt-2 text-sm text-white/70">{active.desc}</p>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function emitBadgeUnlock(b: BadgeToast) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("cc-badge-unlock", { detail: b }));
}
