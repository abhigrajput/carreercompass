import fs from "fs";

const d = "di" + "v";

function w(path, content) {
  fs.mkdirSync(path.split("/").slice(0, -1).join("/"), { recursive: true });
  fs.writeFileSync(path, content);
}

w(
  "app/blog/page.tsx",
  `import Link from "next/link";
import { BLOG_POSTS } from "@/lib/blog-posts";

export default function BlogIndexPage() {
  return (
    <${d} className="mx-auto max-w-3xl px-4 pb-24 pt-24">
      <h1 className="font-display text-4xl text-white">CareerCompass Blog</h1>
      <p className="mt-2 text-white/65">Guides for Karnataka students</p>
      <ul className="mt-10 space-y-4">
        {BLOG_POSTS.map((post) => (
          <li key={post.slug}>
            <Link href={"/blog/" + post.slug} className="block rounded-2xl border border-white/10 bg-[#12121F] p-5 hover:border-[#FF6B35]/40">
              <h2 className="font-display text-xl text-white">{post.title}</h2>
              <p className="mt-2 text-sm text-white/60">{post.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </${d}>
  );
}
`,
);

w(
  "app/blog/[slug]/page.tsx",
  `import Link from "next/link";
import { notFound } from "next/navigation";
import { BLOG_POSTS } from "@/lib/blog-posts";
import type { Metadata } from "next";

type Props = { params: { slug: string } };

export async function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = BLOG_POSTS.find((p) => p.slug === params.slug);
  if (!post) return { title: "Blog" };
  return { title: post.title, description: post.description };
}

export default function BlogPostPage({ params }: Props) {
  const post = BLOG_POSTS.find((p) => p.slug === params.slug);
  if (!post) notFound();
  return (
    <${d} className="mx-auto max-w-3xl px-4 pb-24 pt-24 prose prose-invert">
      <h1 className="font-display text-4xl text-white">{post.title}</h1>
      <p className="text-white/50">{post.date} · {post.readMinutes} min read</p>
      {post.content.map((para) => (
        <p key={para.slice(0, 24)} className="mt-4 text-white/80">{para}</p>
      ))}
      <Link href="/games" className="mt-10 inline-block rounded-xl bg-[#FF6B35] px-6 py-3 text-[#080814]">
        Discover your career match
      </Link>
    </${d}>
  );
}
`,
);

w(
  "app/school/page.tsx",
  `"use client";

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
    <${d} className="mx-auto max-w-4xl px-4 pb-24 pt-24">
      <h1 className="font-display text-3xl text-white sm:text-4xl">
        Bring AI Career Guidance to Your School
      </h1>
      <p className="mt-2 text-white/65">Free 30-day pilot available for Karnataka schools</p>
      <${d} className="mt-10 grid gap-6 md:grid-cols-3">
        {[
          { name: "Starter", price: "₹15,000/yr", feat: "200 students, teacher dashboard" },
          { name: "Pro", price: "₹40,000/yr", feat: "Unlimited students, counsellor training" },
          { name: "District", price: "₹2,00,000/yr", feat: "50 schools, custom branding" },
        ].map((p) => (
          <${d} key={p.name} className="rounded-2xl border border-white/10 bg-[#12121F] p-6">
            <h3 className="font-display text-xl text-white">{p.name}</h3>
            <p className="mt-2 text-[#FFD60A]">{p.price}</p>
            <p className="mt-2 text-sm text-white/60">{p.feat}</p>
          </${d}>
        ))}
      </${d}>
      {done ? (
        <p className="mt-8 text-emerald-300">Pilot request received! We will contact you within 24 hours.</p>
      ) : (
        <${d} className="mt-10 space-y-3 rounded-2xl border border-white/10 bg-[#12121F] p-6">
          <h2 className="font-display text-lg text-white">Request free pilot</h2>
          <Input placeholder="School name" value={form.schoolName} onChange={(e) => setForm({ ...form, schoolName: e.target.value })} className="border-white/10 bg-black/30 text-white" />
          <Input placeholder="Principal / contact name" value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} className="border-white/10 bg-black/30 text-white" />
          <Input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="border-white/10 bg-black/30 text-white" />
          <Button type="button" className="bg-[#FF6B35] text-[#080814]" onClick={() => void submit()}>Submit</Button>
        </${d}>
      )}
      <a href="/school/dashboard" className="mt-6 inline-block text-sm text-[#FFD60A]">Already have an account? School dashboard</a>
    </${d}>
  );
}
`,
);

w(
  "app/referral/page.tsx",
  `"use client";

import { useState } from "react";
import { loadStudentProfile } from "@/lib/student-storage";
import { Button } from "@/components/ui/button";

export default function ReferralPage() {
  const profile = loadStudentProfile();
  const code = profile?.id ? profile.id.slice(0, 8).toUpperCase() : "CCDEMO";
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wa = "https://wa.me/?text=" + encodeURIComponent("Join CareerCompass with my code " + code + " — free career guide for Karnataka students!");

  return (
    <${d} className="mx-auto max-w-lg px-4 pb-24 pt-24 text-center">
      <h1 className="font-display text-3xl text-white">Refer friends</h1>
      <p className="mt-2 text-white/65">Earn 50 points per friend who joins</p>
      <p className="mt-8 font-mono text-4xl font-bold text-[#FFD60A]">{code}</p>
      <${d} className="mt-6 flex flex-wrap justify-center gap-3">
        <Button type="button" onClick={() => void copy()} className="bg-[#FF6B35] text-[#080814]">{copied ? "Copied!" : "Copy code"}</Button>
        <a href={wa} target="_blank" rel="noreferrer"><Button type="button" variant="outline" className="border-white/20 text-white">WhatsApp</Button></a>
      </${d}>
      <ul className="mt-10 space-y-2 text-left text-sm text-white/70">
        <li>3 referrals → Community Builder badge + 200 pts</li>
        <li>5 referrals → 1 month Pro free</li>
        <li>10 referrals → Karnataka Ambassador + 3 months Pro</li>
      </ul>
    </${d}>
  );
}
`,
);

console.log("pages written");
