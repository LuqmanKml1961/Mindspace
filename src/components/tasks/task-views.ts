import type { TaskViewName } from "@/application/tasks/records";
import { addDays } from "@/domain/shared/calendar";
import type { Task, TaskPriority } from "@/domain/tasks/task";

export const TASK_VIEWS: TaskViewName[] = [
  "today",
  "upcoming",
  "noDate",
  "completed",
];

export const viewLabels: Record<TaskViewName, string> = {
  today: "Today",
  upcoming: "Upcoming",
  noDate: "No date",
  completed: "Completed",
};

export const priorityLabels: Record<TaskPriority, string> = {
  low: "Low",
  normal: "Normal",
  high: "High",
};

const slugs: Record<TaskViewName, string> = {
  today: "today",
  upcoming: "upcoming",
  noDate: "no-date",
  completed: "completed",
};

// Anything that isn't a known view means Today, the default.
export function taskViewFromParam(value: unknown): TaskViewName {
  return TASK_VIEWS.find((view) => slugs[view] === value) ?? "today";
}

export function tasksHref(view: TaskViewName): string {
  return view === "today" ? "/tasks" : `/tasks?view=${slugs[view]}`;
}

// The view an open task appears in, from its due date.
export function viewForDue(
  dueDate: string | null,
  today: string,
): TaskViewName {
  if (dueDate === null) return "noDate";
  return dueDate <= today ? "today" : "upcoming";
}

// Quick add keeps a new task where you are looking: today on Today, tomorrow on Upcoming, no
// date on No date. There is no quick add on Completed.
export function quickAddDate(
  view: TaskViewName,
  today: string,
): string | null | undefined {
  if (view === "today") return today;
  if (view === "upcoming") return addDays(today, 1);
  if (view === "noDate") return null;
  return undefined;
}

// Due dates are calendar days and times are wall-clock times, so they are formatted in UTC,
// which leaves them exactly as stored, in the device's own language and style.
const dayFormat = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});
const dayWithYearFormat = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});
const timeFormat = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
  timeZone: "UTC",
});

export function formatDay(date: string, today: string): string {
  const format =
    date.slice(0, 4) === today.slice(0, 4) ? dayFormat : dayWithYearFormat;
  return format.format(new Date(`${date}T00:00:00Z`));
}

// Reminders are moments, so they are shown in the device's own time zone.
const reminderDay = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  month: "short",
  day: "numeric",
});
const reminderDayWithYear = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
});
const reminderTime = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
});

export function reminderLabel(remindAt: Date, now: Date): string {
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  let day: string;
  if (remindAt.toDateString() === now.toDateString()) day = "Today";
  else if (remindAt.toDateString() === tomorrow.toDateString()) {
    day = "Tomorrow";
  } else if (remindAt.getFullYear() === now.getFullYear()) {
    day = reminderDay.format(remindAt);
  } else {
    day = reminderDayWithYear.format(remindAt);
  }
  return `${day}, ${reminderTime.format(remindAt)}`;
}

// Neutral wording for a date that has passed (DESIGN.md §8: no "overdue" in red).
export function dueLabel(
  task: Pick<Task, "dueDate" | "dueTime">,
  today: string,
): string | null {
  if (!task.dueDate) return null;
  let day: string;
  if (task.dueDate < today) {
    day = `Waiting since ${formatDay(task.dueDate, today)}`;
  } else if (task.dueDate === today) {
    day = "Today";
  } else if (task.dueDate === addDays(today, 1)) {
    day = "Tomorrow";
  } else {
    day = formatDay(task.dueDate, today);
  }
  if (!task.dueTime) return day;
  return `${day} · ${timeFormat.format(new Date(`1970-01-01T${task.dueTime}:00Z`))}`;
}
