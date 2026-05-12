"use client";

import { motion } from "framer-motion";
import type { RoadmapPayload } from "@/types";

export function RoadmapTimeline({ data }: { data: RoadmapPayload }) {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-[#FF6B35]/25 bg-gradient-to-br from-[#12121F] to-black/40 p-6 shadow-glow"
      >
        <p className="font-display text-2xl text-white">{data.headline}</p>
        <p className="mt-2 text-sm text-white/70">{data.closingNote}</p>
      </motion.div>

      <div className="relative space-y-6 before:absolute before:left-[18px] before:top-2 before:h-[calc(100%-16px)] before:w-px before:bg-gradient-to-b before:from-[#FF6B35] before:to-[#FFD60A] md:before:left-[22px]">
        {data.phases.map((phase, idx) => (
          <motion.div
            key={phase.title}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.08 }}
            className="relative grid gap-4 pl-12 md:grid-cols-[160px_1fr]"
          >
            <div className="absolute left-0 top-1 flex h-10 w-10 items-center justify-center rounded-full border border-[#FFD60A]/40 bg-[#080814] text-sm font-semibold text-[#FFD60A] shadow-glowYellow">
              {idx + 1}
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#FF6B35]/80">
                {phase.weeks}
              </p>
              <h3 className="font-display text-xl text-white">{phase.title}</h3>
            </div>
            <div className="md:col-span-2 md:col-start-2">
              <ul className="space-y-2 text-sm text-white/80">
                {phase.bullets.map((b) => (
                  <li key={b} className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#06D6A0]" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
