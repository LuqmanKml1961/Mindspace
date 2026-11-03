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

// Reveals the new theme by morphing the pressed pill button into a circle that covers the screen.
function revealFrom(origin: Element, applyTheme: () => void) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const rect = origin.getBoundingClientRect();
  const { borderRadius } = getComputedStyle(origin);
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  const radius = Math.hypot(Math.max(x, width - x), Math.max(y, height - y));

  const pill = `inset(${rect.top}px ${width - rect.right}px ${height - rect.bottom}px ${rect.left}px round ${borderRadius})`;
  const circle = `inset(${y - radius}px ${width - x - radius}px ${height - y - radius}px ${x - radius}px round ${radius}px)`;

  // next-themes applies the class in an effect; flushSync makes it land before the snapshot.
  const transition = document.startViewTransition(() => flushSync(applyTheme));
  transition.ready
    .then(() => {
      document.documentElement.animate(
        { clipPath: [pill, circle] },
        {
          duration: 450,
          easing: "cubic-bezier(0.4, 0, 0.2, 1)",
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
