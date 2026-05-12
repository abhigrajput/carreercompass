"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Crown, MapPin, Medal, Star, Trophy, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadStudentProfile } from "@/lib/student-storage";
import type { CitySlug } from "@/types";

interface LeaderboardEntry {
  rank: number;
  name: string;
  city: string;
  points: number;
  badge: string;
}

type CityTab = "bengaluru" | "mysuru" | "hubballi" | "all";
type TimeRange = "week" | "alltime";

const CITY_LABELS: Record<CityTab, string> = {
  bengaluru: "Bengaluru",
  mysuru: "Mysuru",
  hubballi: "Hubballi",
  all: "All Karnataka",
};

const BADGES = ["🔬", "🎯", "📚", "🧪", "💡", "🏆", "⚡", "🌟", "🎓", "🧠"];

function generateMockData(city: string, seed: number): LeaderboardEntry[] {
  const names: Record<string, string[]> = {
    Bengaluru: [
      "Aditya Sharma",
      "Priya Krishnamurthy",
      "Rahul Gowda",
      "Sneha Reddy",
      "Karthik Rao",
      "Divya Hegde",
      "Nikhil Shetty",
      "Ananya Bhat",
      "Varun Kumar",
      "Meghana Patil",
    ],
    Mysuru: [
      "Suhas Murthy",
      "Kavya Iyengar",
      "Darshan Naik",
      "Rashmi Gowda",
      "Tejas Urs",
      "Akshata Hegde",
      "Vinay Prasad",
      "Sahana Raj",
      "Chethan Kumar",
      "Deepika Achar",
    ],
    Hubballi: [
      "Manjunath Patil",
      "Savita Kulkarni",
      "Basavaraj Hiremath",
      "Pooja Desai",
      "Mallikarjun Angadi",
      "Shruti Nadiger",
      "Raghu Hosur",
      "Aishwarya Gokak",
      "Santosh Biradar",
      "Rekha Mugali",
    ],
  };

  const cityNames = names[city] ?? names.Bengaluru;
  const basePts = seed === 0 ? 1000 : 800;

  return cityNames.map((name, i) => ({
    rank: i + 1,
    name,
    city,
    points: basePts - i * (seed === 0 ? 45 : 35) + (i % 3) * 10,
    badge: BADGES[i],
  }));
}

const MOCK_DATA: Record<string, Record<TimeRange, LeaderboardEntry[]>> = {
  bengaluru: {
    week: generateMockData("Bengaluru", 0),
    alltime: generateMockData("Bengaluru", 1).map((e) => ({
      ...e,
      points: e.points + 2400,
    })),
  },
  mysuru: {
    week: generateMockData("Mysuru", 0),
    alltime: generateMockData("Mysuru", 1).map((e) => ({
      ...e,
      points: e.points + 1900,
    })),
  },
  hubballi: {
    week: generateMockData("Hubballi", 0),
    alltime: generateMockData("Hubballi", 1).map((e) => ({
      ...e,
      points: e.points + 1700,
    })),
  },
};

function getAllKarnataka(range: TimeRange): LeaderboardEntry[] {
  const all = [
    ...MOCK_DATA.bengaluru[range],
    ...MOCK_DATA.mysuru[range],
    ...MOCK_DATA.hubballi[range],
  ];
  all.sort((a, b) => b.points - a.points);
  return all.slice(0, 10).map((e, i) => ({ ...e, rank: i + 1 }));
}

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-2xl">🥇</span>;
  if (rank === 2) return <span className="text-2xl">🥈</span>;
  if (rank === 3) return <span className="text-2xl">🥉</span>;
  return (
    <span className="flex size-8 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-white/70">
      #{rank}
    </span>
  );
}

