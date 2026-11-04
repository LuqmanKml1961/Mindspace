import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { emailSignInEnabled } from "@/lib/features";

export const metadata: Metadata = { title: "Reset password" };

export default function ForgotPasswordPage() {
  if (!emailSignInEnabled) redirect("/sign-in");
  return <ForgotPasswordForm />;
}
