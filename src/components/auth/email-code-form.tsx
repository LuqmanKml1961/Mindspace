"use client";

import { useActionState, useState, type ReactNode } from "react";
import {
  confirmEmailAction,
  verifyResetCodeAction,
} from "@/app/(auth)/actions";
import { EMAIL_CODE_LENGTH } from "@/application/auth/schemas";
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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";

const purposes = {
  confirm: {
    action: confirmEmailAction,
    submitLabel: "Confirm",
    description: (email: ReactNode) => (
      <>
        We sent a {EMAIL_CODE_LENGTH}-digit code to {email}. Enter it below to
        finish.
      </>
    ),
  },
  // Worded so it never reveals whether the email has an account.
  reset: {
    action: verifyResetCodeAction,
    submitLabel: "Continue",
    description: (email: ReactNode) => (
      <>
        If an account exists for {email}, we sent it a {EMAIL_CODE_LENGTH}-digit
        code. Enter it below to continue.
      </>
    ),
  },
};

type EmailCodeFormProps = {
  purpose: keyof typeof purposes;
  email: string;
  notice?: string;
  backLabel: string;
  onBack: () => void;
};

export function EmailCodeForm({
  purpose,
  email,
  notice,
  backLabel,
  onBack,
}: EmailCodeFormProps) {
  const { action, submitLabel, description } = purposes[purpose];
  const [state, formAction, pending] = useActionState(action, {});
  const [intent, setIntent] = useState<"submit" | "resend">("submit");

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h1>Check your email</h1>
        </CardTitle>
        <CardDescription>
          {description(
            <span className="font-medium text-foreground">{email}</span>,
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction}>
          <input type="hidden" name="email" value={email} />
          <FieldGroup>
            <FormMessages error={state.error} notice={state.notice ?? notice} />
            <FormField
              id="code"
              label="Code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={EMAIL_CODE_LENGTH}
              required
              error={state.fieldErrors?.code}
            />
            <div className="flex flex-col gap-3">
              <SubmitButton
                name="intent"
                value="submit"
                pending={pending}
                spinner={intent === "submit"}
                onClick={() => setIntent("submit")}
              >
                {submitLabel}
              </SubmitButton>
              <SubmitButton
                name="intent"
                value="resend"
                variant="ghost"
                formNoValidate
                pending={pending}
                spinner={intent === "resend"}
                onClick={() => setIntent("resend")}
              >
                Send a new code
              </SubmitButton>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <Button type="button" variant="link" onClick={onBack}>
          {backLabel}
        </Button>
      </CardFooter>
    </Card>
  );
}
