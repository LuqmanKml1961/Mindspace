import type { NewReminder, Reminder } from "@/domain/tasks/reminder";

// Every method is scoped to userId, on top of RLS.
export interface ReminderRepository {
  // Throws NotFoundError if the task doesn't exist (any more) for this user.
  create(reminder: NewReminder): Promise<Reminder>;
  // Not dismissed, soonest first: both due reminders and those still to come (D-008).
  listActive(userId: string): Promise<Reminder[]>;
  // Every reminder, dismissed ones too, oldest first (the data export).
  listAll(userId: string): Promise<Reminder[]>;
  // Throws NotFoundError if there is no such reminder for this user.
  dismiss(userId: string, id: string, at: Date): Promise<Reminder>;
}
