"use client";

import { useState } from "react";
import { validationMessage } from "@/components/forms/form-parts";
import { priorityQuestion } from "@/components/clarity/check-in-prompts";
import { STEP_HEADING_ID } from "@/components/clarity/check-in-step";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Spinner } from "@/components/ui/spinner";
import {
  toCheckInPriority,
  type CheckInPriority,
} from "@/domain/check-ins/daily-check-in";
import type { Task } from "@/domain/tasks/task";

type PriorityChange = { taskId: string | null; text: string | null };

// The last step (spec §4.7): one of today's tasks, or a few words of your own. Choosing one
// clears the other, so it is never both. The other tasks stay where they are.
export function CheckInPriority({
  tasks,
  saved,
  position,
  total,
  pending,
  onMove,
}: {
  tasks: Task[];
  saved: CheckInPriority;
  position: number;
  total: number;
  pending: boolean;
  // `priority` is undefined when nothing changed.
  onMove: (
    priority: PriorityChange | undefined,
    move: "back" | "finish",
  ) => void;
}) {
  const [taskId, setTaskId] = useState(saved.priorityTaskId ?? "");
  const [text, setText] = useState(saved.priorityText ?? "");
  const error = validationMessage(() => toCheckInPriority({ taskId, text }));
  const move = (to: "back" | "finish") => {
    const next = toCheckInPriority({ taskId, text });
    const unchanged =
      next.priorityTaskId === saved.priorityTaskId &&
      next.priorityText === saved.priorityText;
    onMove(
      unchanged
        ? undefined
        : { taskId: next.priorityTaskId, text: next.priorityText },
      to,
    );
  };

  return (
    <Card>
      <form
        className="contents"
        onSubmit={(event) => {
          event.preventDefault();
          if (!pending && !error) move("finish");
        }}
      >
        <CardHeader>
          <CardDescription>
            {position} of {total}
          </CardDescription>
          <CardTitle>
            <h2 id={STEP_HEADING_ID} tabIndex={-1} className="outline-none">
              {priorityQuestion}
            </h2>
          </CardTitle>
          <CardDescription>
            Just one. Everything else stays where it is.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            {tasks.length > 0 && (
              <Field>
                <FieldLabel htmlFor="check-in-priority-task">
                  One of today’s tasks
                </FieldLabel>
                <NativeSelect
                  id="check-in-priority-task"
                  className="w-full"
                  value={taskId}
                  disabled={pending}
                  onChange={(event) => {
                    setTaskId(event.target.value);
                    if (event.target.value) setText("");
                  }}
                >
                  <NativeSelectOption value="">No task</NativeSelectOption>
                  {tasks.map((task) => (
                    <NativeSelectOption key={task.id} value={task.id}>
                      {task.title}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </Field>
            )}
            <Field data-invalid={error ? true : undefined}>
              <FieldLabel htmlFor="check-in-priority-text">
                {tasks.length > 0
                  ? "Or in your own words"
                  : "In your own words"}
              </FieldLabel>
              <Input
                id="check-in-priority-text"
                autoComplete="off"
                aria-invalid={error ? true : undefined}
                value={text}
                readOnly={pending}
                onChange={(event) => {
                  setText(event.target.value);
                  if (event.target.value.trim()) setTaskId("");
                }}
              />
              {error ? (
                <FieldError>{error}</FieldError>
              ) : (
                <FieldDescription>Optional.</FieldDescription>
              )}
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="flex-wrap justify-between gap-2">
          <Button
            type="button"
            variant="ghost"
            disabled={pending || !!error}
            onClick={() => move("back")}
          >
            Back
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => onMove(undefined, "finish")}
            >
              Skip for now
            </Button>
            <Button type="submit" disabled={pending || !!error}>
              {pending && <Spinner data-icon="inline-start" />}
              Finish
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
