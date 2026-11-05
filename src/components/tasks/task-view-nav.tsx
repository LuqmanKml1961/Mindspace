import Link from "next/link";
import type { TaskViewName } from "@/application/tasks/records";
import {
  TASK_VIEWS,
  tasksHref,
  viewLabels,
} from "@/components/tasks/task-views";
import { buttonVariants } from "@/components/ui/button";

// Links, not a toggle: each view has its own URL, so back and refresh keep it.
export function TaskViewNav({ current }: { current: TaskViewName }) {
  return (
    <nav aria-label="Task views" className="flex flex-wrap gap-2">
      {TASK_VIEWS.map((view) => (
        <Link
          key={view}
          href={tasksHref(view)}
          aria-current={view === current ? "page" : undefined}
          className={buttonVariants({
            variant: view === current ? "default" : "ghost",
            size: "sm",
          })}
        >
          {viewLabels[view]}
        </Link>
      ))}
    </nav>
  );
}
