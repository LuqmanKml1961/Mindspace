"use client";

import { GoogleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useFormStatus } from "react-dom";
import { signInWithGoogleAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function GoogleSignIn() {
  return (
    <form action={signInWithGoogleAction}>
      <GoogleButton />
    </form>
  );
}

function GoogleButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="outline"
      className="w-full"
      disabled={pending}
    >
      {pending ? (
        <Spinner data-icon="inline-start" />
      ) : (
        <HugeiconsIcon
          icon={GoogleIcon}
          data-icon="inline-start"
          aria-hidden="true"
        />
      )}
      Continue with Google
    </Button>
  );
}
