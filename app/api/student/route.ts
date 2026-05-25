import { guardRateLimit, parseBody } from "@/lib/api-guard";
import { generateToken } from "@/lib/auth-token";
import { clientIp } from "@/lib/rate-limit";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { mapCityForDb, StudentSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const limited = guardRateLimit(req, 20);
  if (limited) return limited;

  const parsed = await parseBody(req, StudentSchema);
  if (parsed instanceof Response) return parsed;

  try {
    const body = parsed.data;
    if (body.website) {
      return Response.json({ ok: true, persisted: false });
    }

    const admin = createServiceRoleClient();
    if (!admin) {
      return Response.json({ ok: true, persisted: false });
    }

    if (body.auth_id) {
      const { data: existing } = await admin
        .from("students")
        .select("*")
        .eq("auth_id", body.auth_id)
        .maybeSingle();
      if (existing) {
        const token = generateToken(existing.id as string);
        return Response.json({ ok: true, persisted: true, student: existing, token });
      }
    }

    const referralCode = body.referred_by ?? body.referral_code;
    const ip = clientIp(req);
    const fingerprint = req.headers.get("x-device-fingerprint");

    if (referralCode) {
      const { count } = await admin
        .from("students")
        .select("id", { count: "exact", head: true })
        .eq("referred_by", referralCode);

      if ((count ?? 0) >= 10) {
        console.log("SECURITY FIX: Referral rate limit exceeded for code");
        return Response.json(
          { ok: false, error: "Referral limit reached for this code" },
          { status: 429 },
        );
      }

      const { data: referrer } = await admin
        .from("students")
        .select("id, email, referral_code")
        .or(`referral_code.eq.${referralCode},id.eq.${referralCode}`)
        .maybeSingle();

      if (referrer?.email && body.email && referrer.email === body.email) {
        return Response.json(
          { ok: false, error: "Self-referral not allowed" },
          { status: 400 },
        );
      }

      await admin.from("analytics_events").insert({
        event: "referral_attempt",
        properties: { ip, referralCode, fingerprint: fingerprint ?? "" },
      });
    }

    const city = mapCityForDb(body.city);

    const { data, error } = await admin
      .from("students")
      .insert({
        name: body.name,
        class: body.class,
        city,
        language: body.language,
        known_goal: body.known_goal ?? body.knownGoal ?? null,
        stream: body.stream ?? null,
        email: body.email || null,
        referred_by: referralCode ?? null,
        auth_id: body.auth_id ?? null,
        school_name: body.school_name ?? body.schoolName ?? null,
      })
      .select()
      .maybeSingle();

    if (error) {
      console.error("Supabase error:", error);
      return Response.json({ ok: false, error: error.message }, { status: 500 });
    }

    if (referralCode && data?.id) {
      try {
        await admin.rpc("increment_referral", { code: referralCode });
      } catch {
        /* RPC may not exist */
      }
    }

    const token = data?.id ? generateToken(data.id as string) : null;
    return Response.json({ ok: true, persisted: true, student: data, token });
  } catch (e) {
    console.error(e);
    return Response.json({ ok: false }, { status: 500 });
  }
}
