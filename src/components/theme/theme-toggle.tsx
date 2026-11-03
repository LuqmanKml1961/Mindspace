"use client";

import {
  ComputerPhoneSyncIcon,
  Moon02Icon,
  Sun01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { flushSync } from "react-dom";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const options = [
  { value: "light", label: "Light", icon: Sun01Icon },
  { value: "dark", label: "Dark", icon: Moon02Icon },
  { value: "system", label: "System", icon: ComputerPhoneSyncIcon },
];

const noopSubscribe = () => () => {};

// Reveals the new theme by growing the pressed button's outline until it fills the screen.
function revealFrom(origin: Element, applyTheme: () => void) {
  const rect = origin.getBoundingClientRect();
  const { borderRadius } = getComputedStyle(origin);
  const buttonOutline = `inset(${rect.top}px ${window.innerWidth - rect.right}px ${window.innerHeight - rect.bottom}px ${rect.left}px round ${borderRadius})`;

  // next-themes applies the class in an effect; flushSync makes it land before the snapshot.
  const transition = document.startViewTransition(() => flushSync(applyTheme));
  transition.ready
    .then(() => {
      document.documentElement.animate(
        { clipPath: [buttonOutline, "inset(0 0 0 0 round 0)"] },
        {
          duration: 400,
          easing: "cubic-bezier(0.2, 0, 0, 1)",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    })
    .catch(() => {});
}

export function ThemeToggle({ labelledBy }: { labelledBy: string }) {
  const { theme, setTheme, resolvedTheme, systemTheme } = useTheme();
  // The theme is only known in the browser; render the control after hydration.
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  if (!mounted) return <div className="h-10" />;

  return (
    <ToggleGroup
      aria-labelledby={labelledBy}
      variant="outline"
      value={[theme ?? "system"]}
      onValueChange={(value, details) => {
        const next = value[0];
        if (!next) return;

        const target = details.event.target;
        const origin =
          target instanceof Element ? target.closest("button") : null;
        const nextResolved = next === "system" ? systemTheme : next;
        const animate =
          origin &&
          "startViewTransition" in document &&
          nextResolved !== resolvedTheme &&
          !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (!animate) {
          setTheme(next);
          return;
        }

        revealFrom(origin, () => setTheme(next));
      }}
    >
      {options.map((option) => (
        <ToggleGroupItem key={option.value} value={option.value}>
          <HugeiconsIcon
            icon={option.icon}
            data-icon="inline-start"
            aria-hidden="true"
          />
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
