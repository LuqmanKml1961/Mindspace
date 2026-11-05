import type { TaskDue, TaskPriority } from "@/domain/tasks/task";

// A task as the server stores it (D-021): the title and notes are ciphertext, encrypted on the
// device after the domain rules ran there. The due date and time, priority and completion stay
// readable, so the views can be queried and sorted.
export type EncryptedTask = TaskDue & {
  id: string;
  userId: string;
  titleCiphertext: string;
  notesCiphertext: string | null;
  priority: TaskPriority;
  completedAt: Date | null;
  sourceThoughtId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// The database assigns id and timestamps, and a new task is open.
export type NewEncryptedTask = Pick<
  EncryptedTask,
  | "userId"
  | "titleCiphertext"
  | "notesCiphertext"
  | "dueDate"
  | "dueTime"
  | "priority"
  | "sourceThoughtId"
>;

export type EncryptedTaskChanges = Partial<
  Pick<
    EncryptedTask,
    | "titleCiphertext"
    | "notesCiphertext"
    | "dueDate"
    | "dueTime"
    | "priority"
    | "completedAt"
  >
>;

// The Tasks views (P4.5). `today` is the user's own date (P4.2), so the server never has to
// guess a time zone.
export type TaskView =
  // Open, due today or earlier (overdue).
  | { view: "today"; today: string }
  // Open, due after today.
  | { view: "upcoming"; today: string }
  // Open, with no due date.
  | { view: "noDate" }
  // Completed at or after `since`.
  | { view: "completed"; since: Date };

// Every method is scoped to userId, on top of RLS.
export interface TaskRepository {
  // Throws NotFoundError if the source thought doesn't exist (any more) for this user.
  create(task: NewEncryptedTask): Promise<EncryptedTask>;
  findById(userId: string, id: string): Promise<EncryptedTask | null>;
  // Today and Upcoming: by due date, then time (untimed last), then oldest first. No date:
  // newest first. Completed: most recently completed first.
  list(userId: string, view: TaskView): Promise<EncryptedTask[]>;
  // Throws NotFoundError if there is no such task for this user.
  update(
    userId: string,
    id: string,
    changes: EncryptedTaskChanges,
  ): Promise<EncryptedTask>;
  // Its reminders go with it. Throws NotFoundError if there is no such task for this user.
  delete(userId: string, id: string): Promise<void>;
}
