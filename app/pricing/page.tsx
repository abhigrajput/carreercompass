"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Crown, School, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: { razorpay_payment_id: string }) => void;
  theme: { color: string };
}

interface RazorpayInstance {
  open: () => void;
}

interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  error?: string;
}

const PLANS = [
  {
    name: "Free",
    price: "₹0",
    period: "",
    icon: Sparkles,
    features: [
      "Career Explorer",
      "1 AI chat session",
      "1 game",
      "College Mapper",
    ],
    cta: "Current Plan",
    disabled: true,
    highlight: false,
  },
  {
    name: "Student Pro",
    price: "₹99",
    period: "/month",
    icon: Zap,
    features: [
      "Unlimited AI chat",
      "All games",
      "Roadmap generator",
      "Scholarship finder",
      "Parent dashboard",
      "Badges & streaks",
    ],
    cta: "Upgrade to Pro",
    disabled: false,
    highlight: true,
    badge: "Most Popular",
  },
  {
    name: "School Pack",
    price: "₹999",
    period: "/month",
    icon: School,
    features: [
      "Everything in Pro",
      "50 student accounts",
      "Teacher dashboard",
      "Progress reports",
    ],
    cta: "Contact Us",
    disabled: false,
    highlight: false,
  },
];

export default function PricingPage() {
  const [upgrading, setUpgrading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = async () => {
    setUpgrading(true);
    setError(null);
    try {
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "pro" }),
      });
      const data = (await res.json()) as RazorpayOrder;

      if (!res.ok || data.error) {
        if (res.status === 503) {
          setError("Coming Soon — payments are not yet configured.");
        } else {
          setError(data.error ?? "Payment failed. Please try again.");
        }
        return;
      }

      const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!keyId || typeof window.Razorpay === "undefined") {
        setError("Coming Soon — payments are not yet configured.");
        return;
      }

      const rzp = new window.Razorpay({
        key: keyId,
        amount: data.amount,
        currency: data.currency,
        name: "CareerCompass",
        description: "Student Pro Plan",
        order_id: data.id,
        handler: () => {
          setError(null);
          alert("Payment successful! Welcome to Pro.");
        },
        theme: { color: "#FF6B35" },
      });
      rzp.open();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setUpgrading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-28">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <Crown className="mx-auto mb-4 h-10 w-10 text-[#FFD60A]" />
        <h1 className="font-display text-4xl text-white">
          Simple, Student-Friendly Pricing
        </h1>
        <p className="mt-3 text-white/60">
          Start free. Upgrade when you&apos;re ready.
        </p>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto mb-8 max-w-md rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-200"
        >
          {error}
        </motion.div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {PLANS.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card
              className={cn(
                "relative h-full rounded-2xl border bg-[#12121F]",
                plan.highlight
                  ? "border-[#FFD60A] shadow-[0_0_30px_rgba(255,214,10,0.15)]"
                  : "border-white/10",
              )}
            >
              {plan.badge && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FFD60A] text-[#080814] hover:bg-[#FFD60A]/90">
                  {plan.badge}
                </Badge>
              )}
              <CardHeader className="pb-2 pt-8 text-center">
                <plan.icon
                  className={cn(
                    "mx-auto h-10 w-10",
                    plan.highlight ? "text-[#FFD60A]" : "text-[#FF6B35]",
                  )}
                />
                <CardTitle className="mt-4 font-display text-2xl text-white">
                  {plan.name}
                </CardTitle>
                <div className="mt-2">
                  <span className="font-display text-4xl text-white">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-sm text-white/50">{plan.period}</span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex flex-col justify-between pb-8">
                <ul className="mb-8 space-y-3">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-sm text-white/75"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#06d6a0]" />
                      {f}
                    </li>
                  ))}
                </ul>
                {plan.name === "School Pack" ? (
                  <a
                    href="mailto:careercompass.karnataka@gmail.com?subject=School%20Pack%20Inquiry"
                    className="inline-flex w-full items-center justify-center rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20"
                  >
                    {plan.cta}
                  </a>
                ) : plan.highlight ? (
                  <Button
                    onClick={() => void handleUpgrade()}
                    disabled={upgrading}
                    className="w-full rounded-xl bg-[#FFD60A] font-semibold text-[#080814] hover:bg-[#FFD60A]/90"
                  >
                    {upgrading ? "Processing…" : plan.cta}
                  </Button>
                ) : (
                  <Button
                    disabled={plan.disabled}
                    className="w-full rounded-xl bg-white/10 text-white hover:bg-white/20"
                  >
                    {plan.cta}
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
