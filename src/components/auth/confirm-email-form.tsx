"use client";

import { useActionState, useState } from "react";
import { confirmEmailAction } from "@/app/(auth)/actions";
import { CONFIRMATION_CODE_LENGTH } from "@/application/auth/schemas";
import {
  FormField,
  FormMessages,
  SubmitButton,
} from "@/components/auth/form-parts";
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

type ConfirmEmailFormProps = {
  email: string;
  notice?: string;
  backLabel: string;
  onBack: () => void;
};

export function ConfirmEmailForm({
  email,
  notice,
  backLabel,
  onBack,
}: ConfirmEmailFormProps) {
  const [state, formAction, pending] = useActionState(confirmEmailAction, {});
  const [intent, setIntent] = useState<"confirm" | "resend">("confirm");

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h1>Check your email</h1>
        </CardTitle>
        <CardDescription>
          We sent a {CONFIRMATION_CODE_LENGTH}-digit code to{" "}
          <span className="font-medium text-foreground">{email}</span>. Enter it
          below to finish.
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
              maxLength={CONFIRMATION_CODE_LENGTH}
              required
              error={state.fieldErrors?.code}
            />
            <div className="flex flex-col gap-3">
              <SubmitButton
                name="intent"
                value="confirm"
                pending={pending}
                spinner={intent === "confirm"}
                onClick={() => setIntent("confirm")}
              >
                Confirm
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
