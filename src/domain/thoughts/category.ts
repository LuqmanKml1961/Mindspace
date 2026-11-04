import { ValidationError } from "@/domain/shared/errors";
import { characterCount } from "@/domain/shared/text";

// Matches the database check (DATA_MODEL.md, categories).
export const CATEGORY_NAME_MAX = 50;

export type Category = {
  id: string;
  userId: string;
  name: string;
  createdAt: Date;
};

export type NewCategory = Pick<Category, "userId" | "name">;

// Trimmed; 1–50 characters. Names are unique per user, ignoring case (enforced by the database).
export function toCategoryName(input: string): string {
  const name = input.trim();
  if (name.length === 0) throw new ValidationError("Give the category a name.");
  if (characterCount(name) > CATEGORY_NAME_MAX) {
    throw new ValidationError(
      `Category names can be up to ${CATEGORY_NAME_MAX} characters.`,
    );
  }
  return name;
}

export function createCategory(props: {
  userId: string;
  name: string;
}): NewCategory {
  return { userId: props.userId, name: toCategoryName(props.name) };
}
