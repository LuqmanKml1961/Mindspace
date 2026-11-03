"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";
import { themeColors } from "@/lib/theme-colors";

// The theme-color metas follow the system scheme; this keeps them in step with a manual choice.
export function ThemeColorSync() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (resolvedTheme !== "light" && resolvedTheme !== "dark") return;
    document
      .querySelectorAll('meta[name="theme-color"]')
      .forEach((meta) =>
        meta.setAttribute("content", themeColors[resolvedTheme]),
      );
  }, [resolvedTheme]);

  return null;
}
