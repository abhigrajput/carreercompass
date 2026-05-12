"use client";

import { motion } from "framer-motion";
import type { Mission } from "@/lib/missions";

interface DailyMissionsProps {
  missions: Mission[];
  onComplete: (missionId: string) => void;
}

export default function DailyMissions({ missions, onComplete }: DailyMissionsProps) {
  const completedCount = missions.filter((m) => m.completed).length;
  const allDone = completedCount === missions.length;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#12121F] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Daily Missions</h3>
        <span className="text-sm text-white/50">
          {completedCount}/{missions.length}
        </span>
      </div>

      <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
          initial={{ width: 0 }}
          animate={{ width: `${(completedCount / missions.length) * 100}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      <ul className="space-y-3">
        {missions.map((mission) => (
          <li key={mission.id} className="flex items-center gap-3">
            <button
              onClick={() => !mission.completed && onComplete(mission.id)}
              disabled={mission.completed}
              className="relative flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-white/20 transition-colors hover:border-purple-400 disabled:cursor-default"
            >
              {mission.completed && (
                <motion.svg
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="h-3.5 w-3.5 text-green-400"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path d="M3 8.5l3.5 3.5 6.5-7" />
                </motion.svg>
              )}
            </button>

            <span
              className={`flex-1 text-sm transition-all ${
                mission.completed
                  ? "text-white/40 line-through"
                  : "text-white/90"
              }`}
            >
              {mission.label}
            </span>

            <span className="text-xs font-medium text-yellow-400/80">
              +{mission.points}
            </span>
          </li>
        ))}
      </ul>

      {allDone && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-sm text-green-400/80 pt-1"
        >
          Come back tomorrow for new missions!
        </motion.p>
      )}
    </div>
  );
}
