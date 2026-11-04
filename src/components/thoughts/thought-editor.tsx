"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import {
  FormField,
  FormMessages,
  SubmitButton,
} from "@/components/forms/form-parts";
import { brainDump, errorMessage } from "@/components/thoughts/brain-dump";
import {
  formatCaptured,
  statusLabels,
  thoughtsHref,
} from "@/components/thoughts/thought-status";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  isThoughtStatus,
  THOUGHT_STATUSES,
  type Thought,
  type ThoughtStatus,
} from "@/domain/thoughts/thought";
import type { EncryptedThought } from "@/domain/thoughts/thought-repository";

type Draft = { title: string; content: string; status: ThoughtStatus };

const draftOf = (thought: Thought): Draft => ({
  title: thought.title ?? "",
  content: thought.content,
  status: thought.status,
});

// Only what differs from the saved thought, compared the way the domain stores it (trimmed).
function changesBetween(saved: Thought, draft: Draft) {
  const changes: Partial<Draft> = {};
  if ((draft.title.trim() || null) !== saved.title) changes.title = draft.title;
  if (draft.content.trim() !== saved.content) changes.content = draft.content;
  if (draft.status !== saved.status) changes.status = draft.status;
  return changes;
}

export function ThoughtEditor({
  userId,
  record,
}: {
  userId: string;
  record: EncryptedThought;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState<Thought | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let current = true;
    brainDump.openThoughts({ userId, records: [record] }).then(
      ([thought]) => {
        if (!current) return;
        setSaved(thought);
        setDraft(draftOf(thought));
      },
      (cause) => {
        if (current) setError(errorMessage(cause));
      },
    );
    return () => {
      current = false;
    };
  }, [userId, record]);

  if (!saved || !draft) {
    return error ? (
      <FormMessages error={error} />
    ) : (
      <div role="status" className="flex flex-col gap-3">
        <span className="sr-only">Opening your thought…</span>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const changes = changesBetween(saved, draft);
  const unchanged = Object.keys(changes).length === 0;
  const listHref = thoughtsHref(saved.status);
  const edit = (next: Partial<Draft>) => {
    setDraft({ ...draft, ...next });
    setNotice(undefined);
  };

  function save() {
    if (pending || unchanged) return;
    startTransition(async () => {
      try {
        const thought = await brainDump.updateThought({
          userId,
          id: record.id,
          changes,
        });
        setSaved(thought);
        setDraft(draftOf(thought));
        setError(undefined);
        setNotice("Saved.");
      } catch (cause) {
        // The draft stays as typed, so nothing is lost.
        setError(errorMessage(cause));
      }
    });
  }

  function remove() {
    startTransition(async () => {
      try {
        await brainDump.deleteThought({ id: record.id });
        router.push(listHref);
      } catch (cause) {
        setConfirming(false);
        setError(errorMessage(cause));
      }
    });
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
    >
      <FieldGroup>
        <p className="text-sm text-muted-foreground">
          Captured{" "}
          <time dateTime={saved.createdAt.toISOString()}>
            {formatCaptured(saved.createdAt)}
          </time>
        </p>
        <FormMessages error={error} />
        <FormField
          id="title"
          label="Title"
          description="Optional."
          value={draft.title}
          readOnly={pending}
          onChange={(event) => edit({ title: event.target.value })}
        />
        <Field>
          <FieldLabel htmlFor="content">Thought</FieldLabel>
          <Textarea
            id="content"
            value={draft.content}
            readOnly={pending}
            className="max-h-[60svh] min-h-32"
            onChange={(event) => edit({ content: event.target.value })}
            onKeyDown={(event) => {
              if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
                event.preventDefault();
                save();
              }
            }}
          />
        </Field>
        <Field>
          <FieldTitle id="status-label">Where it lives</FieldTitle>
          <ToggleGroup
            aria-labelledby="status-label"
            variant="outline"
            value={[draft.status]}
            disabled={pending}
            onValueChange={(value) => {
              const next = value[0];
              if (isThoughtStatus(next)) edit({ status: next });
            }}
          >
            {THOUGHT_STATUSES.map((status) => (
              <ToggleGroupItem key={status} value={status}>
                {statusLabels[status]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </Field>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <SubmitButton
              pending={pending && !confirming}
              disabled={unchanged || pending}
            >
              Save changes
            </SubmitButton>
            <p role="status" className="text-sm text-muted-foreground">
              {notice}
            </p>
          </div>
          <AlertDialog open={confirming} onOpenChange={setConfirming}>
            <AlertDialogTrigger
              render={
                <Button type="button" variant="destructive" disabled={pending}>
                  Delete
                </Button>
              }
            />
            <AlertDialogContent size="sm">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this thought?</AlertDialogTitle>
                <AlertDialogDescription>
                  It will be gone for good, on every device.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel variant="ghost" disabled={pending}>
                  Keep it
                </AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  disabled={pending}
                  onClick={remove}
                >
                  {pending && <Spinner data-icon="inline-start" />}
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </FieldGroup>
    </form>
  );
}
