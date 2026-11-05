"use client";

import { useState, useTransition } from "react";
import type { TaskViewName } from "@/application/tasks/records";
import { taskUseCases } from "@/components/tasks/task-use-cases";
import { quickAddDate } from "@/components/tasks/task-views";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { errorMessage } from "@/lib/action-errors";
import { notify } from "@/lib/notify";

const placeholders: Partial<Record<TaskViewName, string>> = {
  today: "Add a task for today",
  upcoming: "Add a task for tomorrow",
  noDate: "Add a task",
};

const added: Partial<Record<TaskViewName, string>> = {
  today: "Added for today.",
  upcoming: "Added for tomorrow.",
  noDate: "Task added.",
};

// Only the title is needed; the date follows the view (quickAddDate). Not shown on Completed.
export function QuickAdd({
  userId,
  view,
  today,
}: {
  userId: string;
  view: TaskViewName;
  today: string;
}) {
  const [title, setTitle] = useState("");
  const [pending, startTransition] = useTransition();
  const dueDate = quickAddDate(view, today);
  if (dueDate === undefined) return null;

  function add() {
    if (pending || !title.trim()) return;
    startTransition(async () => {
      try {
        await taskUseCases.createTask({ userId, title, dueDate });
        setTitle("");
        notify.success(added[view] ?? "Task added.");
      } catch (cause) {
        // The title stays as typed, so nothing is lost.
        notify.error(errorMessage(cause));
      }
    });
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        add();
      }}
    >
      <Field>
        <FieldLabel htmlFor="quick-add" className="sr-only">
          New task
        </FieldLabel>
        <InputGroup>
          <InputGroupInput
            id="quick-add"
            autoComplete="off"
            placeholder={placeholders[view]}
            value={title}
            readOnly={pending}
            onChange={(event) => setTitle(event.target.value)}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              type="submit"
              variant="default"
              size="sm"
              disabled={pending || !title.trim()}
            >
              {pending && <Spinner data-icon="inline-start" />}
              Add
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </Field>
    </form>
  );
}
