import { timingSafeEqual } from "@/lib/security/timing-safe";

export function getAdminBearerToken() {
  const expected = process.env.ADMIN_PASSWORD ?? "careercompass2025";
  return Buffer.from(`admin:${expected}`).toString("base64");
}

export function isAdminRequest(req: Request) {
  const auth = req.headers.get("authorization") ?? "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  return timingSafeEqual(bearer, getAdminBearerToken());
}
