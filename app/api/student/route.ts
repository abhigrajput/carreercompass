import { createServiceRoleClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      name: string;
      class: "10" | "11" | "12";
      city: "bengaluru" | "mysuru" | "hubballi";
      language: "en" | "kn" | "hi";
      known_goal?: string | null;
      knownGoal?: string | null;
      stream?: "science" | "commerce" | "arts" | null;
      email?: string | null;
      referred_by?: string | null;
      auth_id?: string | null;
      school_name?: string | null;
      schoolName?: string | null;
    };

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
        return Response.json({ ok: true, persisted: true, student: existing });
      }
    }

    const { data, error } = await admin
      .from("students")
      .insert({
        name: body.name,
        class: body.class,
        city: body.city,
        language: body.language,
        known_goal: body.known_goal ?? body.knownGoal ?? null,
        stream: body.stream ?? null,
        email: body.email ?? null,
        referred_by: body.referred_by ?? null,
        auth_id: body.auth_id ?? null,
        school_name: body.school_name ?? body.schoolName ?? null,
      })
      .select()
      .maybeSingle();

    if (error) {
      console.error("Supabase error:", error);
      return Response.json({ ok: false, error: error.message }, { status: 500 });
    }

    if (body.referred_by && data?.id) {
      try {
        await admin.rpc("increment_referral", {
          code: body.referred_by,
        });
      } catch {
        /* best effort — RPC may not exist yet */
      }
    }

    return Response.json({ ok: true, persisted: true, student: data });
  } catch (e) {
    console.error(e);
    return Response.json({ ok: false }, { status: 500 });
  }
}
