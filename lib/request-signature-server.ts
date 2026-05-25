import crypto from "crypto";

const DEV_HMAC_KEY = "careercompass-public-demo-hmac";

function getHmacKey(): string {
  return process.env.NEXT_PUBLIC_APP_HMAC_KEY ?? DEV_HMAC_KEY;
}

export function verifyRequestSignature(
  body: unknown,
  signature: string | null,
  timestamp: string | null,
): boolean {
  if (!signature || !timestamp) return false;

  const ageMs = Math.abs(Date.now() - Number(timestamp));
  if (!Number.isFinite(ageMs) || ageMs > 5 * 60 * 1000) {
    return false;
  }

  const message = JSON.stringify(body) + timestamp;
  const expected = crypto
    .createHmac("sha256", getHmacKey())
    .update(message)
    .digest("base64");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(signature),
    );
  } catch {
    return false;
  }
}
