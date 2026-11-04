import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { emailSignInEnabled } from "@/lib/features";

export const metadata: Metadata = { title: "New password" };

// Not in the proxy's public pages: reached only after a reset code signs the user in.
export default function ResetPasswordPage() {
  if (!emailSignInEnabled) redirect("/home");
  return <ResetPasswordForm />;
}
