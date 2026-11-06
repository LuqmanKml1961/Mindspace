"use client";

import { CheckListIcon, Delete02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { FormMessages } from "@/components/forms/form-parts";
import { brainDump } from "@/components/thoughts/brain-dump";
import { MakeTaskSheet } from "@/components/thoughts/make-task-sheet";
import { formatCaptured } from "@/components/thoughts/thought-status";
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
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import type { EncryptedCategory } from "@/domain/thoughts/category-repository";
import type { Thought } from "@/domain/thoughts/thought";
import type { EncryptedThought } from "@/domain/thoughts/thought-repository";
import { errorMessage } from "@/lib/action-errors";
import { notify } from "@/lib/notify";

const HEADING_ID = "review-heading";

const waitingNow = (count: number) =>
  count === 1 ? "1 waiting" : `${count} waiting`;

// The thought review (P5.6): inbox thoughts one at a time, oldest first, each parked, made into
// a task, archived, deleted or skipped. Every choice saves at once, and the next thought comes up
// once it has been saved; skipped ones stay in the inbox. Decrypted on this device.
export function ThoughtReview({
  userId,
  records,
  categoryRecords,
  today,
}: {
  userId: string;
  // The inbox, newest first, as the server lists it.
  records: EncryptedThought[];
  categoryRecords: EncryptedCategory[];
  // The user's date, for where a new task lands.
  today: string;
}) {
  const [opened, setOpened] = useState<{
    thoughts: Map<string, Thought>;
    names: Map<string, string>;
  } | null>(null);
  const [error, setError] = useState<string>();
  const [skipped, setSkipped] = useState<ReadonlySet<string>>(new Set());
  // Parked, archived, deleted or made into a task here.
  const [handled, setHandled] = useState<ReadonlySet<string>>(new Set());
  const [startedWith] = useState(records.length);
  const [confirming, setConfirming] = useState(false);
  const [makingTask, setMakingTask] = useState(false);
  const [pending, startTransition] = useTransition();
  const acted = useRef(false);

  useEffect(() => {
    let current = true;
    Promise.all([
      brainDump.openThoughts({ userId, records }),
      brainDump.openCategories({ userId, records: categoryRecords }),
    ]).then(
      ([thoughts, categories]) => {
        if (!current) return;
        setOpened({
          thoughts: new Map(thoughts.map((t) => [t.id, t])),
          names: new Map(categories.map((c) => [c.id, c.name])),
        });
      },
      (cause) => {
        if (current) setError(errorMessage(cause));
      },
    );
    return () => {
      current = false;
    };
  }, [userId, records, categoryRecords]);

  // Oldest first, leaving out what was handled or skipped. Brain Dump's saves don't refresh this
  // page, so the review keeps its own track.
  const waiting = [...records]
    .reverse()
    .filter((r) => !skipped.has(r.id) && !handled.has(r.id));
  const thought =
    waiting.length > 0 ? opened?.thoughts.get(waiting[0].id) : undefined;

  // After each choice, the next thought's heading takes focus, so a screen reader reads it.
  useEffect(() => {
    if (acted.current) document.getElementById(HEADING_ID)?.focus();
  }, [thought?.id]);

  if (error) return <FormMessages error={error} />;

  if (startedWith === 0 || waiting.length === 0) {
    const leftOver = skipped.size;
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>
            <h2 id={HEADING_ID} tabIndex={-1} className="outline-none">
              {startedWith === 0
                ? "Your inbox is clear."
                : "That’s everything in your inbox for now."}
            </h2>
          </EmptyTitle>
          <EmptyDescription>
            {leftOver === 0
              ? "Nothing is waiting."
              : `${leftOver === 1 ? "1 skipped thought is" : `${leftOver} skipped thoughts are`} still in your inbox, for whenever you’re ready.`}
          </EmptyDescription>
        </EmptyHeader>
        <Link
          href="/thoughts"
          className={buttonVariants({ variant: "outline" })}
        >
          Back to Brain Dump
        </Link>
      </Empty>
    );
  }

  if (!opened || !thought) {
    return (
      <div role="status">
        <span className="sr-only">Opening the next thought…</span>
        <Skeleton className="h-56 w-full" />
      </div>
    );
  }

  const current = thought;
  const categoryName = current.categoryId
    ? opened.names.get(current.categoryId)
    : undefined;

  function mark(id: string, isHandled: boolean) {
    setHandled((previous) => {
      const next = new Set(previous);
      if (isHandled) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  // Back to the inbox, so it comes up again.
  function undo(id: string) {
    brainDump.updateThought({ userId, id, changes: { status: "inbox" } }).then(
      () => mark(id, false),
      (cause) => notify.error(errorMessage(cause)),
    );
  }

  function moveTo(status: "parked" | "archived") {
    acted.current = true;
    startTransition(async () => {
      try {
        await brainDump.updateThought({
          userId,
          id: current.id,
          changes: { status },
        });
        mark(current.id, true);
        notify.success(
          status === "parked" ? "Parked for later." : "Archived.",
          {
            label: "Undo",
            onClick: () => undo(current.id),
          },
        );
      } catch (cause) {
        notify.error(errorMessage(cause));
      }
    });
  }

  function remove() {
    acted.current = true;
    startTransition(async () => {
      try {
        await brainDump.deleteThought({ id: current.id });
        setConfirming(false);
        mark(current.id, true);
        notify.success("Thought deleted.");
      } catch (cause) {
        setConfirming(false);
        notify.error(errorMessage(cause));
      }
    });
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardDescription>{waitingNow(waiting.length)}</CardDescription>
          <CardTitle>
            <h2 id={HEADING_ID} tabIndex={-1} className="outline-none">
              What would you like to do with this thought?
            </h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 rounded-xl border bg-background p-4">
            {current.title && (
              <p className="font-medium break-words">{current.title}</p>
            )}
            <p className="max-h-[40svh] overflow-y-auto break-words whitespace-pre-wrap">
              {current.content}
            </p>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>
                Captured{" "}
                <time dateTime={current.createdAt.toISOString()}>
                  {formatCaptured(current.createdAt)}
                </time>
              </span>
              {categoryName && (
                <Badge variant="secondary">{categoryName}</Badge>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-stretch gap-3">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              disabled={pending}
              onClick={() => moveTo("parked")}
            >
              Park
            </Button>
            <Button
              variant="outline"
              disabled={pending}
              onClick={() => {
                acted.current = true;
                setMakingTask(true);
              }}
            >
              <HugeiconsIcon
                icon={CheckListIcon}
                strokeWidth={2}
                data-icon="inline-start"
                aria-hidden="true"
              />
              Make it a task
            </Button>
            <Button
              variant="outline"
              disabled={pending}
              onClick={() => moveTo("archived")}
            >
              Archive
            </Button>
            <AlertDialog open={confirming} onOpenChange={setConfirming}>
              <AlertDialogTrigger
                render={
                  <Button variant="destructive" disabled={pending}>
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
          <div className="flex flex-wrap gap-2">
            <Button
              variant="ghost"
              disabled={pending}
              onClick={() => {
                acted.current = true;
                setSkipped(new Set([...skipped, current.id]));
              }}
            >
              Skip for now
            </Button>
            <Link
              href="/thoughts"
              className={buttonVariants({ variant: "ghost" })}
            >
              Stop for now
            </Link>
            {pending && (
              <span role="status" className="flex items-center">
                <Spinner />
                <span className="sr-only">Saving…</span>
              </span>
            )}
          </div>
        </CardFooter>
      </Card>
      <MakeTaskSheet
        key={current.id}
        userId={userId}
        thought={current}
        today={today}
        open={makingTask}
        onOpenChange={setMakingTask}
        onCreated={() => {
          setMakingTask(false);
          mark(current.id, true);
        }}
      />
    </>
  );
}
