import type { Metadata } from "next";
import { GoogleOnlySignIn } from "@/components/auth/google-only-sign-in";
import { SignInForm } from "@/components/auth/sign-in-form";
import { emailSignInEnabled } from "@/lib/features";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage({
  searchParams,
}: PageProps<"/sign-in">) {
  const { error } = await searchParams;
  const message =
    error === "google"
      ? "Google sign-in didn’t finish. Please try again."
      : undefined;

  return emailSignInEnabled ? (
    <SignInForm initialError={message} />
  ) : (
    <GoogleOnlySignIn error={message} />
  );
}
