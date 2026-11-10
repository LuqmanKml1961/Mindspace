import { unstable_isUnrecognizedActionError } from "next/navigation";
import {
  DecryptFailedError,
  DeviceLockedError,
} from "@/application/encryption/errors";
import { ConflictError, ValidationError } from "@/domain/shared/errors";
import type { ActionResult } from "@/lib/action-result";

// The server refused or failed to save; the message is safe to show.
export class ServerActionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ServerActionError";
  }
}

export function unwrap<T>(result: ActionResult<T>): T {
  if (!result.ok) throw new ServerActionError(result.error);
  return result.data;
}

// In the browser: a message for a failed step, safe to show.
export function errorMessage(error: unknown): string {
  if (
    error instanceof ValidationError ||
    error instanceof ConflictError ||
    error instanceof DeviceLockedError ||
    error instanceof DecryptFailedError ||
    error instanceof ServerActionError
  ) {
    return error.message;
  }
  // The page is older than the latest deploy, so its Server Actions no longer exist (P6.2).
  if (unstable_isUnrecognizedActionError(error)) {
    return "Mindspace has just been updated. Copy your text, refresh the page, then save it again.";
  }
  // A Server Action without a connection fails like this; the text stays where it was.
  if (!navigator.onLine) {
    return "You’re offline. Your text is still here, so try again once you’re connected.";
  }
  console.error(error instanceof Error ? error.name : "A step failed");
  return "Something went wrong. Please try again.";
}
