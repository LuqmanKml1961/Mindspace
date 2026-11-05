"use client";

import { Logout01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useActionState } from "react";
import { signOutAction } from "@/app/(auth)/actions";
import { SubmitButton } from "@/components/forms/form-parts";
import { deviceKeys } from "@/infrastructure/browser";

async function signOut() {
  // This device forgets the key first (D-021); signing out still goes ahead if that fails.
  await deviceKeys.forget().catch(() => undefined);
  await signOutAction();
}

export function SignOutButton({
  variant = "outline",
}: {
  variant?: "outline" | "link";
}) {
  const [, formAction, pending] = useActionState(signOut, undefined);

  return (
    <form action={formAction}>
      <SubmitButton pending={pending} variant={variant}>
        {!pending && (
          <HugeiconsIcon
            icon={Logout01Icon}
            strokeWidth={2}
            data-icon="inline-start"
            aria-hidden="true"
          />
        )}
        Sign out
      </SubmitButton>
    </form>
  );
}
