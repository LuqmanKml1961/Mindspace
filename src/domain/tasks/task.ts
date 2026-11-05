import { ValidationError } from "@/domain/shared/errors";
import { characterCount } from "@/domain/shared/text";

// Enforced here, on the device; the database checks the ciphertext sizes derived from them
// (DATA_MODEL.md, tasks). Notes match a thought's limit, so a converted thought fits (Q-6).
export const TASK_TITLE_MAX = 500;
export const TASK_NOTES_MAX = 10_000;

export const TASK_PRIORITIES = ["low", "normal", "high"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

// The due date is the user's own calendar day (YYYY-MM-DD) and the time their wall-clock time
// (HH:MM), so neither shifts with time zones. A time needs a date.
export type TaskDue = { dueDate: string | null; dueTime: string | null };

export type Task = TaskDue & {
  id: string;
  userId: string;
  title: string;
  notes: string | null;
  priority: TaskPriority;
  // null while the task is open.
  completedAt: Date | null;
  sourceThoughtId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// A task before it is saved: the database assigns id and timestamps, and a new task is open.
export type NewTask = Pick<
  Task,
  | "userId"
  | "title"
  | "notes"
  | "dueDate"
  | "dueTime"
  | "priority"
  | "sourceThoughtId"
>;

export type TaskChanges = Partial<
  Pick<
    Task,
    "title" | "notes" | "dueDate" | "dueTime" | "priority" | "completedAt"
  >
>;

const DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

export function isTaskPriority(value: unknown): value is TaskPriority {
  return TASK_PRIORITIES.includes(value as TaskPriority);
}

// Trimmed; never empty. Trimmed before encryption, since the server can't check the text.
export function toTaskTitle(input: string): string {
  const title = input.trim();
  if (title.length === 0) throw new ValidationError("Give the task a title.");
  if (characterCount(title) > TASK_TITLE_MAX) {
    throw new ValidationError(
      `Task titles can be up to ${TASK_TITLE_MAX} characters.`,
    );
  }
  return title;
}

// Optional: blank notes are stored as no notes.
export function toTaskNotes(input: string | null | undefined): string | null {
  const notes = input?.trim() ?? "";
  if (notes.length === 0) return null;
  if (characterCount(notes) > TASK_NOTES_MAX) {
    throw new ValidationError(
      `Notes can be up to ${TASK_NOTES_MAX.toLocaleString("en")} characters.`,
    );
  }
  return notes;
}

function isRealDate(value: string): boolean {
  const match = DATE.exec(value);
  if (!match) return false;
  const [year, month, day] = match.slice(1).map(Number);
  // Date.UTC rolls an impossible day such as 2026-02-30 into the next month.
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

// Blank means no date or no time. A time on its own is refused.
export function toTaskDue(input: {
  date?: string | null;
  time?: string | null;
}): TaskDue {
  const date = input.date?.trim() || null;
  const time = input.time?.trim() || null;
  if (date !== null && !isRealDate(date)) {
    throw new ValidationError("Choose a real date.");
  }
  if (time !== null && !TIME.test(time)) {
    throw new ValidationError("Choose a time between 00:00 and 23:59.");
  }
  if (time !== null && date === null) {
    throw new ValidationError("Add a date for this time.");
  }
  return { dueDate: date, dueTime: time };
}

export function createTask(props: {
  userId: string;
  title: string;
  notes?: string | null;
  dueDate?: string | null;
  dueTime?: string | null;
  priority?: TaskPriority;
  sourceThoughtId?: string | null;
}): NewTask {
  return {
    userId: props.userId,
    title: toTaskTitle(props.title),
    notes: toTaskNotes(props.notes),
    ...toTaskDue({ date: props.dueDate, time: props.dueTime }),
    priority: props.priority ?? "normal",
    sourceThoughtId: props.sourceThoughtId ?? null,
  };
}

// A thought turned into a task (P4.7): the title is the thought's own, or its first line cut to
// the task limit; the notes keep the whole text, unless that text is just the title.
export function taskDraftFromThought(thought: {
  title: string | null;
  content: string;
}): { title: string; notes: string | null } {
  const firstLine =
    thought.content
      .split("\n")
      .map((line) => line.trim())
      .find((line) => line.length > 0) ?? "";
  const title =
    thought.title ?? [...firstLine].slice(0, TASK_TITLE_MAX).join("").trim();
  const content = thought.content.trim();
  return { title, notes: content === title ? null : content };
}

// Validates only the fields being changed. The date and time change together, so the
// time-needs-a-date rule never depends on what is already saved.
export function toTaskChanges(input: {
  title?: string;
  notes?: string | null;
  due?: { date: string | null; time: string | null };
  priority?: unknown;
  completedAt?: Date | null;
}): TaskChanges {
  const changes: TaskChanges = {};
  if (input.title !== undefined) changes.title = toTaskTitle(input.title);
  if (input.notes !== undefined) changes.notes = toTaskNotes(input.notes);
  if (input.due !== undefined) Object.assign(changes, toTaskDue(input.due));
  if (input.priority !== undefined) {
    if (!isTaskPriority(input.priority)) {
      throw new ValidationError("Choose low, normal or high priority.");
    }
    changes.priority = input.priority;
  }
  if (input.completedAt !== undefined) changes.completedAt = input.completedAt;
  return changes;
}
