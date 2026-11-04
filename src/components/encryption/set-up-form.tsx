"use client";

import { useRouter } from "next/navigation";
import { useActionState } from "react";
import {
  encryption,
  errorMessage,
  KeyServerError,
} from "@/components/encryption/encryption";
import {
  NewPassphraseFields,
  readNewPassphrase,
  type NewPassphraseErrors,
} from "@/components/encryption/new-passphrase-fields";
import { FormMessages, SubmitButton } from "@/components/forms/form-parts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";

type SetUpState = { error?: string; errors?: NewPassphraseErrors };

export function SetUpForm({
  userId,
  onDone,
}: {
  userId: string;
  onDone: (recoveryCode: string) => void;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    async (_previous: SetUpState, formData: FormData): Promise<SetUpState> => {
      const read = readNewPassphrase(formData);
      if ("errors" in read) return { errors: read.errors };
      try {
        const { recoveryCode } = await encryption.setUpEncryption({
          userId,
          passphrase: read.passphrase,
        });
        onDone(recoveryCode);
        return {};
      } catch (error) {
        // Reloads the saved keys: if another tab already set up encryption, this shows unlock.
        if (error instanceof KeyServerError) router.refresh();
        return { error: errorMessage(error) };
      }
    },
    {},
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h1>Keep your thoughts private</h1>
        </CardTitle>
        <CardDescription>
          Choose a passphrase. What you write is encrypted on your device before
          it’s saved, so only you can read it, not even the people who run
          Mindspace.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction}>
          <FieldGroup>
            <FormMessages error={state.error} />
            <NewPassphraseFields label="Passphrase" errors={state.errors} />
            <div>
              <SubmitButton pending={pending}>Set passphrase</SubmitButton>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
