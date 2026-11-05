import type { Clock } from "@/application/tasks/ports";
import { createReminder, type Reminder } from "@/domain/tasks/reminder";
import type { ReminderRepository } from "@/domain/tasks/reminder-repository";
import type {
  EncryptedTask,
  TaskRepository,
} from "@/domain/tasks/task-repository";

// Server side: reminders hold no free text (D-008), so nothing here is encrypted. The user id
// always comes from the session.

export function makeAddReminder(deps: { reminders: ReminderRepository }) {
  return async (userId: string, input: { taskId: string; remindAt: Date }) =>
    deps.reminders.create(createReminder({ userId, ...input }));
}

// Active reminders (soonest first) with their tasks, as ciphertext, so the browser can show each
// task's title. Reminders of completed tasks are left out, so finished work never reminds you;
// reopening the task brings them back. One read per distinct task, which suits a person's list.
export function makeListReminderRecords(deps: {
  reminders: ReminderRepository;
  tasks: TaskRepository;
}) {
  return async (
    userId: string,
  ): Promise<{ reminders: Reminder[]; tasks: EncryptedTask[] }> => {
    const active = await deps.reminders.listActive(userId);
    const taskIds = [...new Set(active.map((reminder) => reminder.taskId))];
    const found = await Promise.all(
      taskIds.map((id) => deps.tasks.findById(userId, id)),
    );
    const open = found.filter(
      (task): task is EncryptedTask =>
        task !== null && task.completedAt === null,
    );
    const openIds = new Set(open.map((task) => task.id));
    return {
      reminders: active.filter((reminder) => openIds.has(reminder.taskId)),
      tasks: open,
    };
  };
}

// Dismissal is stamped with the server's clock.
export function makeDismissReminder(deps: {
  reminders: ReminderRepository;
  clock: Clock;
}) {
  return (userId: string, id: string) =>
    deps.reminders.dismiss(userId, id, deps.clock());
}
