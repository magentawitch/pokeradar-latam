"use client";

import { useRef } from "react";
import type { PointerEvent } from "react";

/** Horizontal travel (px) that counts as a swipe. */
const SWIPE_MIN_PX = 60;

interface SwipeHandlers {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

/**
 * Pointer handlers that detect a mostly-horizontal touch or pen swipe. The
 * element should allow vertical scrolling only (`touch-pan-y`) so the browser
 * hands horizontal gestures to us. Nothing moves while swiping, so there's no
 * motion to reduce; mouse drags are ignored.
 */
export function useSwipe({ onSwipeLeft, onSwipeRight }: SwipeHandlers) {
  const startRef = useRef<{ x: number; y: number } | null>(null);

  return {
    onPointerDown: (event: PointerEvent) => {
      startRef.current =
        event.pointerType === "mouse"
          ? null
          : { x: event.clientX, y: event.clientY };
    },
    onPointerUp: (event: PointerEvent) => {
      const start = startRef.current;
      startRef.current = null;
      if (!start) return;
      const deltaX = event.clientX - start.x;
      const deltaY = event.clientY - start.y;
      if (Math.abs(deltaX) < SWIPE_MIN_PX) return;
      if (Math.abs(deltaX) < Math.abs(deltaY) * 1.5) return;
      if (deltaX < 0) onSwipeLeft();
      else onSwipeRight();
    },
    onPointerCancel: () => {
      startRef.current = null;
    },
  };
}
