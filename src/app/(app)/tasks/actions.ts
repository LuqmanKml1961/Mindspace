"use server";

import { refresh } from "next/cache";
import { taskEditsSchema, taskInputSchema } from "@/application/tasks/schemas";
import { idSchema } from "@/application/thoughts/schemas";
import type { EncryptedTask } from "@/domain/tasks/task-repository";
import { getAppContext } from "@/infrastructure/container";
import { attempt, failure, type ActionResult } from "@/lib/action-result";

// Writes only (reads happen in Server Components). The browser sends ciphertext for the title and
// notes (D-021); each action checks the user and the input, stores it for the session's user, and
// refreshes the page so the list shows the change.

async function refreshed<T>(work: () => Promise<T>): Promise<T> {
  const result = await work();
  refresh();
  return result;
}

export async function createTaskAction(
  task: unknown,
): Promise<ActionResult<EncryptedTask>> {
  const { user, useCases } = await getAppContext();
  const parsed = taskInputSchema.safeParse(task);
  if (!parsed.success) return failure(new Error("Invalid task"));
  return attempt(() =>
    refreshed(() => useCases.createTaskRecord(user.id, parsed.data)),
  );
}

export async function updateTaskAction(
  id: unknown,
  edits: unknown,
): Promise<ActionResult<EncryptedTask>> {
  const { user, useCases } = await getAppContext();
  const parsedId = idSchema.safeParse(id);
  const parsed = taskEditsSchema.safeParse(edits);
  if (!parsedId.success || !parsed.success) {
    return failure(new Error("Invalid task edits"));
  }
  return attempt(() =>
    refreshed(() =>
      useCases.updateTaskRecord(user.id, parsedId.data, parsed.data),
    ),
  );
}

export async function deleteTaskAction(
  id: unknown,
): Promise<ActionResult<null>> {
  const { user, useCases } = await getAppContext();
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return failure(new Error("Invalid task id"));
  return attempt(() =>
    refreshed(async () => {
      await useCases.deleteTaskRecord(user.id, parsedId.data);
      return null;
    }),
  );
}

export async function completeTaskAction(
  id: unknown,
): Promise<ActionResult<EncryptedTask>> {
  const { user, useCases } = await getAppContext();
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return failure(new Error("Invalid task id"));
  return attempt(() =>
    refreshed(() => useCases.completeTask(user.id, parsedId.data)),
  );
}

export async function reopenTaskAction(
  id: unknown,
): Promise<ActionResult<EncryptedTask>> {
  const { user, useCases } = await getAppContext();
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return failure(new Error("Invalid task id"));
  return attempt(() =>
    refreshed(() => useCases.reopenTask(user.id, parsedId.data)),
  );
}
