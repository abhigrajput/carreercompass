import { useState } from "react";
import type { TouchEvent } from "react";

export function useSwipe(
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  threshold = 50,
) {
  const [touchStart, setTouchStart] = useState<number | null>(null);

  return {
    onTouchStart: (e: TouchEvent) => {
      setTouchStart(e.touches[0]?.clientX ?? null);
    },
    onTouchEnd: (e: TouchEvent) => {
      if (touchStart === null) return;
      const diff = touchStart - (e.changedTouches[0]?.clientX ?? touchStart);
      if (Math.abs(diff) > threshold) {
        if (diff > 0) onSwipeLeft?.();
        else onSwipeRight?.();
      }
      setTouchStart(null);
    },
  };
}
