import type {
  NewThought,
  Thought,
  ThoughtChanges,
  ThoughtStatus,
} from "@/domain/thoughts/thought";

export type ThoughtFilter = {
  status?: ThoughtStatus;
  // null lists thoughts without a category.
  categoryId?: string | null;
  // Case-insensitive match on title and content.
  query?: string;
};

// Every method is scoped to userId, on top of RLS.
export interface ThoughtRepository {
  create(thought: NewThought): Promise<Thought>;
  findById(userId: string, id: string): Promise<Thought | null>;
  // Newest first.
  list(userId: string, filter?: ThoughtFilter): Promise<Thought[]>;
  // Throws NotFoundError if there is no such thought for this user.
  update(userId: string, id: string, changes: ThoughtChanges): Promise<Thought>;
  // Throws NotFoundError if there is no such thought for this user.
  delete(userId: string, id: string): Promise<void>;
}
