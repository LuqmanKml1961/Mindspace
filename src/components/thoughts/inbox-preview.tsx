"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FormMessages } from "@/components/forms/form-parts";
import { brainDump, errorMessage } from "@/components/thoughts/brain-dump";
import { ThoughtItem } from "@/components/thoughts/thought-item";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Thought } from "@/domain/thoughts/thought";
import type { EncryptedThought } from "@/domain/thoughts/thought-repository";

const waiting = (total: number) =>
  total === 1
    ? "1 thought waiting · no rush"
    : `${total} thoughts waiting · no rush`;

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

  if (total === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nothing is waiting. Your inbox is clear.
      </p>
    );
  }
  if (error) return <FormMessages error={error} />;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">{waiting(total)}</p>
      {thoughts ? (
        <ul className="flex flex-col gap-2">
          {thoughts.map((thought) => (
            <li key={thought.id}>
              <ThoughtItem thought={thought} />
            </li>
          ))}
        </ul>
      ) : (
        <div role="status" className="flex flex-col gap-2">
          <span className="sr-only">Loading your recent thoughts…</span>
          {records.map((record) => (
            <Skeleton key={record.id} className="h-16 w-full" />
          ))}
        </div>
      )}
      {total > records.length && (
        <Link
          href="/thoughts"
          className={buttonVariants({
            variant: "link",
            className: "w-fit px-0",
          })}
        >
          See all {total} in Brain Dump
        </Link>
      )}
    </div>
  );
}
