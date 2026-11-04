import type { ThoughtStatus } from "@/domain/thoughts/thought";

// A thought as the server stores it (D-021): the title and content are ciphertext, encrypted on
// the device after the domain rules ran there. The other fields stay readable.
export type EncryptedThought = {
  id: string;
  userId: string;
  titleCiphertext: string | null;
  contentCiphertext: string;
  categoryId: string | null;
  status: ThoughtStatus;
  createdAt: Date;
  updatedAt: Date;
};

// The database assigns id and timestamps.
export type NewEncryptedThought = Pick<
  EncryptedThought,
  "userId" | "titleCiphertext" | "contentCiphertext" | "categoryId" | "status"
>;

export type EncryptedThoughtChanges = Partial<
  Pick<
    EncryptedThought,
    "titleCiphertext" | "contentCiphertext" | "categoryId" | "status"
  >
>;

// No text search: the server holds only ciphertext, so search runs on the device.
export type ThoughtFilter = {
  status?: ThoughtStatus;
  // null lists thoughts without a category.
  categoryId?: string | null;
};

// Every method is scoped to userId, on top of RLS.
export interface ThoughtRepository {
  // Throws NotFoundError if the category doesn't exist (any more) for this user.
  create(thought: NewEncryptedThought): Promise<EncryptedThought>;
  findById(userId: string, id: string): Promise<EncryptedThought | null>;
  // Newest first.
  list(userId: string, filter?: ThoughtFilter): Promise<EncryptedThought[]>;
  // Throws NotFoundError if the thought, or the category it moves to, doesn't exist.
  update(
    userId: string,
    id: string,
    changes: EncryptedThoughtChanges,
  ): Promise<EncryptedThought>;
  // Throws NotFoundError if there is no such thought for this user.
  delete(userId: string, id: string): Promise<void>;
}
