import { createServiceRoleClient } from "@/lib/supabase/admin";

export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const admin = createServiceRoleClient();
    if (!admin) return null;

    const { data } = await admin
      .from("cache_store")
      .select("value, expires_at")
      .eq("key", key)
      .maybeSingle();

    if (!data) return null;
    if (new Date(data.expires_at).getTime() < Date.now()) {
      await admin.from("cache_store").delete().eq("key", key);
      return null;
    }
    return data.value as T;
  } catch {
    return null;
  }
}

export async function setCache(
  key: string,
  value: unknown,
  ttlSeconds = 3600,
): Promise<void> {
  try {
    const admin = createServiceRoleClient();
    if (!admin) return;

    const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();
    await admin
      .from("cache_store")
      .upsert({ key, value, expires_at: expiresAt });
  } catch {
    /* cache is optional */
  }
}

export async function invalidateCache(prefix: string): Promise<void> {
  try {
    const admin = createServiceRoleClient();
    if (!admin) return;
    await admin.from("cache_store").delete().like("key", `${prefix}%`);
  } catch {
    /* noop */
  }
}
