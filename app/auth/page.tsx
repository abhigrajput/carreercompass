"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { createClient } from "@/lib/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";

export default function AuthPage() {
  const router = useRouter();
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [configured, setConfigured] = useState(true);

  useEffect(() => {
    const client = createClient();
    if (!client) {
      setConfigured(false);
      return;
    }
    setSupabase(client);
  }, []);

  useEffect(() => {
    if (!supabase) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        router.push("/dashboard");
      } else if (event === "USER_UPDATED") {
        router.push("/onboarding");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  if (!configured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080814]">
        <div className="rounded-xl border border-white/10 bg-[#12121F] p-8 text-center">
          <p className="text-lg text-white/70">
            Supabase is not configured. Please set{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 text-sm text-[#FF6B35]">
              NEXT_PUBLIC_SUPABASE_URL
            </code>{" "}
            and{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 text-sm text-[#FF6B35]">
              NEXT_PUBLIC_SUPABASE_ANON_KEY
            </code>{" "}
            in your environment.
          </p>
        </div>
      </div>
    );
  }

  if (!supabase) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080814]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF6B35] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#080814] px-4">
      <div className="mb-8 text-center">
        <h1 className="font-[var(--font-syne)] text-4xl font-bold tracking-tight">
          <span className="text-[#FF6B35]">Career</span>
          <span className="text-[#FFD60A]">Compass</span>
        </h1>
        <p className="mt-3 text-base text-white/60">
          Your AI career guide. Free. In your language.
        </p>
        <p className="mt-1 font-[var(--font-noto-kannada)] text-sm text-white/40">
          ನಿಮ್ಮ ದಾರಿ ಕಂಡುಕೊಳ್ಳಿ
        </p>
      </div>

      <div className="w-full max-w-sm rounded-xl border border-white/10 bg-[#12121F] p-6">
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: "#FF6B35",
                  brandAccent: "#e55a28",
                  inputBackground: "#080814",
                  inputText: "white",
                  inputBorder: "rgba(255,255,255,0.1)",
                  inputBorderFocus: "#FF6B35",
                  inputBorderHover: "rgba(255,255,255,0.2)",
                },
                borderWidths: {
                  buttonBorderWidth: "0px",
                  inputBorderWidth: "1px",
                },
                radii: {
                  borderRadiusButton: "8px",
                  inputBorderRadius: "8px",
                },
              },
            },
          }}
          theme="dark"
          providers={["google"]}
          redirectTo={`${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`}
        />
      </div>
    </div>
  );
}
