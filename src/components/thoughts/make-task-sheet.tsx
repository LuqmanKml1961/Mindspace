"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { SubmitButton } from "@/components/forms/form-parts";
import { TaskFields, type TaskDraft } from "@/components/tasks/task-fields";
import { taskUseCases } from "@/components/tasks/task-use-cases";
import { tasksHref, viewForDue } from "@/components/tasks/task-views";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { taskDraftFromThought } from "@/domain/tasks/task";
import type { Thought } from "@/domain/thoughts/thought";
import { errorMessage } from "@/lib/action-errors";
import { notify } from "@/lib/notify";

function MakeTaskForm({
  userId,
  thought,
  today,
}: {
  userId: string;
  thought: Thought;
  today: string;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<TaskDraft>(() => {
    const { title, notes } = taskDraftFromThought(thought);
    return {
      title,
      notes: notes ?? "",
      date: "",
      time: "",
      priority: "normal",
    };
  });
  const [pending, startTransition] = useTransition();

  function create() {
    if (pending || !draft.title.trim()) return;
    const dueDate = draft.date || null;
    startTransition(async () => {
      try {
        const { task, archived } = await taskUseCases.convertThought({
          userId,
          thoughtId: thought.id,
          task: {
            title: draft.title,
            notes: draft.notes,
            dueDate,
            dueTime: dueDate ? draft.time || null : null,
            priority: draft.priority,
          },
        });
        notify.success(
          archived
            ? "Task created. The thought is archived."
            : "Task created. The thought couldn’t be archived, so it’s still where it was.",
        );
        router.push(tasksHref(viewForDue(task.dueDate, today)));
      } catch (cause) {
        // Nothing was created; the draft stays as typed.
        notify.error(errorMessage(cause));
      }
    });
  }

  return (
    <form
      className="flex min-h-0 flex-1 flex-col"
      onSubmit={(event) => {
        event.preventDefault();
        create();
      }}
    >
      <SheetHeader>
        <SheetTitle>Make it a task</SheetTitle>
        <SheetDescription>
          The task links back to this thought, and the thought moves to
          Archived.
        </SheetDescription>
      </SheetHeader>
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-2">
        <TaskFields
          draft={draft}
          pending={pending}
          onChange={(next) => setDraft({ ...draft, ...next })}
        />
      </div>
      <SheetFooter className="flex-row">
        <SubmitButton pending={pending} disabled={!draft.title.trim()}>
          Create task
        </SubmitButton>
      </SheetFooter>
    </form>
  );
}

// P4.7: the title and notes are pre-filled from the thought (taskDraftFromThought).
export function MakeTaskSheet({
  userId,
  thought,
  today,
  open,
  onOpenChange,
}: {
  userId: string;
  thought: Thought;
  today: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="data-[side=right]:w-full data-[side=right]:sm:max-w-md">
        <MakeTaskForm userId={userId} thought={thought} today={today} />
      </SheetContent>
    </Sheet>
  );
}
