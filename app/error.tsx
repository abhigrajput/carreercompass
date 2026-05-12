"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 py-24 text-center">
      <div className="rounded-2xl border border-white/10 bg-[#12121F] p-8 shadow-glow">
        <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-[#FFD60A]" aria-hidden />
        <h1 className="font-display text-2xl text-white">
          Something went wrong
        </h1>
        <p className="mt-3 max-w-md text-sm text-white/65">
          CareerCompass hit an unexpected error. You can try again or head back
          home.
        </p>
        {error.message ? (
          <p className="mt-4 rounded-lg bg-black/40 px-3 py-2 font-mono text-xs text-white/50">
            {error.message}
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button
            type="button"
            className="rounded-lg bg-[#FF6B35] text-[#080814] hover:bg-[#ff844f]"
            onClick={() => reset()}
          >
            Try again
          </Button>
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "outline", size: "default" }),
              "rounded-lg border-white/15 text-white hover:bg-white/10",
            )}
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
