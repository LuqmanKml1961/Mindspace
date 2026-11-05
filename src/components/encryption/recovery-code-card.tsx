"use client";

import { Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { notify } from "@/lib/notify";

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
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      notify.success("Recovery code copied.");
    } catch {
      notify.error("Couldn’t copy. Select the code and copy it yourself.");
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
        <Field>
          <FieldLabel htmlFor="recovery-code-value" className="sr-only">
            Your recovery code
          </FieldLabel>
          <InputGroup>
            {/* A text area, not an input, so the code wraps at its dashes on a phone. */}
            <InputGroupTextarea
              id="recovery-code-value"
              readOnly
              value={code}
              className="font-mono text-lg tracking-wide md:text-lg"
              onFocus={(event) => event.currentTarget.select()}
            />
            <InputGroupAddon align="block-end">
              <InputGroupButton variant="outline" size="sm" onClick={copyCode}>
                <HugeiconsIcon
                  icon={copied ? Tick02Icon : Copy01Icon}
                  strokeWidth={2}
                  data-icon="inline-start"
                  aria-hidden="true"
                />
                {copied ? "Copied" : "Copy code"}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </Field>
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
