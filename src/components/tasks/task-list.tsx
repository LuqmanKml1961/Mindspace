"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { TaskViewName } from "@/application/tasks/records";
import { FormMessages } from "@/components/forms/form-parts";
import { TaskItem } from "@/components/tasks/task-item";
import { TaskSheet } from "@/components/tasks/task-sheet";
import {
  completeTask,
  reopenTask,
  taskUseCases,
} from "@/components/tasks/task-use-cases";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import type { Task } from "@/domain/tasks/task";
import type { EncryptedTask } from "@/domain/tasks/task-repository";
import { errorMessage } from "@/lib/action-errors";
import { notify } from "@/lib/notify";

const emptyText: Record<TaskViewName, { title: string; description: string }> =
  {
    today: {
      title: "Nothing for today.",
      description: "Enjoy the space, or add something above.",
    },
    upcoming: {
      title: "Nothing coming up.",
      description: "Tasks with a later date wait here.",
    },
    noDate: {
      title: "No undated tasks.",
      description: "Tasks without a date wait here until you need them.",
    },
    completed: {
      title: "Nothing completed this week.",
      description: "Tasks you finish rest here for seven days.",
    },
  };

// The server sends this view's tasks as ciphertext; this device decrypts them (D-021).
// Completing or reopening goes straight to the server, which refreshes the list.
export function TaskList({
  userId,
  records,
  today,
  view,
}: {
  userId: string;
  records: EncryptedTask[];
  today: string;
  view: TaskViewName;
}) {
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [error, setError] = useState<string>();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Task | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    let current = true;
    taskUseCases.openTasks({ userId, records }).then(
      (opened) => {
        if (current) setTasks(opened);
      },
      (cause) => {
        if (current) setError(errorMessage(cause));
      },
    );
    return () => {
      current = false;
    };
  }, [userId, records]);

  function undo(id: string) {
    reopenTask(id).catch((cause) => notify.error(errorMessage(cause)));
  }

  function toggle(task: Task) {
    const completing = task.completedAt === null;
    setBusyId(task.id);
    (completing ? completeTask(task.id) : reopenTask(task.id))
      .then(
        () =>
          completing
            ? notify.success("Task completed.", {
                label: "Undo",
                onClick: () => undo(task.id),
              })
            : notify.success("Task reopened."),
        (cause) => notify.error(errorMessage(cause)),
      )
      .finally(() => setBusyId(null));
  }

  let content: ReactNode;
  if (error) {
    content = <FormMessages error={error} />;
  } else if (!tasks) {
    content = (
      <div role="status" className="flex flex-col gap-2">
        <span className="sr-only">Loading your tasks…</span>
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  } else if (tasks.length === 0) {
    content = (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>{emptyText[view].title}</EmptyTitle>
          <EmptyDescription>{emptyText[view].description}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  } else {
    content = (
      <ul className="flex flex-col gap-2">
        {tasks.map((task) => {
          const done = task.completedAt !== null;
          const busy = busyId === task.id;
          return (
            <li key={task.id} className="flex items-center gap-3">
              <Checkbox
                // Shows the new state while the server saves it.
                checked={busy ? !done : done}
                disabled={busy}
                aria-label={`${done ? "Reopen" : "Complete"} ${task.title}`}
                onCheckedChange={() => toggle(task)}
              />
              <TaskItem
                task={task}
                today={today}
                onOpen={() => {
                  setEditing(task);
                  setSheetOpen(true);
                }}
              />
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <>
      {content}
      <TaskSheet
        userId={userId}
        task={editing}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onClosed={() => setEditing(null)}
      />
    </>
  );
}
