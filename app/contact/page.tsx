"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildSignedHeaders } from "@/lib/client-api";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Role = "Student" | "Parent" | "Teacher" | "School Admin";
const ROLES: Role[] = ["Student", "Parent", "Teacher", "School Admin"];

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [role, setRole] = useState<Role>("Student");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const payload = { name, email, message, role, website };
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: await buildSignedHeaders(payload),
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setSuccess(true);
      setName("");
      setEmail("");
      setMessage("");
      setRole("Student");
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 pb-16 pt-28">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8 text-center">
          <Mail className="mx-auto mb-3 h-10 w-10 text-[#FFD60A]" />
          <h1 className="font-display text-3xl text-white sm:text-4xl">
            Contact Us
          </h1>
          <p className="mt-2 text-white/60">
            Questions, feedback, or partnership inquiries — we&apos;d love to
            hear from you.
          </p>
        </div>

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-xl border border-[#06d6a0]/30 bg-[#06d6a0]/10 px-4 py-3 text-sm text-[#06d6a0]"
          >
            Thank you! Your message has been sent. We&apos;ll get back to you
            soon.
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
          >
            {error}
          </motion.div>
        )}

        <Card className="rounded-2xl border border-white/10 bg-[#12121F]">
          <CardHeader>
            <CardTitle className="font-display text-xl text-white">
              Send a Message
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
              <Input
                name="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
              />
              <div>
                <label className="mb-1 block text-xs text-white/50">
                  Name
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="border-white/15 bg-black/30 text-white placeholder:text-white/30"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-white/50">
                  Email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="border-white/15 bg-black/30 text-white placeholder:text-white/30"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-white/50">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-white/50">
                  Message
                </label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  placeholder="How can we help?"
                  className="border-white/15 bg-black/30 text-white placeholder:text-white/30"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#FF6B35] py-3 text-[#080814] hover:bg-[#ff844f]"
              >
                <Send className="mr-2 h-4 w-4" />
                {loading ? "Sending…" : "Send Message"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
