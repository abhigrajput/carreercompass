import { createClient } from "@supabase/supabase-js";

/** Only for trusted server routes (e.g. parent token lookup). */
export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return null;
  }
  if (!url.startsWith("https://")) {
    throw new Error(
      `Invalid SUPABASE_URL — expected https:// URL, got: ${url.slice(0, 40)}...`,
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
