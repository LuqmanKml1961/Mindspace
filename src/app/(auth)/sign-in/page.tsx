import type { Metadata } from "next";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage({
  searchParams,
}: PageProps<"/sign-in">) {
  const { error } = await searchParams;
  return (
    <SignInForm
      initialError={
        error === "google"
          ? "Google sign-in didn’t finish. Please try again."
          : undefined
      }
    />
  );
}
