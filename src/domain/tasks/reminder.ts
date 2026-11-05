import { ValidationError } from "@/domain/shared/errors";

// In-app only (D-008). A reminder always belongs to a task: a standalone reminder is a task with
// a reminder (DATA_MODEL Q-4). It holds no free text, so nothing in it is encrypted.
export type Reminder = {
  id: string;
  userId: string;
  taskId: string;
  remindAt: Date;
  // null until the user dismisses it.
  dismissedAt: Date | null;
  createdAt: Date;
};

// The database assigns id and createdAt, and a new reminder is not dismissed.
export type NewReminder = Pick<Reminder, "userId" | "taskId" | "remindAt">;

// Due once its time has come, until it is dismissed.
export function isReminderDue(
  reminder: Pick<Reminder, "remindAt" | "dismissedAt">,
  now: Date,
): boolean {
  return (
    reminder.dismissedAt === null &&
    reminder.remindAt.getTime() <= now.getTime()
  );
}

export function createReminder(props: {
  userId: string;
  taskId: string;
  remindAt: Date;
}): NewReminder {
  if (!props.taskId) {
    throw new ValidationError("A reminder belongs to a task.");
  }
  if (Number.isNaN(props.remindAt.getTime())) {
    throw new ValidationError("Choose when to be reminded.");
  }
  return {
    userId: props.userId,
    taskId: props.taskId,
    remindAt: props.remindAt,
  };
}
