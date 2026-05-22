export function hapticCorrect() {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate([50]);
  }
}

export function hapticWrong() {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate([100, 50, 100]);
  }
}

export function hapticSuccess() {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate([30, 40, 30]);
  }
}
