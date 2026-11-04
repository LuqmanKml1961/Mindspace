"use server";

import {
  userKeysSchema,
  wrappedKeySchema,
} from "@/application/encryption/schemas";
import { ConflictError, NotFoundError } from "@/domain/shared/errors";
import { getAppContext } from "@/infrastructure/container";

// The browser sends only wrapped keys (D-021); this checks the user and the format, then stores.

export type KeyActionResult = { ok: true } | { ok: false; error: string };

const unavailable =
  "Something went wrong on our side. Please try again in a moment.";

function failure(error: unknown): KeyActionResult {
  if (error instanceof ConflictError || error instanceof NotFoundError) {
    return { ok: false, error: error.message };
  }
  console.error(error instanceof Error ? error.message : "Key action failed");
  return { ok: false, error: unavailable };
}

export async function createUserKeysAction(
  keys: unknown,
): Promise<KeyActionResult> {
  const { user, useCases } = await getAppContext();
  const parsed = userKeysSchema.safeParse(keys);
  if (!parsed.success) return failure(new Error("Invalid wrapped keys"));

  try {
    await useCases.createUserKeys(user.id, parsed.data);
    return { ok: true };
  } catch (error) {
    return failure(error);
  }
}

export async function replacePassphraseKeyAction(
  wrapped: unknown,
): Promise<KeyActionResult> {
  const { user, useCases } = await getAppContext();
  const parsed = wrappedKeySchema.safeParse(wrapped);
  if (!parsed.success) return failure(new Error("Invalid wrapped key"));

  try {
    await useCases.replacePassphraseKey(user.id, parsed.data);
    return { ok: true };
  } catch (error) {
    return failure(error);
  }
}
