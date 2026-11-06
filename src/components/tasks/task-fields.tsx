"use client";

import { FormField } from "@/components/forms/form-parts";
import { priorityLabels } from "@/components/tasks/task-views";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ValidationError } from "@/domain/shared/errors";
import {
  isTaskPriority,
  TASK_PRIORITIES,
  toTaskNotes,
  toTaskTitle,
  type TaskPriority,
} from "@/domain/tasks/task";

// A task as typed into a form; blank date and time mean none.
export type TaskDraft = {
  title: string;
  notes: string;
  date: string;
  time: string;
  priority: TaskPriority;
};

// The domain's own message when a rule is broken, or undefined.
export function validationMessage(check: () => unknown): string | undefined {
  try {
    check();
    return undefined;
  } catch (error) {
    return error instanceof ValidationError ? error.message : undefined;
  }
}

// Shown as the person types, so a title or notes over the limit never reach Save.
export function taskDraftErrors(draft: TaskDraft) {
  return {
    title: validationMessage(() => toTaskTitle(draft.title)),
    notes: validationMessage(() => toTaskNotes(draft.notes)),
  };
}

// The fields shared by the edit sheet and "Make it a task". The time needs a date, so it is
// disabled without one, and clearing the date clears it too.
export function TaskFields({
  draft,
  pending,
  onChange,
}: {
  draft: TaskDraft;
  pending: boolean;
  onChange: (next: Partial<TaskDraft>) => void;
}) {
  const errors = taskDraftErrors(draft);
  return (
    <FieldGroup>
      <FormField
        id="task-title"
        label="Title"
        autoComplete="off"
        error={errors.title}
        value={draft.title}
        readOnly={pending}
        onChange={(event) => onChange({ title: event.target.value })}
      />
      <Field data-invalid={errors.notes ? true : undefined}>
        <FieldLabel htmlFor="task-notes">Notes</FieldLabel>
        <Textarea
          id="task-notes"
          aria-invalid={errors.notes ? true : undefined}
          value={draft.notes}
          readOnly={pending}
          className="max-h-[40svh] min-h-24"
          onChange={(event) => onChange({ notes: event.target.value })}
        />
        {errors.notes ? (
          <FieldError>{errors.notes}</FieldError>
        ) : (
          <FieldDescription>Optional.</FieldDescription>
        )}
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
              onChange({
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
            onChange={(event) => onChange({ time: event.target.value })}
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
            onClick={() => onChange({ date: "", time: "" })}
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
            if (isTaskPriority(next)) onChange({ priority: next });
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
  );
}
