"use client";

import { useState, useEffect } from "react";

/**
 * Returns true when the primary pointer is coarse (touch/finger).
 * Updates reactively if the user connects/disconnects a mouse (e.g., iPad + Magic Keyboard).
 * SSR-safe: defaults to false (desktop behavior) during server render.
 */
export function useTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    setIsTouch(mq.matches);

    const handler = (e: MediaQueryListEvent) => setIsTouch(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return isTouch;
}
