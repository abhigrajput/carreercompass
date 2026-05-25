import { parseBody } from "@/lib/api-guard";
import { timingSafeEqual } from "@/lib/security/timing-safe";
import { AdminAuthSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const parsed = await parseBody(req, AdminAuthSchema);
  if (parsed instanceof Response) return parsed;

  const expected = process.env.ADMIN_PASSWORD ?? "careercompass2025";
  const { password } = parsed.data;

  if (!timingSafeEqual(password, expected)) {
    console.log("SECURITY FIX: Admin auth failed (timing-safe compare)");
    return Response.json({ ok: false }, { status: 401 });
  }

  return Response.json({
    ok: true,
    token: Buffer.from(`admin:${expected}`).toString("base64"),
  });
}
