const DEV_HMAC_KEY = "careercompass-public-demo-hmac";

function getHmacKey(): string {
  return process.env.NEXT_PUBLIC_APP_HMAC_KEY ?? DEV_HMAC_KEY;
}

export async function signRequest(
  body: object,
  timestamp: string,
): Promise<string> {
  const message = JSON.stringify(body) + timestamp;
  const encoder = new TextEncoder();
  const key = await globalThis.crypto.subtle.importKey(
    "raw",
    encoder.encode(getHmacKey()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await globalThis.crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(message),
  );
  return btoa(
    String.fromCharCode.apply(
      null,
      Array.from(new Uint8Array(signature)),
    ),
  );
}
