import type { Category, NewCategory } from "@/domain/thoughts/category";

// Every method is scoped to userId, on top of RLS.
export interface CategoryRepository {
  // Throws ConflictError if the user already has a category with that name (any case).
  create(category: NewCategory): Promise<Category>;
  // Sorted by name.
  list(userId: string): Promise<Category[]>;
  // Throws NotFoundError if missing, or ConflictError if the new name is taken.
  rename(userId: string, id: string, name: string): Promise<Category>;
  // Thoughts in it keep existing, without a category. Throws NotFoundError if missing.
  delete(userId: string, id: string): Promise<void>;
}
