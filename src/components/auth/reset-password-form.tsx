"use client";

import { useActionState } from "react";
import { updatePasswordAction } from "@/app/(auth)/actions";
import {
  FormField,
  FormMessages,
  SubmitButton,
} from "@/components/forms/form-parts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(updatePasswordAction, {});

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h1>Choose a new password</h1>
        </CardTitle>
        <CardDescription>
          You’re signed in. Pick a new password to use next time.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction}>
          <FieldGroup>
            <FormMessages error={state.error} />
            <FormField
              id="password"
              label="New password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              maxLength={72}
              description="At least 8 characters."
              error={state.fieldErrors?.password}
            />
            <SubmitButton pending={pending}>Save password</SubmitButton>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
