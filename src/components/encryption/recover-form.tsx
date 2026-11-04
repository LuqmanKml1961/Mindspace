"use client";

import { useActionState } from "react";
import { UnlockFailedError } from "@/application/encryption/errors";
import type { UserKeys } from "@/domain/encryption/user-keys";
import { encryption, errorMessage } from "@/components/encryption/encryption";
import {
  NewPassphraseFields,
  readNewPassphrase,
  type NewPassphraseErrors,
} from "@/components/encryption/new-passphrase-fields";
import {
  FormField,
  FormMessages,
  SubmitButton,
} from "@/components/forms/form-parts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";

type RecoverState = {
  // Kept so a typo can be fixed without typing all 32 characters again.
  code?: string;
  error?: string;
  codeError?: string;
  errors?: NewPassphraseErrors;
};

export function RecoverForm({
  userId,
  keys,
  onDone,
  onBack,
}: {
  userId: string;
  keys: UserKeys;
  onDone: (newRecoveryCode: string) => void;
  onBack: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    async (
      _previous: RecoverState,
      formData: FormData,
    ): Promise<RecoverState> => {
      const code = String(formData.get("recovery-code") ?? "");
      const read = readNewPassphrase(formData);
      if ("errors" in read) return { code, errors: read.errors };
      try {
        const { recoveryCode } = await encryption.recoverWithCode({
          userId,
          keys,
          recoveryCode: code,
          newPassphrase: read.passphrase,
        });
        onDone(recoveryCode);
        return {};
      } catch (error) {
        if (error instanceof UnlockFailedError) {
          return { code, codeError: error.message };
        }
        return { code, error: errorMessage(error) };
      }
    },
    {},
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h1>Use your recovery code</h1>
        </CardTitle>
        <CardDescription>
          Enter the recovery code you saved, then choose a new passphrase. Your
          thoughts stay just as they are, and you’ll get a new recovery code.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction}>
          <FieldGroup>
            <FormMessages error={state.error} />
            <FormField
              id="recovery-code"
              label="Recovery code"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              required
              className="font-mono"
              description="Capitals, spaces and dashes don’t matter."
              defaultValue={state.code}
              error={state.codeError}
            />
            <NewPassphraseFields label="New passphrase" errors={state.errors} />
            <div className="flex flex-wrap items-center gap-3">
              <SubmitButton pending={pending}>Set new passphrase</SubmitButton>
              <Button
                type="button"
                variant="ghost"
                disabled={pending}
                onClick={onBack}
              >
                Back
              </Button>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
