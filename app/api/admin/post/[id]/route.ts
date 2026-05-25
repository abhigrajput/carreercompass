import { isAdminRequest } from "@/lib/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  if (!isAdminRequest(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createServiceRoleClient();
  if (!admin) {
    return Response.json({ error: "Server unavailable" }, { status: 503 });
  }

  await admin.from("community_posts").delete().eq("id", params.id);
  return Response.json({ ok: true });
}
