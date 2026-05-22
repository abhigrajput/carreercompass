"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SchoolLandingPage() {
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ schoolName: "", contactName: "", email: "", phone: "", city: "Bengaluru", students: "200" });

  const submit = async () => {
    await fetch("/api/school/pilot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, plan: "pilot_request" }),
    });
    setDone(true);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-24">
      <h1 className="font-display text-3xl text-white sm:text-4xl">
        Bring AI Career Guidance to Your School
      </h1>
      <p className="mt-2 text-white/65">Free 30-day pilot available for Karnataka schools</p>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {[
          { name: "Starter", price: "₹15,000/yr", feat: "200 students, teacher dashboard" },
          { name: "Pro", price: "₹40,000/yr", feat: "Unlimited students, counsellor training" },
          { name: "District", price: "₹2,00,000/yr", feat: "50 schools, custom branding" },
        ].map((p) => (
          <div key={p.name} className="rounded-2xl border border-white/10 bg-[#12121F] p-6">
            <h3 className="font-display text-xl text-white">{p.name}</h3>
            <p className="mt-2 text-[#FFD60A]">{p.price}</p>
            <p className="mt-2 text-sm text-white/60">{p.feat}</p>
          </div>
        ))}
      </div>
      {done ? (
        <p className="mt-8 text-emerald-300">Pilot request received! We will contact you within 24 hours.</p>
      ) : (
        <div className="mt-10 space-y-3 rounded-2xl border border-white/10 bg-[#12121F] p-6">
          <h2 className="font-display text-lg text-white">Request free pilot</h2>
          <Input placeholder="School name" value={form.schoolName} onChange={(e) => setForm({ ...form, schoolName: e.target.value })} className="border-white/10 bg-black/30 text-white" />
          <Input placeholder="Principal / contact name" value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} className="border-white/10 bg-black/30 text-white" />
          <Input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="border-white/10 bg-black/30 text-white" />
          <Button type="button" className="bg-[#FF6B35] text-[#080814]" onClick={() => void submit()}>Submit</Button>
        </div>
      )}
      <a href="/school/dashboard" className="mt-6 inline-block text-sm text-[#FFD60A]">Already have an account? School dashboard</a>
    </div>
  );
}
