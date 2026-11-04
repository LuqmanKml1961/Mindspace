"use client";

import { useActionState } from "react";
import { UnlockFailedError } from "@/application/encryption/errors";
import type { UserKeys } from "@/domain/encryption/user-keys";
import { encryption, errorMessage } from "@/components/encryption/encryption";
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

type UnlockState = { error?: string; passphraseError?: string };

export function UnlockForm({
  userId,
  keys,
  onUnlocked,
  onForgot,
}: {
  userId: string;
  keys: UserKeys;
  onUnlocked: () => void;
  onForgot: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    async (
      _previous: UnlockState,
      formData: FormData,
    ): Promise<UnlockState> => {
      try {
        await encryption.unlockDevice({
          userId,
          keys,
          passphrase: String(formData.get("passphrase") ?? ""),
        });
        onUnlocked();
        return {};
      } catch (error) {
        if (error instanceof UnlockFailedError) {
          return { passphraseError: error.message };
        }
        return { error: errorMessage(error) };
      }
    },
    {},
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h1>Unlock Mindspace on this device</h1>
        </CardTitle>
        <CardDescription>
          Enter your passphrase. This device stays unlocked until you sign out.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction}>
          <FieldGroup>
            <FormMessages error={state.error} />
            <FormField
              id="passphrase"
              label="Passphrase"
              type="password"
              autoComplete="current-password"
              required
              error={state.passphraseError}
            />
            <div className="flex flex-wrap items-center gap-3">
              <SubmitButton pending={pending}>Unlock</SubmitButton>
              <Button
                type="button"
                variant="link"
                disabled={pending}
                onClick={onForgot}
              >
                Forgot your passphrase?
              </Button>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
