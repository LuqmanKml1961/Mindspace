"use client";

import { useState, useTransition } from "react";
import {
  addReminder,
  dismissReminder,
} from "@/components/tasks/task-use-cases";
import { reminderLabel } from "@/components/tasks/task-views";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldTitle } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import type { Reminder } from "@/domain/tasks/reminder";
import { errorMessage } from "@/lib/action-errors";
import { notify } from "@/lib/notify";
import { useNow } from "@/lib/use-now";

// A task's reminders in its edit sheet. Adding or dismissing one saves at once, apart from the
// sheet's Save. The picker's time is the device's own (datetime-local), so it is read as local.
export function TaskReminders({
  taskId,
  reminders,
}: {
  taskId: string;
  reminders: Reminder[];
}) {
  const [when, setWhen] = useState("");
  const [pending, startTransition] = useTransition();
  const now = useNow();

  function add() {
    if (pending || !when) return;
    const remindAt = new Date(when);
    startTransition(async () => {
      try {
        await addReminder(taskId, remindAt);
        setWhen("");
        notify.success(
          `Reminder set for ${reminderLabel(remindAt, new Date())}.`,
        );
      } catch (cause) {
        notify.error(errorMessage(cause));
      }
    });
  }

  function dismiss(id: string) {
    startTransition(async () => {
      try {
        await dismissReminder(id);
        notify.success("Reminder dismissed.");
      } catch (cause) {
        notify.error(errorMessage(cause));
      }
    });
  }

  return (
    <Field>
      <FieldTitle id="task-reminders-label">Reminders</FieldTitle>
      {now && reminders.length > 0 && (
        <ul
          aria-labelledby="task-reminders-label"
          className="flex flex-col gap-1"
        >
          {reminders.map((reminder) => {
            const label = reminderLabel(reminder.remindAt, now);
            return (
              <li
                key={reminder.id}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <span>{label}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={pending}
                  aria-label={`Dismiss the reminder for ${label}`}
                  onClick={() => dismiss(reminder.id)}
                >
                  Dismiss
                </Button>
              </li>
            );
          })}
        </ul>
      )}
      <InputGroup>
        <InputGroupInput
          type="datetime-local"
          aria-label="Remind me at"
          value={when}
          readOnly={pending}
          onChange={(event) => setWhen(event.target.value)}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            type="button"
            variant="default"
            size="sm"
            disabled={pending || !when}
            onClick={add}
          >
            {pending && <Spinner data-icon="inline-start" />}
            Add
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <FieldDescription>
        Shows on Home and Tasks when it’s time. No notifications are sent.
      </FieldDescription>
    </Field>
  );
}
