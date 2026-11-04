import { ValidationError } from "@/domain/shared/errors";
import { characterCount } from "@/domain/shared/text";

// Limits match the database checks (DATA_MODEL.md, thoughts).
export const THOUGHT_CONTENT_MAX = 10_000;
export const THOUGHT_TITLE_MAX = 200;

export const THOUGHT_STATUSES = ["inbox", "parked", "archived"] as const;
export type ThoughtStatus = (typeof THOUGHT_STATUSES)[number];

export type Thought = {
  id: string;
  userId: string;
  title: string | null;
  content: string;
  categoryId: string | null;
  status: ThoughtStatus;
  createdAt: Date;
  updatedAt: Date;
};

// A thought before it is saved: the database assigns id and timestamps.
export type NewThought = Pick<
  Thought,
  "userId" | "title" | "content" | "categoryId" | "status"
>;

export type ThoughtChanges = Partial<
  Pick<Thought, "title" | "content" | "categoryId" | "status">
>;

export function isThoughtStatus(value: unknown): value is ThoughtStatus {
  return THOUGHT_STATUSES.includes(value as ThoughtStatus);
}

// Trimmed; never empty. Stored trimmed, so the database check always holds.
export function toThoughtContent(input: string): string {
  const content = input.trim();
  if (content.length === 0) throw new ValidationError("Write something first.");
  if (characterCount(content) > THOUGHT_CONTENT_MAX) {
    throw new ValidationError(
      `Thoughts can be up to ${THOUGHT_CONTENT_MAX.toLocaleString("en")} characters. Try splitting this one.`,
    );
  }
  return content;
}

// Optional: a blank title is stored as no title.
export function toThoughtTitle(
  input: string | null | undefined,
): string | null {
  const title = input?.trim() ?? "";
  if (title.length === 0) return null;
  if (characterCount(title) > THOUGHT_TITLE_MAX) {
    throw new ValidationError(
      `Titles can be up to ${THOUGHT_TITLE_MAX} characters.`,
    );
  }
  return title;
}

export function createThought(props: {
  userId: string;
  content: string;
  title?: string | null;
  categoryId?: string | null;
  status?: ThoughtStatus;
}): NewThought {
  return {
    userId: props.userId,
    content: toThoughtContent(props.content),
    title: toThoughtTitle(props.title),
    categoryId: props.categoryId ?? null,
    status: props.status ?? "inbox",
  };
}

// Validates only the fields being changed.
export function toThoughtChanges(input: {
  content?: string;
  title?: string | null;
  categoryId?: string | null;
  status?: unknown;
}): ThoughtChanges {
  const changes: ThoughtChanges = {};
  if (input.content !== undefined)
    changes.content = toThoughtContent(input.content);
  if (input.title !== undefined) changes.title = toThoughtTitle(input.title);
  if (input.categoryId !== undefined) changes.categoryId = input.categoryId;
  if (input.status !== undefined) {
    if (!isThoughtStatus(input.status)) {
      throw new ValidationError("Choose inbox, parked or archived.");
    }
    changes.status = input.status;
  }
  return changes;
}
