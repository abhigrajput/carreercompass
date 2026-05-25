export function getDeviceFingerprint(): string {
  if (typeof window === "undefined") return "server";

  const components = [
    navigator.userAgent,
    navigator.language,
    `${window.screen.width}x${window.screen.height}`,
    new Date().getTimezoneOffset().toString(),
    navigator.hardwareConcurrency?.toString() || "",
  ];

  let hash = 0;
  const joined = components.join("|");
  for (let index = 0; index < joined.length; index += 1) {
    hash = (hash << 5) - hash + joined.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}
