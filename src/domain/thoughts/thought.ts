import { ValidationError } from "@/domain/shared/errors";
import { characterCount } from "@/domain/shared/text";

// Enforced here, on the device; the database checks the ciphertext sizes derived from them
// (DATA_MODEL.md, thoughts).
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

// Trimmed; never empty. Trimmed before encryption, since the server can't check the text.
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

const searchable = (text: string) => text.normalize("NFC").toLowerCase();

// Search runs on the device (D-021): a case-insensitive match in the title or the text. An empty
// query matches everything.
export function thoughtMatches(
  thought: Pick<Thought, "title" | "content">,
  query: string,
): boolean {
  const needle = searchable(query.trim());
  if (!needle) return true;
  return [thought.title ?? "", thought.content].some((text) =>
    searchable(text).includes(needle),
  );
}
