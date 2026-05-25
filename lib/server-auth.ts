import { requireStudentToken } from "@/lib/auth-token";
import { verifyRequestSignature } from "@/lib/request-signature-server";

export function getAuthorizedStudentId(
  req: Request,
  body: unknown,
): string | null {
  const auth = requireStudentToken(req);
  if (!auth?.studentId) return null;

  const signature = req.headers.get("x-cc-signature");
  const timestamp = req.headers.get("x-cc-timestamp");
  if (!verifyRequestSignature(body, signature, timestamp)) {
    return null;
  }

  return auth.studentId;
}
