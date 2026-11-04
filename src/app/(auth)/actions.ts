"use server";

import { redirect } from "next/navigation";
import type { z } from "zod";
import type { AuthFailure } from "@/application/auth/auth-service";
import {
  confirmationSchema,
  emailSchema,
  signInSchema,
  signUpSchema,
} from "@/application/auth/schemas";
import { getAuthService } from "@/infrastructure/container";

type FieldName = "email" | "password" | "code";

export type AuthFormState = {
  email?: string;
  error?: string;
  notice?: string;
  fieldErrors?: Partial<Record<FieldName, string>>;
  needsConfirmation?: boolean;
};

const failureMessages: Record<AuthFailure, string> = {
  invalid_input: "Please check your details and try again.",
  weak_password: "Use a password with at least 8 characters.",
  email_taken: "This email already has an account. Sign in instead.",
  invalid_credentials: "That email and password don’t match. Please try again.",
  email_not_confirmed: "Please confirm your email first.",
  invalid_code: "That code didn’t work. Check it, or send a new one.",
  rate_limited: "Please wait a moment, then try again.",
  unavailable:
    "Something went wrong on our side. Please try again in a moment.",
};

function text(formData: FormData, name: FieldName): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function fieldErrorsOf(error: z.ZodError): AuthFormState["fieldErrors"] {
  const fieldErrors: AuthFormState["fieldErrors"] = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (
      (field === "email" || field === "password" || field === "code") &&
      !fieldErrors[field]
    ) {
      fieldErrors[field] = issue.message;
    }
  }
  return fieldErrors;
}

export async function signUpAction(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = text(formData, "email");
  const parsed = signUpSchema.safeParse({
    email,
    password: text(formData, "password"),
  });
  if (!parsed.success)
    return { email, fieldErrors: fieldErrorsOf(parsed.error) };

  const result = await (await getAuthService()).signUp(parsed.data);
  if (!result.ok) return { email, error: failureMessages[result.reason] };

  return { email: parsed.data.email, needsConfirmation: true };
}

export async function signInAction(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = text(formData, "email");
  const parsed = signInSchema.safeParse({
    email,
    password: text(formData, "password"),
  });
  if (!parsed.success)
    return { email, fieldErrors: fieldErrorsOf(parsed.error) };

  const result = await (await getAuthService()).signIn(parsed.data);
  if (result.ok) redirect("/home");

  if (result.reason === "email_not_confirmed") {
    return {
      email: parsed.data.email,
      needsConfirmation: true,
      notice:
        "Your email isn’t confirmed yet. Enter the code we sent you, or send a new one.",
    };
  }
  return { email, error: failureMessages[result.reason] };
}

// One action for both buttons on the code step, so the latest result is the one shown.
export async function confirmEmailAction(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  if (formData.get("intent") === "resend") {
    return resendConfirmation(text(formData, "email"));
  }

  const parsed = confirmationSchema.safeParse({
    email: text(formData, "email"),
    code: text(formData, "code"),
  });
  if (!parsed.success) {
    const fieldErrors = fieldErrorsOf(parsed.error);
    return fieldErrors?.email
      ? { error: failureMessages.invalid_input }
      : { fieldErrors };
  }

  const result = await (
    await getAuthService()
  ).confirmSignUp(parsed.data.email, parsed.data.code);
  if (result.ok) redirect("/home");

  return { error: failureMessages[result.reason] };
}

async function resendConfirmation(email: string): Promise<AuthFormState> {
  const parsed = emailSchema.safeParse(email);
  if (!parsed.success) return { error: failureMessages.invalid_input };

  const result = await (await getAuthService()).resendConfirmation(parsed.data);
  if (!result.ok) return { error: failureMessages[result.reason] };

  return { notice: "We sent a new code. It can take a minute to arrive." };
}

export async function signOutAction() {
  await (await getAuthService()).signOut();
  redirect("/sign-in");
}
