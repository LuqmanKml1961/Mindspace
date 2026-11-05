"use client";

import { useEffect, useState } from "react";
import { FormMessages } from "@/components/forms/form-parts";
import {
  dismissReminder,
  taskUseCases,
} from "@/components/tasks/task-use-cases";
import { reminderLabel } from "@/components/tasks/task-views";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { isReminderDue, type Reminder } from "@/domain/tasks/reminder";
import type { EncryptedTask } from "@/domain/tasks/task-repository";
import { errorMessage } from "@/lib/action-errors";
import { notify } from "@/lib/notify";
import { useNow } from "@/lib/use-now";

// In-app reminders (D-008), soonest first, each with its task's title (decrypted here). Home
// shows every active one; Tasks shows only those that are due. Nothing shows when there are none.
export function ReminderList({
  userId,
  reminders,
  tasks,
  title,
  dueOnly = false,
  limit,
}: {
  userId: string;
  reminders: Reminder[];
  tasks: EncryptedTask[];
  title: string;
  dueOnly?: boolean;
  limit?: number;
}) {
  const now = useNow();
  const [titles, setTitles] = useState<Map<string, string> | null>(null);
  const [error, setError] = useState<string>();
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let current = true;
    taskUseCases.openTasks({ userId, records: tasks }).then(
      (opened) => {
        if (current) setTitles(new Map(opened.map((t) => [t.id, t.title])));
      },
      (cause) => {
        if (current) setError(errorMessage(cause));
      },
    );
    return () => {
      current = false;
    };
  }, [userId, tasks]);

  if (!now) return null;
  const relevant = reminders.filter(
    (reminder) => !dueOnly || isReminderDue(reminder, now),
  );
  if (relevant.length === 0) return null;
  const shown = relevant.slice(0, limit);

  function dismiss(id: string) {
    setBusyId(id);
    dismissReminder(id)
      .then(
        () => notify.success("Reminder dismissed."),
        (cause) => notify.error(errorMessage(cause)),
      )
      .finally(() => setBusyId(null));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2>{title}</h2>
        </CardTitle>
        <CardDescription>
          {relevant.length === 1
            ? "1 reminder"
            : `${relevant.length} reminders`}
          {shown.length < relevant.length &&
            `, showing the next ${shown.length}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <FormMessages error={error} />
        ) : (
          <ul className="flex flex-col gap-2">
            {shown.map((reminder) => {
              const taskTitle = titles?.get(reminder.taskId) ?? "…";
              return (
                <li key={reminder.id}>
                  <Item
                    variant="outline"
                    className="in-data-[slot=card]:bg-background"
                  >
                    <ItemContent>
                      <ItemTitle>{taskTitle}</ItemTitle>
                      <ItemDescription>
                        {reminderLabel(reminder.remindAt, now)}
                      </ItemDescription>
                    </ItemContent>
                    <ItemActions>
                      {isReminderDue(reminder, now) && (
                        <Badge variant="secondary">Now</Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={busyId === reminder.id}
                        aria-label={`Dismiss the reminder for ${taskTitle}`}
                        onClick={() => dismiss(reminder.id)}
                      >
                        Dismiss
                      </Button>
                    </ItemActions>
                  </Item>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
