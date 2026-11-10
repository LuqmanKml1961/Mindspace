"use client";

import { useEffect } from "react";
import { notify } from "@/lib/notify";

// Installs the service worker (the offline page) and, once a newer deploy is live, offers a
// refresh. It never reloads by itself, so nothing you're typing is lost (P6.2).
export function AppUpdates({ version }: { version: string }) {
  useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }
    const workers = navigator.serviceWorker;
    let offered = false;

    function onMessage(event: MessageEvent) {
      const data = event.data;
      if (offered || data?.type !== "version" || data.version === version) {
        return;
      }
      offered = true;
      notify.notice(
        "A new version is ready. Refresh once you’ve saved what you’re writing.",
        { label: "Refresh", onClick: () => location.reload() },
      );
    }

    // A deploy is looked for whenever the app comes back to the foreground.
    function onVisible() {
      if (document.visibilityState !== "visible") return;
      workers
        .getRegistration()
        .then((registration) => registration?.update())
        .catch(() => undefined);
      workers.controller?.postMessage("version");
    }

    workers.addEventListener("message", onMessage);
    document.addEventListener("visibilitychange", onVisible);
    // Without a worker the app still works; only the offline page is missing.
    workers
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .catch(() => undefined);

    return () => {
      workers.removeEventListener("message", onMessage);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [version]);

  return null;
}
