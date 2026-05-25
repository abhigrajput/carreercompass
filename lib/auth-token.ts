import jwt from "jsonwebtoken";

const DEV_JWT_SECRET = "careercompass-dev-jwt-secret-change-me";

function getJwtSecret(): string {
  if (!process.env.JWT_SECRET) {
    console.warn("SECURITY FIX: JWT_SECRET missing, using development fallback secret.");
  }
  return process.env.JWT_SECRET ?? DEV_JWT_SECRET;
}

export function generateToken(studentId: string): string {
  return jwt.sign({ studentId }, getJwtSecret(), { expiresIn: "30d" });
}

export function verifyToken(token: string): { studentId: string } | null {
  try {
    return jwt.verify(token, getJwtSecret()) as { studentId: string };
  } catch {
    return null;
  }
}

export function getBearerToken(req: Request): string | null {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice(7).trim() || null;
}

export function requireStudentToken(req: Request): { studentId: string } | null {
  const token = getBearerToken(req);
  if (!token) return null;
  return verifyToken(token);
}
