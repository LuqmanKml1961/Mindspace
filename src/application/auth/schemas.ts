import { z } from "zod";

// Must match otp_length in supabase/config.toml and the hosted project (D-019).
export const EMAIL_CODE_LENGTH = 6;

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: "Enter a valid email address." }));

const passwordSchema = z
  .string()
  .min(8, { error: "Use at least 8 characters." })
  .max(72, { error: "Use 72 characters or fewer." });

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { error: "Enter your password." }),
});

export const resetRequestSchema = z.object({ email: emailSchema });

export const newPasswordSchema = z.object({ password: passwordSchema });

const codeError = `Enter the ${EMAIL_CODE_LENGTH}-digit code from the email.`;

// An email and the code sent to it: confirms an account or starts a password reset.
export const emailCodeSchema = z.object({
  email: emailSchema,
  code: z
    .string()
    .trim()
    .length(EMAIL_CODE_LENGTH, { error: codeError })
    .regex(/^\d+$/, { error: codeError }),
});