function AnimatedPoints({ target }: { target: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let frame: number;
    const duration = 800;
    const start = performance.now();

    function animate(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(animate);
    }

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return <>{count.toLocaleString()}</>;
}

export default function LeaderboardPage() {
  const profile = loadStudentProfile();
  const [city, setCity] = useState<CityTab>(
    (profile?.city as CitySlug) ?? "bengaluru",
  );
  const [range, setRange] = useState<TimeRange>("week");

  const entries = useMemo(() => {
    if (city === "all") return getAllKarnataka(range);
    return MOCK_DATA[city]?.[range] ?? [];
  }, [city, range]);

  const profileInTop10 = useMemo(() => {
    if (!profile?.name) return false;
    return entries.some(
      (e) => e.name.toLowerCase() === profile.name.toLowerCase(),
    );
  }, [entries, profile?.name]);

  return (
    <div className="min-h-screen bg-[#080814]">
      <div className="mx-auto max-w-4xl px-4 pb-16 pt-24">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <Trophy className="mx-auto mb-3 size-12 text-[#FFD60A]" />
          <h1 className="font-display text-4xl font-bold text-white">
            Leaderboard
          </h1>
          <p className="mt-2 text-white/65">
            Top performers across Karnataka
          </p>
        </motion.div>

        <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
          {(Object.keys(CITY_LABELS) as CityTab[]).map((key) => (
            <button
              key={key}
              onClick={() => setCity(key)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                city === key
                  ? "bg-[#FF6B35] text-white"
                  : "bg-[#12121F] text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              {key === "all" ? (
                <Star className="size-3.5" />
              ) : (
                <MapPin className="size-3.5" />
              )}
              {CITY_LABELS[key]}
            </button>
          ))}
        </div>

        <div className="mb-8 flex justify-center gap-2">
          <Button
            onClick={() => setRange("week")}
            className={
              range === "week"
                ? "bg-[#FFD60A] text-black hover:bg-[#FFD60A]/80"
                : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
            }
          >
            This Week
          </Button>
          <Button
            onClick={() => setRange("alltime")}
            className={
              range === "alltime"
                ? "bg-[#FFD60A] text-black hover:bg-[#FFD60A]/80"
                : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
            }
          >
            All Time
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="overflow-hidden rounded-2xl border border-white/10 bg-[#12121F]"
        >
          <div className="grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-x-3 border-b border-white/10 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white/40 sm:px-6">
            <span>Rank</span>
            <span>Student</span>
            <span className="hidden sm:block">City</span>
            <span className="text-right">Points</span>
            <span className="text-center">Badge</span>
          </div>

          {entries.map((entry, i) => {
            const isCurrentUser =
              profile?.name &&
              entry.name.toLowerCase() === profile.name.toLowerCase();
            const isTop3 = entry.rank <= 3;

            return (
              <motion.div
                key={`${entry.name}-${entry.city}-${range}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-x-3 px-4 py-3 transition-colors sm:px-6 ${
                  isCurrentUser
                    ? "border-l-2 border-l-[#FFD60A] bg-[#FFD60A]/10"
                    : isTop3
                      ? "bg-white/[0.02]"
                      : "hover:bg-white/[0.03]"
                } ${i < entries.length - 1 ? "border-b border-white/5" : ""}`}
              >
                <div className="flex w-10 justify-center">
                  <RankIcon rank={entry.rank} />
                </div>

                <div className="min-w-0">
                  <p
                    className={`truncate font-medium ${
                      isCurrentUser
                        ? "text-[#FFD60A]"
                        : isTop3
                          ? "text-white"
                          : "text-white/80"
                    }`}
                  >
                    {entry.name}
                    {isCurrentUser && (
                      <span className="ml-2 text-xs text-[#FFD60A]/60">
                        (You)
                      </span>
                    )}
                  </p>
                </div>

                <span className="hidden text-sm text-white/50 sm:block">
                  {entry.city}
                </span>

                <div className="text-right">
                  <span
                    className={`text-sm font-bold tabular-nums ${
                      isTop3 ? "text-[#06d6a0]" : "text-white/70"
                    }`}
                  >
                    <AnimatedPoints target={entry.points} />
                  </span>
                </div>

                <span className="text-center text-lg">{entry.badge}</span>
              </motion.div>
            );
          })}
        </motion.div>

        {!profileInTop10 && profile?.name && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 rounded-2xl border border-white/10 bg-[#12121F] p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-[#FF6B35]/20">
                  <TrendingUp className="size-5 text-[#FF6B35]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    You are ranked{" "}
                    <span className="text-[#FFD60A]">#47</span> in{" "}
                    {city === "all"
                      ? "All Karnataka"
                      : CITY_LABELS[city]}
                  </p>
                  <p className="text-xs text-white/50">
                    Keep learning to climb the leaderboard!
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Medal className="size-4 text-[#FFD60A]" />
                <Crown className="size-4 text-[#FF6B35]" />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
