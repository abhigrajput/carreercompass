const REQUIRED_ENV_VARS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "DEEPSEEK_API_KEY",
] as const;

export function checkEnvVars(): void {
  if (typeof process === "undefined") return;

  const missing = REQUIRED_ENV_VARS.filter((v) => !process.env[v]);
  if (missing.length > 0) {
      console.error("SECURITY FIX: Missing env vars:", missing.join(", "));
    }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (url && !url.startsWith("https://")) {
      console.error("SECURITY FIX: NEXT_PUBLIC_SUPABASE_URL must use https://");
    }
}
