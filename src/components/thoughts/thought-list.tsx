"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FormMessages } from "@/components/forms/form-parts";
import { brainDump, errorMessage } from "@/components/thoughts/brain-dump";
import {
  formatCaptured,
  thoughtsHref,
  type CategoryFilter,
} from "@/components/thoughts/thought-status";
import { Badge } from "@/components/ui/badge";
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
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Skeleton } from "@/components/ui/skeleton";
import type { Category } from "@/domain/thoughts/category";
import type { EncryptedCategory } from "@/domain/thoughts/category-repository";
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

const filteredEmpty = {
  title: "Nothing here.",
  description: "No thoughts in this view match that category.",
};

// The server sends ciphertext (newest first); this device decrypts it for display (D-021).
export function ThoughtList({
  userId,
  records,
  categoryRecords,
  status,
  category,
}: {
  userId: string;
  records: EncryptedThought[];
  categoryRecords: EncryptedCategory[];
  status: ThoughtStatus;
  category: CategoryFilter;
}) {
  const router = useRouter();
  const [opened, setOpened] = useState<{
    thoughts: Thought[];
    categories: Category[];
  } | null>(null);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let current = true;
    Promise.all([
      brainDump.openThoughts({ userId, records }),
      brainDump.openCategories({ userId, records: categoryRecords }),
    ]).then(
      ([thoughts, categories]) => {
        if (current) setOpened({ thoughts, categories });
      },
      (cause) => {
        if (current) setError(errorMessage(cause));
      },
    );
    return () => {
      current = false;
    };
  }, [userId, records, categoryRecords]);

  if (error) return <FormMessages error={error} />;
  if (!opened) {
    return (
      <div role="status" className="flex flex-col gap-2">
        <span className="sr-only">Loading your thoughts…</span>
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  const { thoughts, categories } = opened;
  const names = new Map(categories.map((c) => [c.id, c.name]));
  const empty = category === undefined ? emptyText[status] : filteredEmpty;

  return (
    <div className="flex flex-col gap-4">
      {(categories.length > 0 || category !== undefined) && (
        <NativeSelect
          aria-label="Filter by category"
          size="sm"
          value={category === undefined ? "" : (category ?? "none")}
          onChange={(event) => {
            const choice = event.target.value;
            router.push(
              thoughtsHref(
                status,
                choice === "" ? undefined : choice === "none" ? null : choice,
              ),
            );
          }}
        >
          <NativeSelectOption value="">All categories</NativeSelectOption>
          <NativeSelectOption value="none">No category</NativeSelectOption>
          {categories.map((c) => (
            <NativeSelectOption key={c.id} value={c.id}>
              {c.name}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      )}
      {thoughts.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>{empty.title}</EmptyTitle>
            <EmptyDescription>{empty.description}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="flex flex-col gap-2">
          {thoughts.map((thought) => {
            const categoryName = thought.categoryId
              ? names.get(thought.categoryId)
              : undefined;
            return (
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
                  {categoryName && (
                    <Badge variant="secondary">{categoryName}</Badge>
                  )}
                </Item>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
