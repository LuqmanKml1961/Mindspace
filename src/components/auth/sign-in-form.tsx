"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { signInAction } from "@/app/(auth)/actions";
import { EmailCodeForm } from "@/components/auth/email-code-form";
import {
  FormField,
  FormMessages,
  SubmitButton,
} from "@/components/auth/form-parts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";

export function SignInForm() {
  // A new key remounts the steps, which clears the previous action state.
  const [attempt, setAttempt] = useState(0);
  return (
    <SignInSteps key={attempt} onRestart={() => setAttempt((n) => n + 1)} />
  );
}

function SignInSteps({ onRestart }: { onRestart: () => void }) {
  const [state, formAction, pending] = useActionState(signInAction, {});

  if (state.awaitingCode && state.email) {
    return (
      <EmailCodeForm
        purpose="confirm"
        email={state.email}
        notice={state.notice}
        backLabel="Back to sign in"
        onBack={onRestart}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h1>Welcome back</h1>
        </CardTitle>
        <CardDescription>
          Sign in to pick up where you left off.
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
            <FormField
              id="password"
              label="Password"
              type="password"
              autoComplete="current-password"
              required
              error={state.fieldErrors?.password}
            />
            <SubmitButton pending={pending}>Sign in</SubmitButton>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Link
          href="/forgot-password"
          className="text-sm font-medium text-foreground underline underline-offset-4"
        >
          Forgot your password?
        </Link>
        <p className="text-sm text-muted-foreground">
          New here?{" "}
          <Link
            href="/sign-up"
            className="font-medium text-foreground underline underline-offset-4"
          >
            Create an account
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
