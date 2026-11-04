"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { UserKeys } from "@/domain/encryption/user-keys";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { RecoverForm } from "@/components/encryption/recover-form";
import { RecoveryCodeCard } from "@/components/encryption/recovery-code-card";
import { SetUpForm } from "@/components/encryption/set-up-form";
import { UnlockForm } from "@/components/encryption/unlock-form";
import { FormMessages } from "@/components/forms/form-parts";
import { BrandFrame } from "@/components/layout/brand-frame";
import { Spinner } from "@/components/ui/spinner";
import { deviceKeys } from "@/infrastructure/browser";

type DeviceStatus = "checking" | "unavailable" | "locked" | "unlocked";

// The lock screen after sign-in (D-021): the app opens only once this device holds the user's
// key, which it keeps until sign-out. `keys` are the wrapped keys from the server, or null
// before encryption is set up.
export function EncryptionGate({
  userId,
  keys,
  children,
}: {
  userId: string;
  keys: UserKeys | null;
  children: ReactNode;
}) {
  const [status, setStatus] = useState<DeviceStatus>("checking");
  // A recovery code to show once: after setup, or after a recovery replaced the old one.
  const [newCode, setNewCode] = useState<{
    code: string;
    replacesOld: boolean;
  } | null>(null);
  const [recovering, setRecovering] = useState(false);

  useEffect(() => {
    let current = true;
    deviceKeys.get(userId).then(
      (key) => {
        if (current) setStatus(key ? "unlocked" : "locked");
      },
      () => {
        if (current) setStatus("unavailable");
      },
    );
    return () => {
      current = false;
    };
  }, [userId]);

  if (newCode) {
    return (
      <BrandFrame>
        <RecoveryCodeCard
          code={newCode.code}
          replacesOld={newCode.replacesOld}
          onDone={() => setNewCode(null)}
        />
      </BrandFrame>
    );
  }
  if (status === "unlocked") return children;
  if (status === "checking") {
    return (
      <BrandFrame>
        <div className="flex justify-center">
          <Spinner />
        </div>
      </BrandFrame>
    );
  }

  let card: ReactNode;
  if (status === "unavailable") {
    card = (
      <FormMessages error="This browser couldn’t open the secure storage Mindspace needs to unlock your thoughts. Please reload the page, or try another browser." />
    );
  } else if (!keys) {
    card = (
      <SetUpForm
        userId={userId}
        onDone={(code) => {
          setNewCode({ code, replacesOld: false });
          setStatus("unlocked");
        }}
      />
    );
  } else if (recovering) {
    card = (
      <RecoverForm
        userId={userId}
        keys={keys}
        onDone={(code) => {
          setNewCode({ code, replacesOld: true });
          setStatus("unlocked");
        }}
        onBack={() => setRecovering(false)}
      />
    );
  } else {
    card = (
      <UnlockForm
        userId={userId}
        keys={keys}
        onUnlocked={() => setStatus("unlocked")}
        onForgot={() => setRecovering(true)}
      />
    );
  }

  return (
    <BrandFrame>
      <div className="flex flex-col items-center gap-4">
        <div className="w-full">{card}</div>
        <SignOutButton variant="link" />
      </div>
    </BrandFrame>
  );
}
