"use client";

import { useRef, useState, useTransition } from "react";
import { SubmitButton } from "@/components/forms/form-parts";
import { brainDump, errorMessage } from "@/components/thoughts/brain-dump";
import { SaveShortcut } from "@/components/thoughts/save-shortcut";
import { Field, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { notify } from "@/lib/notify";

// One field, one action. The text is encrypted on this device before it is sent (D-021).
export function CaptureBox({ userId }: { userId: string }) {
  const [content, setContent] = useState("");
  const [pending, startTransition] = useTransition();
  const field = useRef<HTMLTextAreaElement>(null);
  const empty = content.trim().length === 0;

  function save() {
    if (pending || empty) return;
    startTransition(async () => {
      try {
        await brainDump.captureThought({ userId, content });
        setContent("");
        notify.success("Thought saved.");
      } catch (cause) {
        // The text stays in the field, so nothing is lost.
        notify.error(errorMessage(cause));
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
          onChange={(event) => setContent(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
              event.preventDefault();
              save();
            }
          }}
        />
        <SaveShortcut />
      </Field>
      <div>
        <SubmitButton pending={pending} disabled={empty}>
          Save
        </SubmitButton>
      </div>
    </form>
  );
}
