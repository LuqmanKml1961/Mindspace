"use client";

import { useEffect } from "react";
import { notify } from "@/lib/notify";

// A notice while the device is offline, closed again when the connection returns (P6.2).
export function ConnectionStatus() {
  useEffect(() => {
    let notice: string | null = null;

    function offline() {
      notice ??= notify.notice(
        "You’re offline. You can keep typing, and save once you’re connected.",
      );
    }

    function online() {
      if (notice === null) return;
      notify.close(notice);
      notice = null;
      notify.success("You’re back online.");
    }

    if (!navigator.onLine) offline();
    window.addEventListener("offline", offline);
    window.addEventListener("online", online);
    return () => {
      window.removeEventListener("offline", offline);
      window.removeEventListener("online", online);
      if (notice !== null) notify.close(notice);
    };
  }, []);

  return null;
}
