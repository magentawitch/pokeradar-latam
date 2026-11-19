"use client";

import { useEffect, useState } from "react";

/** How long the first-visit note stays up without any interaction. */
export const INTRO_TIMEOUT_MS = 6000;

/**
 * Whether the first-visit sticky note has been dismissed: after a few
 * seconds, or at once on the first click, tap or key press anywhere (map,
 * buttons, dialogs). Listens in the capture phase so nothing can swallow it.
 */
export function useIntroDismissal(timeoutMs = INTRO_TIMEOUT_MS) {
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (isDismissed) return;
    const dismiss = () => setIsDismissed(true);
    const timer = window.setTimeout(dismiss, timeoutMs);
    const options = { capture: true, once: true } as const;
    window.addEventListener("pointerdown", dismiss, options);
    window.addEventListener("keydown", dismiss, options);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pointerdown", dismiss, options);
      window.removeEventListener("keydown", dismiss, options);
    };
  }, [isDismissed, timeoutMs]);

  return isDismissed;
}
