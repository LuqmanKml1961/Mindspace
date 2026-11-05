import {
  addReminderAction,
  completeTaskAction,
  createTaskAction,
  deleteTaskAction,
  dismissReminderAction,
  reopenTaskAction,
  updateTaskAction,
} from "@/app/(app)/tasks/actions";
import type { TaskServer } from "@/application/tasks/ports";
import { thoughts } from "@/components/thoughts/brain-dump";
import { createTaskUseCases } from "@/infrastructure/browser";
import { unwrap } from "@/lib/action-errors";

// Only ciphertext goes to the server (D-021); the use cases encrypt before calling these.
const tasks: TaskServer = {
  create: async (task) => unwrap(await createTaskAction(task)),
  update: async (id, edits) => unwrap(await updateTaskAction(id, edits)),
  delete: async (id) => {
    unwrap(await deleteTaskAction(id));
  },
};

export const taskUseCases = createTaskUseCases({ tasks, thoughts });

// Completion holds no text, so the browser asks the server directly (it stamps its own clock).
export async function completeTask(id: string): Promise<void> {
  unwrap(await completeTaskAction(id));
}

export async function reopenTask(id: string): Promise<void> {
  unwrap(await reopenTaskAction(id));
}

// Reminders hold no text either; the server checks them (createReminder) and stamps dismissal.
export async function addReminder(
  taskId: string,
  remindAt: Date,
): Promise<void> {
  unwrap(await addReminderAction({ taskId, remindAt }));
}

export async function dismissReminder(id: string): Promise<void> {
  unwrap(await dismissReminderAction(id));
}
