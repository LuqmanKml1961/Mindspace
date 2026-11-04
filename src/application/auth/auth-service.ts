export type AuthFailure =
  | "invalid_input"
  | "weak_password"
  | "same_password"
  | "email_taken"
  | "invalid_credentials"
  | "email_not_confirmed"
  | "invalid_code"
  | "rate_limited"
  | "session_missing"
  | "unavailable";

export type AuthResult = { ok: true } | { ok: false; reason: AuthFailure };

export type Credentials = { email: string; password: string };

export interface AuthService {
  signUp(credentials: Credentials): Promise<AuthResult>;
  confirmSignUp(email: string, code: string): Promise<AuthResult>;
  resendConfirmation(email: string): Promise<AuthResult>;
  signIn(credentials: Credentials): Promise<AuthResult>;
  signOut(): Promise<void>;
  // Succeeds for unknown emails too, so callers can't reveal who has an account.
  sendPasswordResetCode(email: string): Promise<AuthResult>;
  // On success the user is signed in and may choose a new password.
  verifyPasswordResetCode(email: string, code: string): Promise<AuthResult>;
  updatePassword(password: string): Promise<AuthResult>;
}
