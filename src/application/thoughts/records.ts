import type { EncryptedThoughtInput } from "@/application/thoughts/ports";
import type { CategoryRepository } from "@/domain/thoughts/category-repository";
import type {
  EncryptedThoughtChanges,
  ThoughtFilter,
  ThoughtRepository,
} from "@/domain/thoughts/thought-repository";

// Server side (D-021): stores and returns ciphertext only. The text was checked and encrypted
// on the device; the user id always comes from the session. Reads serve Server Components,
// writes serve Server Actions.

export function makeListThoughtRecords(deps: { thoughts: ThoughtRepository }) {
  return (userId: string, filter?: ThoughtFilter) =>
    deps.thoughts.list(userId, filter);
}

// Home's "Your mind, right now": the newest few waiting in the inbox, and how many wait.
export function makeGetInboxPreview(deps: { thoughts: ThoughtRepository }) {
  return (userId: string, limit: number) =>
    deps.thoughts.listNewest(userId, { status: "inbox" }, limit);
}

export function makeGetThoughtRecord(deps: { thoughts: ThoughtRepository }) {
  return (userId: string, id: string) => deps.thoughts.findById(userId, id);
}

export function makeCreateThoughtRecord(deps: { thoughts: ThoughtRepository }) {
  return (userId: string, thought: EncryptedThoughtInput) =>
    deps.thoughts.create({ ...thought, userId });
}

export function makeUpdateThoughtRecord(deps: { thoughts: ThoughtRepository }) {
  return (userId: string, id: string, changes: EncryptedThoughtChanges) =>
    deps.thoughts.update(userId, id, changes);
}

export function makeDeleteThoughtRecord(deps: { thoughts: ThoughtRepository }) {
  return (userId: string, id: string) => deps.thoughts.delete(userId, id);
}

export function makeListCategoryRecords(deps: {
  categories: CategoryRepository;
}) {
  return (userId: string) => deps.categories.list(userId);
}

export function makeCreateCategoryRecord(deps: {
  categories: CategoryRepository;
}) {
  return (userId: string, nameCiphertext: string) =>
    deps.categories.create({ userId, nameCiphertext });
}

export function makeRenameCategoryRecord(deps: {
  categories: CategoryRepository;
}) {
  return (userId: string, id: string, nameCiphertext: string) =>
    deps.categories.rename(userId, id, nameCiphertext);
}

export function makeDeleteCategoryRecord(deps: {
  categories: CategoryRepository;
}) {
  return (userId: string, id: string) => deps.categories.delete(userId, id);
}
