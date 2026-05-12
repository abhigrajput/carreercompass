import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return null;
  }
  if (!url.startsWith("https://")) {
    throw new Error(
      `Invalid SUPABASE_URL — expected https:// URL, got: ${url.slice(0, 40)}...`,
    );
  }
  return createBrowserClient(url, key);
}
