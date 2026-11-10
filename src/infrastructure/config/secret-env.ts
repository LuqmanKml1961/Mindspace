import "server-only";

// Read only when an account is deleted, so the rest of the app runs without it. It gives full
// access to the project: never prefix it NEXT_PUBLIC_ (on Vercel it is type Secret).
export function supabaseSecretKey(): string {
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "Missing SUPABASE_SECRET_KEY, so accounts can't be deleted (see .env.example).",
    );
  }
  return key;
}
