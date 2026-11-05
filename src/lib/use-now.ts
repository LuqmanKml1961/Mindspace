"use client";

import { useSyncExternalStore } from "react";

const TICK_MS = 30_000;
let now = Date.now();

// The time changes only when the tick updates it, so React reads a stable value in between.
function subscribe(onChange: () => void) {
  now = Date.now();
  const id = setInterval(() => {
    now = Date.now();
    onChange();
  }, TICK_MS);
  return () => clearInterval(id);
}

// The current time, refreshed every 30 seconds, so what is due appears without a reload. Null on
// the server and during hydration, so both render the same thing.
export function useNow(): Date | null {
  const time = useSyncExternalStore(
    subscribe,
    () => now,
    () => null,
  );
  return time === null ? null : new Date(time);
}
