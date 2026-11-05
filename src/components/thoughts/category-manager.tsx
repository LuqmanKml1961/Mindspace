"use client";

import { Delete02Icon, PencilEdit02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState, useTransition } from "react";
import { FormMessages } from "@/components/forms/form-parts";
import { brainDump } from "@/components/thoughts/brain-dump";
import { errorMessage } from "@/lib/action-errors";
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
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Field, FieldError } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemTitle,
} from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import type { Category } from "@/domain/thoughts/category";
import type { EncryptedCategory } from "@/domain/thoughts/category-repository";
import { notify } from "@/lib/notify";

const byName = (a: Category, b: Category) => a.name.localeCompare(b.name);

// Names are decrypted on this device and re-encrypted on rename (D-021). Deleting a category
// keeps its thoughts; the database clears their category.
export function CategoryManager({
  userId,
  records,
}: {
  userId: string;
  records: EncryptedCategory[];
}) {
  const [categories, setCategories] = useState<Category[] | null>(null);
  // Only for categories that can't be opened; rename errors show by the field, deletes as toasts.
  const [error, setError] = useState<string>();
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [renameError, setRenameError] = useState<string>();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let current = true;
    brainDump.openCategories({ userId, records }).then(
      (opened) => {
        if (current) setCategories(opened);
      },
      (cause) => {
        if (current) setError(errorMessage(cause));
      },
    );
    return () => {
      current = false;
    };
  }, [userId, records]);

  if (!categories) {
    return error ? (
      <FormMessages error={error} />
    ) : (
      <div role="status" className="flex flex-col gap-2">
        <span className="sr-only">Opening your categories…</span>
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>No categories yet.</EmptyTitle>
          <EmptyDescription>
            Add one from a thought’s Category menu.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const list = categories;

  function startRenaming(category: Category) {
    setRenamingId(category.id);
    setName(category.name);
    setRenameError(undefined);
  }

  function stopRenaming() {
    setRenamingId(null);
    setRenameError(undefined);
  }

  function rename(category: Category) {
    if (pending) return;
    if (name.trim() === category.name) {
      stopRenaming();
      return;
    }
    startTransition(async () => {
      try {
        const renamed = await brainDump.renameCategory({
          userId,
          id: category.id,
          name,
          existing: list,
        });
        setCategories(
          list.map((c) => (c.id === renamed.id ? renamed : c)).sort(byName),
        );
        stopRenaming();
        notify.success(`Renamed to “${renamed.name}”.`);
      } catch (cause) {
        // The typed name stays, so it can be corrected.
        setRenameError(errorMessage(cause));
      }
    });
  }

  function remove(category: Category) {
    startTransition(async () => {
      try {
        await brainDump.deleteCategory({ id: category.id });
        setCategories(list.filter((c) => c.id !== category.id));
        setDeletingId(null);
        notify.success(`Deleted “${category.name}”.`);
      } catch (cause) {
        setDeletingId(null);
        notify.error(errorMessage(cause));
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-2">
        {list.map((category) => (
          <li key={category.id}>
            {renamingId === category.id ? (
              <form
                className="flex items-start gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  rename(category);
                }}
              >
                <Field data-invalid={renameError ? true : undefined}>
                  <InputGroup>
                    <InputGroupInput
                      aria-label={`New name for ${category.name}`}
                      autoFocus
                      value={name}
                      readOnly={pending}
                      aria-invalid={renameError ? true : undefined}
                      onChange={(event) => setName(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Escape") stopRenaming();
                      }}
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        type="submit"
                        variant="default"
                        size="sm"
                        disabled={pending || !name.trim()}
                      >
                        {pending && <Spinner data-icon="inline-start" />}
                        Save
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                  <FieldError>{renameError}</FieldError>
                </Field>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={pending}
                  onClick={stopRenaming}
                >
                  Cancel
                </Button>
              </form>
            ) : (
              <Item variant="outline">
                <ItemContent>
                  <ItemTitle>{category.name}</ItemTitle>
                </ItemContent>
                <ItemActions>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`Rename ${category.name}`}
                    disabled={pending || renamingId !== null}
                    onClick={() => startRenaming(category)}
                  >
                    <HugeiconsIcon
                      icon={PencilEdit02Icon}
                      strokeWidth={2}
                      data-icon="inline-start"
                      aria-hidden="true"
                    />
                    Rename
                  </Button>
                  <AlertDialog
                    open={deletingId === category.id}
                    onOpenChange={(open) =>
                      setDeletingId(open ? category.id : null)
                    }
                  >
                    <AlertDialogTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={`Delete ${category.name}`}
                          disabled={pending || renamingId !== null}
                        >
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
                        <AlertDialogTitle>
                          Delete “{category.name}”?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Its thoughts stay, with no category. The category is
                          gone for good, on every device.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel variant="ghost" disabled={pending}>
                          Keep it
                        </AlertDialogCancel>
                        <AlertDialogAction
                          variant="destructive"
                          disabled={pending}
                          onClick={() => remove(category)}
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
                </ItemActions>
              </Item>
            )}
          </li>
        ))}
      </ul>
      <p className="text-sm text-muted-foreground">
        New categories are added from a thought’s Category menu.
      </p>
    </div>
  );
}
