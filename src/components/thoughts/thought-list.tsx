"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FormMessages } from "@/components/forms/form-parts";
import { brainDump, errorMessage } from "@/components/thoughts/brain-dump";
import { formatCaptured } from "@/components/thoughts/thought-status";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";
import type { Thought, ThoughtStatus } from "@/domain/thoughts/thought";
import type { EncryptedThought } from "@/domain/thoughts/thought-repository";

const emptyText: Record<ThoughtStatus, { title: string; description: string }> =
  {
    inbox: {
      title: "Your inbox is clear.",
      description: "Anything on your mind can go in the box above.",
    },
    parked: {
      title: "Nothing parked.",
      description: "Park a thought when it can wait for later.",
    },
    archived: {
      title: "Nothing archived.",
      description: "Thoughts you’re done with will rest here.",
    },
  };

// The server sends ciphertext (newest first); this device decrypts it for display (D-021).
export function ThoughtList({
  userId,
  records,
  status,
}: {
  userId: string;
  records: EncryptedThought[];
  status: ThoughtStatus;
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

  if (error) return <FormMessages error={error} />;
  if (!thoughts) {
    return (
      <div role="status" className="flex flex-col gap-2">
        <span className="sr-only">Loading your thoughts…</span>
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }
  if (thoughts.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>{emptyText[status].title}</EmptyTitle>
          <EmptyDescription>{emptyText[status].description}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {thoughts.map((thought) => (
        <li key={thought.id}>
          <Item
            variant="outline"
            render={<Link href={`/thoughts/${thought.id}`} />}
          >
            <ItemContent>
              <ItemTitle>{thought.title ?? thought.content}</ItemTitle>
              {thought.title && (
                <ItemDescription>{thought.content}</ItemDescription>
              )}
              <ItemDescription>
                <time dateTime={thought.createdAt.toISOString()}>
                  {formatCaptured(thought.createdAt)}
                </time>
              </ItemDescription>
            </ItemContent>
          </Item>
        </li>
      ))}
    </ul>
  );
}
