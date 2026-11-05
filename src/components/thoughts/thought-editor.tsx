"use client";

import { Delete02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import {
  FormField,
  FormMessages,
  SubmitButton,
} from "@/components/forms/form-parts";
import { brainDump } from "@/components/thoughts/brain-dump";
import { errorMessage } from "@/lib/action-errors";
import { CategoryPicker } from "@/components/thoughts/category-picker";
import { SaveShortcut } from "@/components/thoughts/save-shortcut";
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
  AlertDialogMedia,
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
import { notify } from "@/lib/notify";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { Category } from "@/domain/thoughts/category";
import type { EncryptedCategory } from "@/domain/thoughts/category-repository";
import {
  isThoughtStatus,
  THOUGHT_STATUSES,
  type Thought,
  type ThoughtStatus,
} from "@/domain/thoughts/thought";
import type { EncryptedThought } from "@/domain/thoughts/thought-repository";

type Draft = {
  title: string;
  content: string;
  categoryId: string | null;
  status: ThoughtStatus;
};

const draftOf = (thought: Thought): Draft => ({
  title: thought.title ?? "",
  content: thought.content,
  categoryId: thought.categoryId,
  status: thought.status,
});

// Only what differs from the saved thought, compared the way the domain stores it (trimmed).
function changesBetween(saved: Thought, draft: Draft) {
  const changes: Partial<Draft> = {};
  if ((draft.title.trim() || null) !== saved.title) changes.title = draft.title;
  if (draft.content.trim() !== saved.content) changes.content = draft.content;
  if (draft.categoryId !== saved.categoryId) {
    changes.categoryId = draft.categoryId;
  }
  if (draft.status !== saved.status) changes.status = draft.status;
  return changes;
}

export function ThoughtEditor({
  userId,
  record,
  categoryRecords,
}: {
  userId: string;
  record: EncryptedThought;
  categoryRecords: EncryptedCategory[];
}) {
  const router = useRouter();
  const [saved, setSaved] = useState<Thought | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  // Only for a thought that can't be opened; save and delete report through toasts.
  const [error, setError] = useState<string>();
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let current = true;
    Promise.all([
      brainDump.openThoughts({ userId, records: [record] }),
      brainDump.openCategories({ userId, records: categoryRecords }),
    ]).then(
      ([[thought], opened]) => {
        if (!current) return;
        setSaved(thought);
        setDraft(draftOf(thought));
        setCategories(opened);
      },
      (cause) => {
        if (current) setError(errorMessage(cause));
      },
    );
    return () => {
      current = false;
    };
  }, [userId, record, categoryRecords]);

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
  const edit = (next: Partial<Draft>) => setDraft({ ...draft, ...next });

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
        notify.success("Changes saved.");
      } catch (cause) {
        // The draft stays as typed, so nothing is lost.
        notify.error(errorMessage(cause));
      }
    });
  }

  function remove() {
    startTransition(async () => {
      try {
        await brainDump.deleteThought({ id: record.id });
        notify.success("Thought deleted.");
        router.push(listHref);
      } catch (cause) {
        setConfirming(false);
        notify.error(errorMessage(cause));
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
          <SaveShortcut />
        </Field>
        <CategoryPicker
          userId={userId}
          categories={categories}
          value={draft.categoryId}
          disabled={pending}
          onChange={(categoryId) => edit({ categoryId })}
          onCreated={(category) => {
            setCategories(
              [...categories, category].sort((a, b) =>
                a.name.localeCompare(b.name),
              ),
            );
            edit({ categoryId: category.id });
          }}
        />
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
          <SubmitButton
            pending={pending && !confirming}
            disabled={unchanged || pending}
          >
            Save changes
          </SubmitButton>
          <AlertDialog open={confirming} onOpenChange={setConfirming}>
            <AlertDialogTrigger
              render={
                <Button type="button" variant="destructive" disabled={pending}>
                  <HugeiconsIcon
                    icon={Delete02Icon}
                    strokeWidth={2}
                    data-icon="inline-start"
                    aria-hidden="true"
                  />
                  Delete
                </Button>
              }
            />
            <AlertDialogContent size="sm">
              <AlertDialogHeader>
                <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20">
                  <HugeiconsIcon
                    icon={Delete02Icon}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </AlertDialogMedia>
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
                  {pending ? (
                    <Spinner data-icon="inline-start" />
                  ) : (
                    <HugeiconsIcon
                      icon={Delete02Icon}
                      strokeWidth={2}
                      data-icon="inline-start"
                      aria-hidden="true"
                    />
                  )}
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
