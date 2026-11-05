import { z } from "zod";
import {
  CIPHERTEXT_PATTERN,
  ciphertextMaxLength,
} from "@/application/encryption/ciphertext";
import { idSchema } from "@/application/thoughts/schemas";
import {
  TASK_NOTES_MAX,
  TASK_PRIORITIES,
  TASK_TITLE_MAX,
} from "@/domain/tasks/task";

// Server Action input. Mirrors the database checks (P4.3): only well-formed ciphertext within the
// size for each field's character limit. The date and time are checked by the domain in the
// record use cases. Unknown keys, such as a user id or a completion time, are dropped.

const ciphertext = (characters: number) =>
  z.string().max(ciphertextMaxLength(characters)).regex(CIPHERTEXT_PATTERN);

export const taskInputSchema = z.object({
  titleCiphertext: ciphertext(TASK_TITLE_MAX),
  notesCiphertext: ciphertext(TASK_NOTES_MAX).nullable(),
  dueDate: z.string().nullable(),
  dueTime: z.string().nullable(),
  priority: z.enum(TASK_PRIORITIES),
  sourceThoughtId: idSchema.nullable(),
});

// The date and time are always sent together, so the time-needs-a-date rule can be checked.
export const taskEditsSchema = taskInputSchema
  .omit({ sourceThoughtId: true })
  .partial()
  .refine(
    (edits) => (edits.dueDate === undefined) === (edits.dueTime === undefined),
    { error: "Send the due date and time together." },
  );

export const reminderInputSchema = z.object({
  taskId: idSchema,
  remindAt: z.date(),
});
