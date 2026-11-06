import { z } from "zod";
import {
  CIPHERTEXT_PATTERN,
  ciphertextMaxLength,
} from "@/application/encryption/ciphertext";
import { idSchema } from "@/application/thoughts/schemas";
import {
  CHECK_IN_ANSWER_MAX,
  CHECK_IN_PRIORITY_MAX,
} from "@/domain/check-ins/daily-check-in";

// Server Action input. Mirrors the database checks (P5.2): only well-formed ciphertext within the
// size for each field's character limit, or null for a skipped answer. Unknown keys, such as a
// user id or a date, are dropped.

const ciphertext = (characters: number) =>
  z.string().max(ciphertextMaxLength(characters)).regex(CIPHERTEXT_PATTERN);

const answer = ciphertext(CHECK_IN_ANSWER_MAX).nullable();

// The priority's task and text are always sent together, and at most one is set.
export const checkInEditsSchema = z
  .object({
    occupyingMindCiphertext: answer,
    worriesCiphertext: answer,
    canControlCiphertext: answer,
    canWaitCiphertext: answer,
    smallHelpfulThingCiphertext: answer,
    priorityTaskId: idSchema.nullable(),
    priorityTextCiphertext: ciphertext(CHECK_IN_PRIORITY_MAX).nullable(),
  })
  .partial()
  .refine(
    (edits) =>
      (edits.priorityTaskId === undefined) ===
      (edits.priorityTextCiphertext === undefined),
    { error: "Send the priority's task and text together." },
  )
  .refine((edits) => !(edits.priorityTaskId && edits.priorityTextCiphertext), {
    error: "Choose a task or write your priority, not both.",
  });
