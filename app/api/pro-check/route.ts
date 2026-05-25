import { createServiceRoleClient } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  const studentId = req.headers.get("x-student-id");
  if (!studentId) {
    return Response.json({ isPro: false });
  }

  const admin = createServiceRoleClient();
  if (!admin) {
    return Response.json({ isPro: false });
  }

  const { data } = await admin
    .from("students")
    .select("is_pro")
    .eq("id", studentId)
    .maybeSingle();

  return Response.json({ isPro: Boolean(data?.is_pro) });
}
