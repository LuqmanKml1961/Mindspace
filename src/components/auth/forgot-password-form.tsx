"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { sendResetCodeAction } from "@/app/(auth)/actions";
import { EmailCodeForm } from "@/components/auth/email-code-form";
import {
  FormField,
  FormMessages,
  SubmitButton,
} from "@/components/forms/form-parts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";

export function ForgotPasswordForm() {
  // A new key remounts the steps, which clears the previous action state.
  const [attempt, setAttempt] = useState(0);
  return (
    <ForgotPasswordSteps
      key={attempt}
      onRestart={() => setAttempt((n) => n + 1)}
    />
  );
}

function ForgotPasswordSteps({ onRestart }: { onRestart: () => void }) {
  const [state, formAction, pending] = useActionState(sendResetCodeAction, {});

  if (state.awaitingCode && state.email) {
    return (
      <EmailCodeForm
        purpose="reset"
        email={state.email}
        backLabel="Use a different email"
        onBack={onRestart}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h1>Reset your password</h1>
        </CardTitle>
        <CardDescription>
          Enter your email and we’ll send you a code to choose a new password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction}>
          <FieldGroup>
            <FormMessages error={state.error} />
            <FormField
              id="email"
              label="Email"
              type="email"
              autoComplete="email"
              required
              defaultValue={state.email}
              error={state.fieldErrors?.email}
            />
            <SubmitButton pending={pending}>Send code</SubmitButton>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Remembered it?{" "}
          <Link
            href="/sign-in"
            className="font-medium text-foreground underline underline-offset-4"
          >
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
