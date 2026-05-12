"use client";

import { motion } from "framer-motion";
import { getBadge } from "@/lib/badges";

interface StreakCardProps {
  streakDays: number;
  points: number;
  badges: string[];
}

export default function StreakCard({ streakDays, points, badges }: StreakCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#12121F] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {streakDays > 3 ? (
            <motion.span
              className="text-2xl"
              animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              🔥
            </motion.span>
          ) : (
            <span className="text-2xl">🔥</span>
          )}
          <span className="text-lg font-semibold text-white">
            {streakDays} day streak
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xl">⭐</span>
          <span className="text-lg font-semibold text-yellow-400">
            {points}
          </span>
        </div>
      </div>

      {badges.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-white/60">Badges earned</p>
          <div className="grid grid-cols-3 gap-2">
            {badges.map((badgeId) => {
              const badge = getBadge(badgeId);
              if (!badge) return null;
              return (
                <motion.div
                  key={badge.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex flex-col items-center gap-1 rounded-xl bg-white/5 p-2"
                >
                  <span className="text-2xl">{badge.emoji}</span>
                  <span className="text-[11px] text-white/70 text-center leading-tight">
                    {badge.name}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
