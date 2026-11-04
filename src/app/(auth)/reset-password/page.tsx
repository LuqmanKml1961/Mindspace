import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = { title: "New password" };

// Not in the proxy's public pages: reached only after a reset code signs the user in.
export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
