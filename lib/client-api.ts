"use client";

import { getAuthToken } from "@/lib/student-storage";
import { getDeviceFingerprint } from "@/lib/fingerprint";
import { signRequest } from "@/lib/request-signer";

export async function buildSignedHeaders(
  body: object,
): Promise<Record<string, string>> {
  const timestamp = Date.now().toString();
  const signature = await signRequest(body, timestamp);

  return {
    "Content-Type": "application/json",
    "x-cc-signature": signature,
    "x-cc-timestamp": timestamp,
    "x-device-fingerprint": getDeviceFingerprint(),
    ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}),
  };
}
