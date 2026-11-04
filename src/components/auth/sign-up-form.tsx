"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { signUpAction } from "@/app/(auth)/actions";
import { EmailCodeForm } from "@/components/auth/email-code-form";
import {
  FormField,
  FormMessages,
  SubmitButton,
} from "@/components/auth/form-parts";
import { GoogleSignIn } from "@/components/auth/google-sign-in";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldGroup, FieldSeparator } from "@/components/ui/field";

export function SignUpForm() {
  // A new key remounts the steps, which clears the previous action state.
  const [attempt, setAttempt] = useState(0);
  return (
    <SignUpSteps key={attempt} onRestart={() => setAttempt((n) => n + 1)} />
  );
}

function SignUpSteps({ onRestart }: { onRestart: () => void }) {
  const [state, formAction, pending] = useActionState(signUpAction, {});

  if (state.awaitingCode && state.email) {
    return (
      <EmailCodeForm
        purpose="confirm"
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
          <h1>Create your account</h1>
        </CardTitle>
        <CardDescription>
          A calm place for everything on your mind.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <GoogleSignIn />
        <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
          or
        </FieldSeparator>
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
              autoComplete="new-password"
              required
              minLength={8}
              maxLength={72}
              description="At least 8 characters."
              error={state.fieldErrors?.password}
            />
            <SubmitButton pending={pending}>Create account</SubmitButton>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
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
