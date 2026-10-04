"use client";

import { useEffect, useState } from "react";

/**
 * useState that mirrors its value to localStorage.
 * Starts with `initial` on both server and first client render (no hydration
 * mismatch), then loads any saved value after mount.
 */
export function usePersistentState<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) setState(JSON.parse(raw) as T);
    } catch {
      /* corrupted or unavailable storage: fall back to initial */
    }
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
      /* storage full or blocked: ignore */
    }
  }, [key, state, hydrated]);

  return [state, setState] as const;
}
