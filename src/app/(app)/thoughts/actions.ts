"use server";

import { refresh } from "next/cache";
import {
  categoryNameCiphertextSchema,
  idSchema,
  thoughtChangesSchema,
  thoughtInputSchema,
} from "@/application/thoughts/schemas";
import type { EncryptedCategory } from "@/domain/thoughts/category-repository";
import type { EncryptedThought } from "@/domain/thoughts/thought-repository";
import { getAppContext } from "@/infrastructure/container";
import { attempt, failure, type ActionResult } from "@/lib/action-result";

// Writes only (reads happen in Server Components). The browser sends ciphertext (D-021); each
// action checks the user and the input format, then stores it for the session's user.

export async function createThoughtAction(
  thought: unknown,
): Promise<ActionResult<EncryptedThought>> {
  const { user, useCases } = await getAppContext();
  const parsed = thoughtInputSchema.safeParse(thought);
  if (!parsed.success) return failure(new Error("Invalid thought"));
  return attempt(async () => {
    const record = await useCases.createThoughtRecord(user.id, parsed.data);
    // The list under the capture box re-renders with the new thought.
    refresh();
    return record;
  });
}

export async function updateThoughtAction(
  id: unknown,
  changes: unknown,
): Promise<ActionResult<EncryptedThought>> {
  const { user, useCases } = await getAppContext();
  const parsedId = idSchema.safeParse(id);
  const parsed = thoughtChangesSchema.safeParse(changes);
  if (!parsedId.success || !parsed.success) {
    return failure(new Error("Invalid thought changes"));
  }
  return attempt(() =>
    useCases.updateThoughtRecord(user.id, parsedId.data, parsed.data),
  );
}

export async function deleteThoughtAction(
  id: unknown,
): Promise<ActionResult<null>> {
  const { user, useCases } = await getAppContext();
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return failure(new Error("Invalid thought id"));
  return attempt(async () => {
    await useCases.deleteThoughtRecord(user.id, parsedId.data);
    return null;
  });
}

export async function createCategoryAction(
  nameCiphertext: unknown,
): Promise<ActionResult<EncryptedCategory>> {
  const { user, useCases } = await getAppContext();
  const parsed = categoryNameCiphertextSchema.safeParse(nameCiphertext);
  if (!parsed.success) return failure(new Error("Invalid category"));
  return attempt(() => useCases.createCategoryRecord(user.id, parsed.data));
}

export async function renameCategoryAction(
  id: unknown,
  nameCiphertext: unknown,
): Promise<ActionResult<EncryptedCategory>> {
  const { user, useCases } = await getAppContext();
  const parsedId = idSchema.safeParse(id);
  const parsed = categoryNameCiphertextSchema.safeParse(nameCiphertext);
  if (!parsedId.success || !parsed.success) {
    return failure(new Error("Invalid category rename"));
  }
  return attempt(() =>
    useCases.renameCategoryRecord(user.id, parsedId.data, parsed.data),
  );
}

export async function deleteCategoryAction(
  id: unknown,
): Promise<ActionResult<null>> {
  const { user, useCases } = await getAppContext();
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return failure(new Error("Invalid category id"));
  return attempt(async () => {
    await useCases.deleteCategoryRecord(user.id, parsedId.data);
    return null;
  });
}
