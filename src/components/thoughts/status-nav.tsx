import Link from "next/link";
import {
  statusLabels,
  thoughtsHref,
} from "@/components/thoughts/thought-status";
import { buttonVariants } from "@/components/ui/button";
import {
  THOUGHT_STATUSES,
  type ThoughtStatus,
} from "@/domain/thoughts/thought";

// Links, not a toggle: each view has its own URL, so back and refresh keep it.
export function StatusNav({ current }: { current: ThoughtStatus }) {
  return (
    <nav aria-label="Thought views" className="flex flex-wrap gap-2">
      {THOUGHT_STATUSES.map((status) => (
        <Link
          key={status}
          href={thoughtsHref(status)}
          aria-current={status === current ? "page" : undefined}
          className={buttonVariants({
            variant: status === current ? "default" : "ghost",
            size: "sm",
          })}
        >
          {statusLabels[status]}
        </Link>
      ))}
    </nav>
  );
}
