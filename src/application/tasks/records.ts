import type {
  Clock,
  EncryptedTaskEdits,
  EncryptedTaskInput,
} from "@/application/tasks/ports";
import { DEFAULT_TIMEZONE } from "@/domain/profiles/profile";
import type { ProfileRepository } from "@/domain/profiles/profile-repository";
import { dateInTimeZone } from "@/domain/shared/calendar";
import { toTaskDue } from "@/domain/tasks/task";
import type { TaskRepository, TaskView } from "@/domain/tasks/task-repository";

// Server side (D-021): stores and returns ciphertext only; the text was checked and encrypted on
// the device. The due date and time are readable, so the domain's rules are applied to them
// again here. The user id always comes from the session.

// The Completed view shows tasks completed within this many days.
export const RECENTLY_COMPLETED_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

export type TaskViewName = TaskView["view"];

// "Today" is the date in the user's own time zone (P4.2), never the server's; UTC with no profile.
async function userToday(
  profiles: ProfileRepository,
  userId: string,
  now: Date,
): Promise<string> {
  const profile = await profiles.findById(userId);
  return dateInTimeZone(now, profile?.timezone ?? DEFAULT_TIMEZONE);
}

export function makeGetToday(deps: {
  profiles: ProfileRepository;
  clock: Clock;
}) {
  return (userId: string) => userToday(deps.profiles, userId, deps.clock());
}

export function makeListTaskRecords(deps: {
  tasks: TaskRepository;
  profiles: ProfileRepository;
  clock: Clock;
}) {
  return async (userId: string, name: TaskViewName) => {
    const now = deps.clock();
    let view: TaskView;
    if (name === "noDate") {
      view = { view: "noDate" };
    } else if (name === "completed") {
      const since = new Date(now.getTime() - RECENTLY_COMPLETED_DAYS * DAY_MS);
      view = { view: "completed", since };
    } else {
      view = { view: name, today: await userToday(deps.profiles, userId, now) };
    }
    return deps.tasks.list(userId, view);
  };
}

export function makeGetTaskRecord(deps: { tasks: TaskRepository }) {
  return (userId: string, id: string) => deps.tasks.findById(userId, id);
}

export function makeCreateTaskRecord(deps: { tasks: TaskRepository }) {
  return async (userId: string, task: EncryptedTaskInput) =>
    deps.tasks.create({
      ...task,
      ...toTaskDue({ date: task.dueDate, time: task.dueTime }),
      userId,
    });
}

// The date and time arrive together (taskEditsSchema), so the rule is checked on both.
export function makeUpdateTaskRecord(deps: { tasks: TaskRepository }) {
  return async (userId: string, id: string, edits: EncryptedTaskEdits) => {
    const checked =
      edits.dueDate === undefined
        ? edits
        : {
            ...edits,
            ...toTaskDue({ date: edits.dueDate, time: edits.dueTime }),
          };
    return deps.tasks.update(userId, id, checked);
  };
}

export function makeDeleteTaskRecord(deps: { tasks: TaskRepository }) {
  return (userId: string, id: string) => deps.tasks.delete(userId, id);
}

// Completion is stamped with the server's clock.
export function makeCompleteTask(deps: {
  tasks: TaskRepository;
  clock: Clock;
}) {
  return (userId: string, id: string) =>
    deps.tasks.update(userId, id, { completedAt: deps.clock() });
}

export function makeReopenTask(deps: { tasks: TaskRepository }) {
  return (userId: string, id: string) =>
    deps.tasks.update(userId, id, { completedAt: null });
}
