"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildSignedHeaders } from "@/lib/client-api";
import { shareContent } from "@/lib/share";
import { loadStudentProfile } from "@/lib/student-storage";

type GroupItem = {
  id: string;
  name: string;
  careerFocus: string;
  city: string;
  maxMembers: number;
  creatorName: string;
  createdAt: string;
  memberCount: number;
  joined: boolean;
};

function daysAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

export default function GroupsPage() {
  const profile = loadStudentProfile();
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [careerFocus, setCareerFocus] = useState("all");
  const [city, setCity] = useState("all");
  const [form, setForm] = useState({
    name: "",
    careerFocus: "technology",
    city: "Bengaluru",
    maxMembers: 10 as 5 | 10 | 20,
  });

  const fetchGroups = async () => {
    const url = profile?.id
      ? `/api/groups?studentId=${encodeURIComponent(profile.id)}`
      : "/api/groups";
    const res = await fetch(url);
    const data = (await res.json()) as { groups?: GroupItem[] };
    setGroups(data.groups ?? []);
  };

  useEffect(() => {
    void fetchGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  const filtered = useMemo(() => {
    return groups.filter((group) => {
      if (careerFocus !== "all" && group.careerFocus !== careerFocus) return false;
      if (city !== "all" && group.city !== city) return false;
      return true;
    });
  }, [careerFocus, city, groups]);

  const joinedGroups = filtered.filter((group) => group.joined);
  const openGroups = filtered.filter((group) => !group.joined);

  async function createGroup() {
    const payload = { ...form };
    const headers = await buildSignedHeaders(payload);
    const res = await fetch("/api/groups", {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setShowCreate(false);
      setForm({
        name: "",
        careerFocus: "technology",
        city: "Bengaluru",
        maxMembers: 10,
      });
      await fetchGroups();
    }
  }

  async function joinGroup(groupId: string) {
    const payload = {};
    const headers = await buildSignedHeaders(payload);
    await fetch(`/api/groups/${groupId}`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    await fetchGroups();
  }

  async function leaveGroup(groupId: string) {
    const payload = {};
    const headers = await buildSignedHeaders(payload);
    await fetch(`/api/groups/${groupId}`, {
      method: "DELETE",
      headers,
      body: JSON.stringify(payload),
    });
    await fetchGroups();
  }

  async function shareGroup(group: GroupItem) {
    const text = `Join "${group.name}" on CareerCompass. ${group.memberCount}/${group.maxMembers} members already inside.`;
    await shareContent(
      "CareerCompass Study Group",
      text,
      `${window.location.origin}/groups`,
    );
  }

  return (
    <div className="min-h-screen bg-[#080814] px-4 pb-16 pt-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl text-white">Study Groups</h1>
            <p className="mt-2 text-white/60">
              Find students preparing for similar goals in your city.
            </p>
          </div>
          <Button
            type="button"
            onClick={() => setShowCreate(true)}
            className="rounded-xl bg-[#FF6B35] text-[#080814] hover:bg-[#ff844f]"
          >
            Create Group
          </Button>
        </div>

        <div className="mb-6 grid gap-4 rounded-2xl border border-white/10 bg-[#12121F] p-4 md:grid-cols-2">
          <select
            value={careerFocus}
            onChange={(e) => setCareerFocus(e.target.value)}
            className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white"
          >
            <option value="all">All career focuses</option>
            <option value="technology">Technology</option>
            <option value="medicine">Medicine</option>
            <option value="law">Law</option>
            <option value="creative">Creative</option>
            <option value="government">Government</option>
            <option value="commerce">Commerce</option>
          </select>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white"
          >
            <option value="all">All cities</option>
            <option value="Bengaluru">Bengaluru</option>
            <option value="Mysuru">Mysuru</option>
            <option value="Hubballi">Hubballi</option>
          </select>
        </div>

        {joinedGroups.length > 0 ? (
          <div className="mb-8">
            <h2 className="mb-4 font-display text-2xl text-white">Joined Groups</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {joinedGroups.map((group) => (
                <Card key={group.id} className="rounded-2xl border-white/10 bg-[#12121F]">
                  <CardContent className="space-y-4 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-display text-lg text-white">{group.name}</p>
                        <p className="text-sm text-white/55">{group.creatorName}</p>
                      </div>
                      <span className="rounded-full border border-[#FFD60A]/30 bg-[#FFD60A]/10 px-3 py-1 text-xs text-[#FFD60A]">
                        {group.memberCount}/{group.maxMembers} members
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full border border-white/10 px-3 py-1 text-white/75">
                        {group.careerFocus}
                      </span>
                      <span className="rounded-full border border-white/10 px-3 py-1 text-white/75">
                        {group.city}
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => void shareGroup(group)}
                        className="rounded-xl border-white/15 text-white"
                      >
                        Share group
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => void leaveGroup(group.id)}
                        className="rounded-xl border-red-500/30 text-red-200"
                      >
                        Leave
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : null}

        <div>
          <h2 className="mb-4 font-display text-2xl text-white">Open Groups</h2>
          {openGroups.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {openGroups.map((group, index) => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                >
                  <Card className="rounded-2xl border-white/10 bg-[#12121F]">
                    <CardContent className="space-y-4 p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-display text-lg text-white">{group.name}</p>
                          <p className="text-sm text-white/55">Created by {group.creatorName}</p>
                        </div>
                        <span className="rounded-full border border-[#FFD60A]/30 bg-[#FFD60A]/10 px-3 py-1 text-xs text-[#FFD60A]">
                          {group.memberCount}/{group.maxMembers} members
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full border border-white/10 px-3 py-1 text-white/75">
                          {group.careerFocus}
                        </span>
                        <span className="rounded-full border border-white/10 px-3 py-1 text-white/75">
                          {group.city}
                        </span>
                        <span className="rounded-full border border-white/10 px-3 py-1 text-white/45">
                          Created {daysAgo(group.createdAt)} days ago
                        </span>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          type="button"
                          onClick={() => void joinGroup(group.id)}
                          disabled={group.memberCount >= group.maxMembers}
                          className="rounded-xl bg-[#FF6B35] text-[#080814] hover:bg-[#ff844f]"
                        >
                          {group.memberCount >= group.maxMembers ? "Full" : "Join"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => void shareGroup(group)}
                          className="rounded-xl border-white/15 text-white"
                        >
                          Share group
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="rounded-2xl border-white/10 bg-[#12121F]">
              <CardContent className="p-8 text-center text-white/60">
                No groups yet in your city. Create the first one! 🚀
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {showCreate ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <Card className="w-full max-w-lg rounded-3xl border-white/10 bg-[#12121F]">
            <CardHeader>
              <CardTitle className="text-white">Create Group</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                value={form.name}
                onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
                placeholder="NEET Aspirants Hubballi"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-white/30"
              />
              <select
                value={form.careerFocus}
                onChange={(e) =>
                  setForm((current) => ({ ...current, careerFocus: e.target.value }))
                }
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white"
              >
                <option value="technology">Technology</option>
                <option value="medicine">Medicine</option>
                <option value="law">Law</option>
                <option value="creative">Creative</option>
                <option value="government">Government</option>
                <option value="commerce">Commerce</option>
              </select>
              <select
                value={form.city}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    city: e.target.value as "Bengaluru" | "Mysuru" | "Hubballi",
                  }))
                }
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white"
              >
                <option value="Bengaluru">Bengaluru</option>
                <option value="Mysuru">Mysuru</option>
                <option value="Hubballi">Hubballi</option>
              </select>
              <select
                value={form.maxMembers}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    maxMembers: Number(e.target.value) as 5 | 10 | 20,
                  }))
                }
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white"
              >
                <option value={5}>5 members</option>
                <option value={10}>10 members</option>
                <option value={20}>20 members</option>
              </select>
              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={() => void createGroup()}
                  className="rounded-xl bg-[#FF6B35] text-[#080814] hover:bg-[#ff844f]"
                >
                  Create
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreate(false)}
                  className="rounded-xl border-white/15 text-white"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
