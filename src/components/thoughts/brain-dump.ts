import {
  createCategoryAction,
  createThoughtAction,
  deleteCategoryAction,
  deleteThoughtAction,
  renameCategoryAction,
  updateThoughtAction,
} from "@/app/(app)/thoughts/actions";
import type {
  CategoryServer,
  ThoughtServer,
} from "@/application/thoughts/ports";
import { createBrainDumpUseCases } from "@/infrastructure/browser";
import { unwrap } from "@/lib/action-errors";

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
