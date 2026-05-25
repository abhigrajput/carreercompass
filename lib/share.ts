export async function shareContent(
  title: string,
  text: string,
  url: string,
): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return true;
    } catch {
      /* user cancelled or share failed */
    }
  }

  if (typeof window !== "undefined") {
    const waUrl = `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  }
  return false;
}
