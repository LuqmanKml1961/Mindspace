import "server-only";
import {
  isAuthApiError,
  isAuthSessionMissingError,
  type AuthError,
  type SupabaseClient,
} from "@supabase/supabase-js";
import type {
  AuthFailed,
  AuthFailure,
  AuthResult,
  AuthService,
} from "@/application/auth/auth-service";
import type { Database } from "@/infrastructure/supabase/database.types";

// Codes observed from the local Auth server on 2026-11-04 (see DEVLOG).
const failureByCode: Record<string, AuthFailure> = {
  validation_failed: "invalid_input",
  email_address_invalid: "invalid_input",
  weak_password: "weak_password",
  same_password: "same_password",
  user_already_exists: "email_taken",
  email_exists: "email_taken",
  invalid_credentials: "invalid_credentials",
  email_not_confirmed: "email_not_confirmed",
  otp_expired: "invalid_code",
  over_email_send_rate_limit: "rate_limited",
  over_request_rate_limit: "rate_limited",
};

// Status and code only: never log the email address or other user input.
function logFailure(action: string, error: AuthError) {
  console.error(`Auth ${action} failed`, {
    status: error.status,
    code: error.code,
  });
}

function toFailure(action: string, error: AuthError): AuthFailed {
  if (isAuthSessionMissingError(error)) {
    return { ok: false, reason: "session_missing" };
  }

  const reason =
    isAuthApiError(error) && error.code ? failureByCode[error.code] : undefined;
  if (reason) return { ok: false, reason };

  logFailure(action, error);
  return { ok: false, reason: "unavailable" };
}

function toResult(action: string, error: AuthError | null): AuthResult {
  return error ? toFailure(action, error) : { ok: true };
}

export function createSupabaseAuthService(
  supabase: SupabaseClient<Database>,
): AuthService {
  return {
    async signUp({ email, password }) {
      const { error } = await supabase.auth.signUp({ email, password });
      return toResult("sign-up", error);
    },
    async confirmSignUp(email, code) {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: "email",
      });
      return toResult("confirm", error);
    },
    async resendConfirmation(email) {
      const { error } = await supabase.auth.resend({ type: "signup", email });
      return toResult("resend", error);
    },
    async signIn({ email, password }) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return toResult("sign-in", error);
    },
    async signOut() {
      // Local scope: signing out here keeps the user's other devices signed in.
      const { error } = await supabase.auth.signOut({ scope: "local" });
      if (error) logFailure("sign-out", error);
    },
    async sendPasswordResetCode(email) {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      return toResult("reset request", error);
    },
    async verifyPasswordResetCode(email, code) {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: "recovery",
      });
      return toResult("reset verify", error);
    },
    async updatePassword(password) {
      const { error } = await supabase.auth.updateUser({ password });
      return toResult("password update", error);
    },
    async startGoogleSignIn(callbackUrl) {
      // On the server this only builds the URL and stores the PKCE verifier cookie.
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: callbackUrl },
      });
      if (error) return toFailure("google start", error);
      return data.url
        ? { ok: true, url: data.url }
        : { ok: false, reason: "unavailable" };
    },
    async completeOAuthSignIn(code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      return toResult("oauth callback", error);
    },
  };
}
