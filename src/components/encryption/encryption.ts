import {
  createUserKeysAction,
  replaceUserKeysAction,
  type KeyActionResult,
} from "@/app/(app)/encryption/actions";
import { UnlockFailedError } from "@/application/encryption/errors";
import type { KeyServer } from "@/application/encryption/ports";
import { ValidationError } from "@/domain/shared/errors";
import { createEncryptionUseCases } from "@/infrastructure/browser";

// The server refused to store a wrapped key; the message is safe to show.
export class KeyServerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "KeyServerError";
  }
}

function stored(result: KeyActionResult): void {
  if (!result.ok) throw new KeyServerError(result.error);
}

// Only wrapped keys go to the server; passphrases and recovery codes stay in this browser.
const keyServer: KeyServer = {
  create: async (keys) => stored(await createUserKeysAction(keys)),
  replace: async (keys) => stored(await replaceUserKeysAction(keys)),
};

export const encryption = createEncryptionUseCases(keyServer);

export function errorMessage(error: unknown): string {
  if (
    error instanceof ValidationError ||
    error instanceof UnlockFailedError ||
    error instanceof KeyServerError
  ) {
    return error.message;
  }
  console.error(error instanceof Error ? error.name : "Encryption step failed");
  return "Something went wrong. Please try again.";
}
