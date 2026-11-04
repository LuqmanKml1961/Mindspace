import type { EncryptedCategory } from "@/domain/thoughts/category-repository";
import type {
  EncryptedThought,
  EncryptedThoughtChanges,
  NewEncryptedThought,
} from "@/domain/thoughts/thought-repository";

// What the browser sends: the server takes the user id from the session, never from here.
export type EncryptedThoughtInput = Omit<NewEncryptedThought, "userId">;

// The signed-in user's thoughts on the server, written from the browser (Server Actions).
export interface ThoughtServer {
  create(thought: EncryptedThoughtInput): Promise<EncryptedThought>;
  // Throws NotFoundError if the thought, or the category it moves to, doesn't exist.
  update(
    id: string,
    changes: EncryptedThoughtChanges,
  ): Promise<EncryptedThought>;
  // Throws NotFoundError if the thought doesn't exist.
  delete(id: string): Promise<void>;
}

// The signed-in user's categories on the server, written from the browser (Server Actions).
export interface CategoryServer {
  create(nameCiphertext: string): Promise<EncryptedCategory>;
  // Throws NotFoundError if the category doesn't exist.
  rename(id: string, nameCiphertext: string): Promise<EncryptedCategory>;
  // Throws NotFoundError if the category doesn't exist.
  delete(id: string): Promise<void>;
}
