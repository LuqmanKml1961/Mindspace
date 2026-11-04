import { z } from "zod";
import {
  CIPHERTEXT_PATTERN,
  ciphertextMaxLength,
} from "@/application/encryption/ciphertext";
import { CATEGORY_NAME_MAX } from "@/domain/thoughts/category";
import {
  THOUGHT_CONTENT_MAX,
  THOUGHT_STATUSES,
  THOUGHT_TITLE_MAX,
} from "@/domain/thoughts/thought";

// Server Action input. Mirrors the database checks (P3.5): only well-formed ciphertext within the
// size for each field's character limit. Unknown keys, such as a user id, are dropped.

const ciphertext = (characters: number) =>
  z.string().max(ciphertextMaxLength(characters)).regex(CIPHERTEXT_PATTERN);

export const idSchema = z.uuid();

export const thoughtInputSchema = z.object({
  titleCiphertext: ciphertext(THOUGHT_TITLE_MAX).nullable(),
  contentCiphertext: ciphertext(THOUGHT_CONTENT_MAX),
  categoryId: idSchema.nullable(),
  status: z.enum(THOUGHT_STATUSES),
});

export const thoughtChangesSchema = thoughtInputSchema.partial();

export const categoryNameCiphertextSchema = ciphertext(CATEGORY_NAME_MAX);
