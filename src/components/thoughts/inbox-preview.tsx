"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FormMessages } from "@/components/forms/form-parts";
import { brainDump } from "@/components/thoughts/brain-dump";
import { errorMessage } from "@/lib/action-errors";
import { ThoughtItem } from "@/components/thoughts/thought-item";
import { waitingLabel } from "@/components/thoughts/thought-status";
import { buttonVariants } from "@/components/ui/button";
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
import type { Thought } from "@/domain/thoughts/thought";
import type { EncryptedThought } from "@/domain/thoughts/thought-repository";

// Home's "Your mind, right now" (spec §7): the newest few inbox thoughts and how many wait,
// decrypted on this device. Calm on purpose: no counts in red, nothing marked urgent.
export function InboxPreview({
  userId,
  records,
  total,
}: {
  userId: string;
  records: EncryptedThought[];
  total: number;
}) {
  const [thoughts, setThoughts] = useState<Thought[] | null>(null);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let current = true;
    brainDump.openThoughts({ userId, records }).then(
      (opened) => {
        if (current) setThoughts(opened);
      },
      (cause) => {
        if (current) setError(errorMessage(cause));
      },
    );
    return () => {
      current = false;
    };
  }, [userId, records]);

  let content;
  if (total === 0) {
    content = (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Your inbox is clear.</EmptyTitle>
          <EmptyDescription>
            Anything on your mind can go in Brain Dump.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  } else if (error) {
    content = <FormMessages error={error} />;
  } else if (!thoughts) {
    content = (
      <div role="status" className="flex flex-col gap-2">
        <span className="sr-only">Loading your recent thoughts…</span>
        {records.map((record) => (
          <Skeleton key={record.id} className="h-16 w-full" />
        ))}
      </div>
    );
  } else {
    content = (
      <ul className="flex flex-col gap-2">
        {thoughts.map((thought) => (
          <li key={thought.id}>
            <ThoughtItem thought={thought} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2>Your mind, right now</h2>
        </CardTitle>
        <CardDescription>
          {total === 0 ? "Nothing is waiting." : waitingLabel(total)}
        </CardDescription>
      </CardHeader>
      <CardContent>{content}</CardContent>
      {total > records.length && (
        <CardFooter>
          <Link
            href="/thoughts"
            className={buttonVariants({
              variant: "link",
              className: "px-0",
            })}
          >
            See all {total} in Brain Dump
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}
