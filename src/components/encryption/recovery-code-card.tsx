"use client";

import { useState } from "react";
import { FormMessages } from "@/components/forms/form-parts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel } from "@/components/ui/field";

// Shown once, after setup or after a recovery. The code is never stored or sent anywhere.
export function RecoveryCodeCard({
  code,
  replacesOld,
  onDone,
}: {
  code: string;
  replacesOld: boolean;
  onDone: () => void;
}) {
  const [copy, setCopy] = useState<"idle" | "copied" | "failed">("idle");
  const [saved, setSaved] = useState(false);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopy("copied");
    } catch {
      setCopy("failed");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h1>
            {replacesOld
              ? "Save your new recovery code"
              : "Save your recovery code"}
          </h1>
        </CardTitle>
        <CardDescription>
          {replacesOld &&
            "Your new passphrase is set, and your old recovery code no longer works. "}
          If you ever forget your passphrase, this code is the only way back to
          your thoughts. Keep it somewhere safe, like a password manager. It’s
          shown only this once.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <p className="rounded-xl bg-muted p-4 font-mono text-lg tracking-wide select-all">
          {code}
        </p>
        {copy === "failed" && (
          <FormMessages error="Couldn’t copy. Select the code and copy it yourself." />
        )}
        <div>
          <Button variant="outline" onClick={copyCode}>
            {copy === "copied" ? "Copied" : "Copy code"}
          </Button>
        </div>
        <Field orientation="horizontal">
          <Checkbox
            id="recovery-code-saved"
            checked={saved}
            onCheckedChange={(checked) => setSaved(checked)}
          />
          <FieldLabel htmlFor="recovery-code-saved">
            I’ve saved my recovery code
          </FieldLabel>
        </Field>
        <div>
          <Button disabled={!saved} onClick={onDone}>
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
