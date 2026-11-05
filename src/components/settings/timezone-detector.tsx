"use client";

import { useEffect, useRef } from "react";
import { saveDetectedTimezoneAction } from "@/app/(app)/settings/actions";
import { timezoneLabel } from "@/components/settings/timezone-form";
import { notify } from "@/lib/notify";

// Rendered only while the profile is as sign-up left it: saves this device's zone once
// (DATA_MODEL Q-5). Renders nothing.
export function TimezoneDetector() {
  // Development runs effects twice; one request is enough.
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    saveDetectedTimezoneAction(zone).then(
      (saved) => {
        if (saved) {
          notify.success(
            `Time zone set to ${timezoneLabel(saved)}. You can change it in Settings.`,
          );
        }
      },
      // Settings still pre-fills the device's zone, so nothing is lost if this fails.
      () => undefined,
    );
  }, []);

  return null;
}
