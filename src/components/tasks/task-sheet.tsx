"use client";

import { Delete02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState, useTransition } from "react";
import { SubmitButton } from "@/components/forms/form-parts";
import {
  TaskFields,
  taskDraftErrors,
  type TaskDraft,
} from "@/components/tasks/task-fields";
import { TaskReminders } from "@/components/tasks/task-reminders";
import { taskUseCases } from "@/components/tasks/task-use-cases";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import type { Reminder } from "@/domain/tasks/reminder";
import type { Task, TaskPriority } from "@/domain/tasks/task";
import { errorMessage } from "@/lib/action-errors";
import { notify } from "@/lib/notify";

const draftOf = (task: Task): TaskDraft => ({
  title: task.title,
  notes: task.notes ?? "",
  date: task.dueDate ?? "",
  time: task.dueTime ?? "",
  priority: task.priority,
});

// Only what differs from the saved task; the date and time always go together.
function changesBetween(task: Task, draft: TaskDraft) {
  const changes: {
    title?: string;
    notes?: string;
    due?: { date: string | null; time: string | null };
    priority?: TaskPriority;
  } = {};
  if (draft.title !== task.title) changes.title = draft.title;
  if ((draft.notes.trim() || null) !== task.notes) changes.notes = draft.notes;
  const date = draft.date || null;
  const time = date ? draft.time || null : null;
  if (date !== task.dueDate || time !== task.dueTime) {
    changes.due = { date, time };
  }
  if (draft.priority !== task.priority) changes.priority = draft.priority;
  return changes;
}

function TaskForm({
  userId,
  task,
  reminders,
  onDone,
}: {
  userId: string;
  task: Task;
  reminders: Reminder[];
  onDone: () => void;
}) {
  const [draft, setDraft] = useState(() => draftOf(task));
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const changes = changesBetween(task, draft);
  const unchanged = Object.keys(changes).length === 0;
  const errors = taskDraftErrors(draft);
  const invalid = Boolean(errors.title || errors.notes);

  function save() {
    if (pending || unchanged || invalid) return;
    startTransition(async () => {
      try {
        await taskUseCases.updateTask({ userId, id: task.id, changes });
        notify.success("Changes saved.");
        onDone();
      } catch (cause) {
        // The draft stays as typed, so nothing is lost.
        notify.error(errorMessage(cause));
      }
    });
  }

  function remove() {
    startTransition(async () => {
      try {
        await taskUseCases.deleteTask({ id: task.id });
        setConfirming(false);
        notify.success("Task deleted.");
        onDone();
      } catch (cause) {
        setConfirming(false);
        notify.error(errorMessage(cause));
      }
    });
  }

  return (
    <form
      className="flex min-h-0 flex-1 flex-col"
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
    >
      <SheetHeader>
        <SheetTitle>Edit task</SheetTitle>
        <SheetDescription>Only the title is needed.</SheetDescription>
      </SheetHeader>
      <div className="flex min-h-0 flex-1 flex-col gap-7 overflow-y-auto px-6 pb-2">
        <TaskFields
          draft={draft}
          pending={pending}
          onChange={(next) => setDraft({ ...draft, ...next })}
        />
        {/* A completed task can't remind you, so its reminders are hidden until it reopens. */}
        {task.completedAt === null && (
          <TaskReminders taskId={task.id} reminders={reminders} />
        )}
      </div>
      <SheetFooter className="flex-row flex-wrap items-center justify-between">
        <SubmitButton
          pending={pending && !confirming}
          disabled={unchanged || pending || invalid}
        >
          Save changes
        </SubmitButton>
        <AlertDialog open={confirming} onOpenChange={setConfirming}>
          <AlertDialogTrigger
            render={
              <Button type="button" variant="destructive" disabled={pending}>
                <HugeiconsIcon
                  icon={Delete02Icon}
                  strokeWidth={2}
                  data-icon="inline-start"
                  aria-hidden="true"
                />
                Delete
              </Button>
            }
          />
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20">
                <HugeiconsIcon
                  icon={Delete02Icon}
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </AlertDialogMedia>
              <AlertDialogTitle>Delete this task?</AlertDialogTitle>
              <AlertDialogDescription>
                It will be gone for good, on every device.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel variant="ghost" disabled={pending}>
                Keep it
              </AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                disabled={pending}
                onClick={remove}
              >
                {pending ? (
                  <Spinner data-icon="inline-start" />
                ) : (
                  <HugeiconsIcon
                    icon={Delete02Icon}
                    strokeWidth={2}
                    data-icon="inline-start"
                    aria-hidden="true"
                  />
                )}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SheetFooter>
    </form>
  );
}

// The task stays mounted while the sheet slides closed; `open` drives the animation.
export function TaskSheet({
  userId,
  task,
  reminders,
  open,
  onClose,
  onClosed,
}: {
  userId: string;
  task: Task | null;
  // Active reminders; the sheet shows those of its task.
  reminders: Reminder[];
  open: boolean;
  onClose: () => void;
  onClosed: () => void;
}) {
  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      onOpenChangeComplete={(next) => {
        if (!next) onClosed();
      }}
    >
      <SheetContent className="data-[side=right]:w-full data-[side=right]:sm:max-w-md">
        {task && (
          <TaskForm
            key={task.id}
            userId={userId}
            task={task}
            reminders={reminders.filter((r) => r.taskId === task.id)}
            onDone={onClose}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
