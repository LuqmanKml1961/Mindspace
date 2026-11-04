import {
  createCategoryAction,
  createThoughtAction,
  deleteCategoryAction,
  deleteThoughtAction,
  renameCategoryAction,
  updateThoughtAction,
  type ActionResult,
} from "@/app/(app)/thoughts/actions";
import {
  DecryptFailedError,
  DeviceLockedError,
} from "@/application/encryption/errors";
import type {
  CategoryServer,
  ThoughtServer,
} from "@/application/thoughts/ports";
import { ConflictError, ValidationError } from "@/domain/shared/errors";
import { createBrainDumpUseCases } from "@/infrastructure/browser";

// The server refused or failed to save; the message is safe to show.
export class ServerActionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ServerActionError";
  }
}

function unwrap<T>(result: ActionResult<T>): T {
  if (!result.ok) throw new ServerActionError(result.error);
  return result.data;
}

// Only ciphertext goes to the server (D-021); the use cases encrypt before calling these.
const thoughts: ThoughtServer = {
  create: async (thought) => unwrap(await createThoughtAction(thought)),
  update: async (id, changes) => unwrap(await updateThoughtAction(id, changes)),
  delete: async (id) => {
    unwrap(await deleteThoughtAction(id));
  },
};

const categories: CategoryServer = {
  create: async (nameCiphertext) =>
    unwrap(await createCategoryAction(nameCiphertext)),
  rename: async (id, nameCiphertext) =>
    unwrap(await renameCategoryAction(id, nameCiphertext)),
  delete: async (id) => {
    unwrap(await deleteCategoryAction(id));
  },
};

export const brainDump = createBrainDumpUseCases({ thoughts, categories });

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
  console.error(error instanceof Error ? error.name : "Brain Dump step failed");
  return "Something went wrong. Please try again.";
}
