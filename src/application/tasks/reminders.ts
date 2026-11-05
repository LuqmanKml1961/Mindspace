import type { Clock } from "@/application/tasks/ports";
import { createReminder } from "@/domain/tasks/reminder";
import type { ReminderRepository } from "@/domain/tasks/reminder-repository";

// Server side: reminders hold no free text (D-008), so nothing here is encrypted. The user id
// always comes from the session.

export function makeAddReminder(deps: { reminders: ReminderRepository }) {
  return async (userId: string, input: { taskId: string; remindAt: Date }) =>
    deps.reminders.create(createReminder({ userId, ...input }));
}

export function makeListActiveReminders(deps: {
  reminders: ReminderRepository;
}) {
  return (userId: string) => deps.reminders.listActive(userId);
}

// Dismissal is stamped with the server's clock.
export function makeDismissReminder(deps: {
  reminders: ReminderRepository;
  clock: Clock;
}) {
  return (userId: string, id: string) =>
    deps.reminders.dismiss(userId, id, deps.clock());
}
