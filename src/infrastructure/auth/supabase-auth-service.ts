import "server-only";
import {
  isAuthApiError,
  type AuthError,
  type SupabaseClient,
} from "@supabase/supabase-js";
import type {
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

function toResult(action: string, error: AuthError | null): AuthResult {
  if (!error) return { ok: true };

  const reason =
    isAuthApiError(error) && error.code ? failureByCode[error.code] : undefined;
  if (reason) return { ok: false, reason };

  logFailure(action, error);
  return { ok: false, reason: "unavailable" };
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
  };
}
