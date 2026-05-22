export function trackEvent(
  event: string,
  properties?: Record<string, string | number | boolean | null>,
) {
  if (typeof window === "undefined") return;
  void fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event,
      properties: properties ?? {},
      timestamp: new Date().toISOString(),
    }),
  }).catch(() => {
    /* silent */
  });
}
