import { z } from "zod";

// Must match otp_length in supabase/config.toml and the hosted project (D-019).
export const CONFIRMATION_CODE_LENGTH = 6;

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: "Enter a valid email address." }));

export const signUpSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(8, { error: "Use at least 8 characters." })
    .max(72, { error: "Use 72 characters or fewer." }),
});

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { error: "Enter your password." }),
});

const codeError = `Enter the ${CONFIRMATION_CODE_LENGTH}-digit code from the email.`;

export const confirmationSchema = z.object({
  email: emailSchema,
  code: z
    .string()
    .trim()
    .length(CONFIRMATION_CODE_LENGTH, { error: codeError })
    .regex(/^\d+$/, { error: codeError }),
});
