"use client";

import { Delete02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState, useTransition } from "react";
import { FormField, SubmitButton } from "@/components/forms/form-parts";
import { taskUseCases } from "@/components/tasks/task-use-cases";
import { priorityLabels } from "@/components/tasks/task-views";
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
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  isTaskPriority,
  TASK_PRIORITIES,
  type Task,
  type TaskPriority,
} from "@/domain/tasks/task";
import { errorMessage } from "@/lib/action-errors";
import { notify } from "@/lib/notify";

type Draft = {
  title: string;
  notes: string;
  date: string;
  time: string;
  priority: TaskPriority;
};

const draftOf = (task: Task): Draft => ({
  title: task.title,
  notes: task.notes ?? "",
  date: task.dueDate ?? "",
  time: task.dueTime ?? "",
  priority: task.priority,
});

// Only what differs from the saved task; the date and time always go together.
function changesBetween(task: Task, draft: Draft) {
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
  onDone,
}: {
  userId: string;
  task: Task;
  onDone: () => void;
}) {
  const [draft, setDraft] = useState(() => draftOf(task));
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const edit = (next: Partial<Draft>) => setDraft({ ...draft, ...next });
  const changes = changesBetween(task, draft);
  const unchanged = Object.keys(changes).length === 0;

  function save() {
    if (pending || unchanged) return;
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
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-2">
        <FieldGroup>
          <FormField
            id="task-title"
            label="Title"
            autoComplete="off"
            value={draft.title}
            readOnly={pending}
            onChange={(event) => edit({ title: event.target.value })}
          />
          <Field>
            <FieldLabel htmlFor="task-notes">Notes</FieldLabel>
            <Textarea
              id="task-notes"
              value={draft.notes}
              readOnly={pending}
              className="max-h-[40svh] min-h-24"
              onChange={(event) => edit({ notes: event.target.value })}
            />
            <FieldDescription>Optional.</FieldDescription>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel htmlFor="task-date">Date</FieldLabel>
              <Input
                id="task-date"
                type="date"
                value={draft.date}
                readOnly={pending}
                onChange={(event) =>
                  edit({
                    date: event.target.value,
                    time: event.target.value ? draft.time : "",
                  })
                }
              />
            </Field>
            <Field data-disabled={!draft.date || undefined}>
              <FieldLabel htmlFor="task-time">Time</FieldLabel>
              <Input
                id="task-time"
                type="time"
                value={draft.time}
                readOnly={pending}
                disabled={!draft.date}
                onChange={(event) => edit({ time: event.target.value })}
              />
            </Field>
          </div>
          {draft.date && (
            <div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={pending}
                onClick={() => edit({ date: "", time: "" })}
              >
                Clear date
              </Button>
            </div>
          )}
          <Field>
            <FieldTitle id="task-priority-label">Priority</FieldTitle>
            <ToggleGroup
              aria-labelledby="task-priority-label"
              variant="outline"
              value={[draft.priority]}
              disabled={pending}
              onValueChange={(value) => {
                const next = value[0];
                if (isTaskPriority(next)) edit({ priority: next });
              }}
            >
              {TASK_PRIORITIES.map((priority) => (
                <ToggleGroupItem key={priority} value={priority}>
                  {priorityLabels[priority]}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </Field>
        </FieldGroup>
      </div>
      <SheetFooter className="flex-row flex-wrap items-center justify-between">
        <SubmitButton
          pending={pending && !confirming}
          disabled={unchanged || pending || !draft.title.trim()}
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
  open,
  onClose,
  onClosed,
}: {
  userId: string;
  task: Task | null;
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
            onDone={onClose}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
