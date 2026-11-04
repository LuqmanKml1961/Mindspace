"use client";

import { useRef, useState, useTransition } from "react";
import { FormMessages, SubmitButton } from "@/components/forms/form-parts";
import { brainDump, errorMessage } from "@/components/thoughts/brain-dump";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

// One field, one action. The text is encrypted on this device before it is sent (D-021).
export function CaptureBox({ userId }: { userId: string }) {
  const [content, setContent] = useState("");
  const [error, setError] = useState<string>();
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  const field = useRef<HTMLTextAreaElement>(null);
  const empty = content.trim().length === 0;

  function save() {
    if (pending || empty) return;
    startTransition(async () => {
      try {
        await brainDump.captureThought({ userId, content });
        setContent("");
        setError(undefined);
        setSaved(true);
      } catch (cause) {
        // The text stays in the field, so nothing is lost.
        setError(errorMessage(cause));
      }
      field.current?.focus();
    });
  }

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
    >
      <FormMessages error={error} />
      <Field>
        <FieldLabel htmlFor="thought" className="sr-only">
          What’s on your mind?
        </FieldLabel>
        <Textarea
          id="thought"
          ref={field}
          autoFocus
          value={content}
          // Read-only rather than disabled while saving, so the field keeps focus.
          readOnly={pending}
          placeholder="What’s on your mind?"
          className="max-h-[60svh] min-h-32"
          onChange={(event) => {
            setContent(event.target.value);
            setSaved(false);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
              event.preventDefault();
              save();
            }
          }}
        />
        <FieldDescription className="hidden md:block">
          Press Ctrl+Enter (⌘+Enter on a Mac) to save.
        </FieldDescription>
      </Field>
      <div className="flex items-center gap-3">
        <SubmitButton pending={pending} disabled={empty}>
          Save
        </SubmitButton>
        <p role="status" className="text-sm text-muted-foreground">
          {saved ? "Saved." : ""}
        </p>
      </div>
    </form>
  );
}
