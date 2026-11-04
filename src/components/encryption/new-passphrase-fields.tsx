import { toPassphrase } from "@/domain/encryption/passphrase";
import { ValidationError } from "@/domain/shared/errors";
import { FormField } from "@/components/forms/form-parts";

export type NewPassphraseErrors = { passphrase?: string; confirm?: string };

// Checks the passphrase rule first, then that both entries match.
export function readNewPassphrase(
  formData: FormData,
): { passphrase: string } | { errors: NewPassphraseErrors } {
  const passphrase = String(formData.get("new-passphrase") ?? "");
  const confirm = String(formData.get("new-passphrase-confirm") ?? "");
  try {
    toPassphrase(passphrase);
  } catch (error) {
    if (error instanceof ValidationError) {
      return { errors: { passphrase: error.message } };
    }
    throw error;
  }
  if (passphrase.normalize("NFC") !== confirm.normalize("NFC")) {
    return { errors: { confirm: "The two passphrases don’t match." } };
  }
  return { passphrase };
}

export function NewPassphraseFields({
  label,
  errors,
}: {
  label: string;
  errors?: NewPassphraseErrors;
}) {
  return (
    <>
      <FormField
        id="new-passphrase"
        label={label}
        type="password"
        autoComplete="new-password"
        required
        description="At least 12 characters. A few words works well."
        error={errors?.passphrase}
      />
      <FormField
        id="new-passphrase-confirm"
        label="Type it again"
        type="password"
        autoComplete="new-password"
        required
        error={errors?.confirm}
      />
    </>
  );
}
