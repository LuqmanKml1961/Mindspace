import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { emailSignInEnabled } from "@/lib/features";

export const metadata: Metadata = { title: "Create account" };

export default function SignUpPage() {
  if (!emailSignInEnabled) redirect("/sign-in");
  return <SignUpForm />;
}
