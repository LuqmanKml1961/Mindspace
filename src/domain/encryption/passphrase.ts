import { ValidationError } from "@/domain/shared/errors";
import { characterCount } from "@/domain/shared/text";

// D-021: at least 12 characters (your choice); the upper bound only stops absurd input.
export const PASSPHRASE_MIN = 12;
export const PASSPHRASE_MAX = 1024;

// Not trimmed: spaces can be part of a passphrase. Counted after NFC, as it is used.
export function toPassphrase(input: string): string {
  const count = characterCount(input.normalize("NFC"));
  if (input.trim().length === 0 || count < PASSPHRASE_MIN) {
    throw new ValidationError(
      `Use at least ${PASSPHRASE_MIN} characters. A few words works well.`,
    );
  }
  if (count > PASSPHRASE_MAX) {
    throw new ValidationError(`Use at most ${PASSPHRASE_MAX} characters.`);
  }
  return input;
}
