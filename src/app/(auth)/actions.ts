"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { z } from "zod";
import type { AuthFailure, AuthResult } from "@/application/auth/auth-service";
import {
  emailCodeSchema,
  emailSchema,
  newPasswordSchema,
  resetRequestSchema,
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
  awaitingCode?: boolean;
};

const failureMessages: Record<AuthFailure, string> = {
  invalid_input: "Please check your details and try again.",
  weak_password: "Use a password with at least 8 characters.",
  same_password: "Choose a password that’s different from your current one.",
  email_taken: "This email already has an account. Sign in instead.",
  invalid_credentials: "That email and password don’t match. Please try again.",
  email_not_confirmed: "Please confirm your email first.",
  invalid_code: "That code didn’t work. Check it, or send a new one.",
  rate_limited: "Please wait a moment, then try again.",
  session_missing: "Your session has ended. Please sign in again.",
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

// The email on the code step is a hidden field, so its errors show as a general message.
function codeStepErrors(error: z.ZodError): AuthFormState {
  const fieldErrors = fieldErrorsOf(error);
  return fieldErrors?.email
    ? { error: failureMessages.invalid_input }
    : { fieldErrors };
}

async function resendCode(
  email: string,
  send: (email: string) => Promise<AuthResult>,
  notice: string,
): Promise<AuthFormState> {
  const parsed = emailSchema.safeParse(email);
  if (!parsed.success) return { error: failureMessages.invalid_input };

  const result = await send(parsed.data);
  return result.ok ? { notice } : { error: failureMessages[result.reason] };
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

  return { email: parsed.data.email, awaitingCode: true };
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
      awaitingCode: true,
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
  const auth = await getAuthService();
  if (formData.get("intent") === "resend") {
    return resendCode(
      text(formData, "email"),
      (email) => auth.resendConfirmation(email),
      "We sent a new code. It can take a minute to arrive.",
    );
  }

  const parsed = emailCodeSchema.safeParse({
    email: text(formData, "email"),
    code: text(formData, "code"),
  });
  if (!parsed.success) return codeStepErrors(parsed.error);

  const result = await auth.confirmSignUp(parsed.data.email, parsed.data.code);
  if (result.ok) redirect("/home");

  return { error: failureMessages[result.reason] };
}

export async function sendResetCodeAction(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = text(formData, "email");
  const parsed = resetRequestSchema.safeParse({ email });
  if (!parsed.success)
    return { email, fieldErrors: fieldErrorsOf(parsed.error) };

  const result = await (
    await getAuthService()
  ).sendPasswordResetCode(parsed.data.email);
  if (!result.ok) return { email, error: failureMessages[result.reason] };

  return { email: parsed.data.email, awaitingCode: true };
}

export async function verifyResetCodeAction(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const auth = await getAuthService();
  if (formData.get("intent") === "resend") {
    return resendCode(
      text(formData, "email"),
      (email) => auth.sendPasswordResetCode(email),
      "If an account exists for that email, a new code is on its way.",
    );
  }

  const parsed = emailCodeSchema.safeParse({
    email: text(formData, "email"),
    code: text(formData, "code"),
  });
  if (!parsed.success) return codeStepErrors(parsed.error);

  const result = await auth.verifyPasswordResetCode(
    parsed.data.email,
    parsed.data.code,
  );
  if (result.ok) redirect("/reset-password");

  return { error: failureMessages[result.reason] };
}

export async function updatePasswordAction(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = newPasswordSchema.safeParse({
    password: text(formData, "password"),
  });
  if (!parsed.success) return { fieldErrors: fieldErrorsOf(parsed.error) };

  const result = await (
    await getAuthService()
  ).updatePassword(parsed.data.password);
  if (result.ok) redirect("/home");
  if (result.reason === "session_missing") redirect("/sign-in");

  return { error: failureMessages[result.reason] };
}

export async function signInWithGoogleAction() {
  // Server Actions always carry Origin (Next.js checks it against Host).
  const origin = (await headers()).get("origin");
  const result = origin
    ? await (
        await getAuthService()
      ).startGoogleSignIn(`${origin}/auth/callback`)
    : null;
  redirect(result?.ok ? result.url : "/sign-in?error=google");
}

export async function signOutAction() {
  await (await getAuthService()).signOut();
  redirect("/sign-in");
}
