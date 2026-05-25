"use client";

import { useState } from "react";
import { Copy, MessageCircle, Gift } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { shareContent } from "@/lib/share";

interface ReferralCardProps {
  code: string;
  referralCount: number;
  bonusPoints: number;
}

export function ReferralCard({ code, referralCount, bonusPoints }: ReferralCardProps) {
  const [copied, setCopied] = useState(false);

  const shareText = `Join me on CareerCompass — India's first Kannada career guide! Use code ${code} at careercompass.vercel.app`;

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard not available */
    }
  };

  const shareReferral = async () => {
    await shareContent(
      "CareerCompass Referral",
      shareText,
      "https://careercompass.vercel.app/referral",
    );
  };

  return (
    <Card className="rounded-2xl border-white/10 bg-[#12121F]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg text-white">
          <Gift className="h-5 w-5 text-[#FFD60A]" />
          Refer & Earn
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-white/70">
          Share with friends and earn <span className="font-semibold text-[#FFD60A]">50 points</span> per referral!
        </p>

        <motion.div
          className="flex items-center justify-center gap-3 rounded-xl border border-dashed border-[#FFD60A]/40 bg-[#FFD60A]/5 p-4"
          whileHover={{ scale: 1.02 }}
        >
          <span className="font-mono text-2xl font-bold tracking-[0.2em] text-[#FFD60A]">
            {code}
          </span>
        </motion.div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1 rounded-lg border-white/15 text-white hover:bg-white/10"
            onClick={() => void copyCode()}
          >
            <Copy className="mr-2 h-4 w-4" />
            {copied ? "Copied!" : "Copy Code"}
          </Button>
          <button
            type="button"
            onClick={() => void shareReferral()}
            className="inline-flex flex-1 items-center justify-center rounded-lg bg-[#25D366] px-4 py-2 text-sm font-medium text-[#080814] hover:bg-[#1ebe57]"
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Share
          </button>
        </div>

        <p className="text-center text-sm text-white/60">
          You have referred <span className="font-semibold text-white">{referralCount}</span> friends
          {bonusPoints > 0 ? (
            <> — earned <span className="font-semibold text-[#FFD60A]">{bonusPoints}</span> bonus points</>
          ) : null}
        </p>
      </CardContent>
    </Card>
  );
}
