export type AuthFailure =
  | "invalid_input"
  | "weak_password"
  | "email_taken"
  | "invalid_credentials"
  | "email_not_confirmed"
  | "invalid_code"
  | "rate_limited"
  | "unavailable";

export type AuthResult = { ok: true } | { ok: false; reason: AuthFailure };

export type Credentials = { email: string; password: string };

export interface AuthService {
  signUp(credentials: Credentials): Promise<AuthResult>;
  confirmSignUp(email: string, code: string): Promise<AuthResult>;
  resendConfirmation(email: string): Promise<AuthResult>;
  signIn(credentials: Credentials): Promise<AuthResult>;
  signOut(): Promise<void>;
}
