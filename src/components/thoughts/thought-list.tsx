"use client";

import { Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { FormMessages } from "@/components/forms/form-parts";
import { brainDump, errorMessage } from "@/components/thoughts/brain-dump";
import { StatusNav } from "@/components/thoughts/status-nav";
import { ThoughtItem } from "@/components/thoughts/thought-item";
import {
  thoughtsHref,
  type CategoryFilter,
} from "@/components/thoughts/thought-status";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Skeleton } from "@/components/ui/skeleton";
import type { Category } from "@/domain/thoughts/category";
import type { EncryptedCategory } from "@/domain/thoughts/category-repository";
import {
  thoughtMatches,
  type Thought,
  type ThoughtStatus,
} from "@/domain/thoughts/thought";
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

function emptyMessage(
  query: string,
  status: ThoughtStatus,
  category: CategoryFilter,
) {
  if (query.trim()) {
    return {
      title: `Nothing matches “${query.trim()}”.`,
      description: "Search looks through every thought, in all views.",
    };
  }
  return category === undefined ? emptyText[status] : filteredEmpty;
}

// The filter select's values: "" for all categories, "none", or a category id.
function filterFromChoice(choice: string): CategoryFilter {
  if (choice === "") return undefined;
  if (choice === "none") return null;
  return choice;
}

// The server sends every thought as ciphertext, newest first. This device decrypts them, then
// filters by view and category, or searches all of them. The search text never leaves the
// browser (D-021), so it isn't in the URL either.
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
  const [query, setQuery] = useState("");

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

  const searching = query.trim().length > 0;
  const categories = opened?.categories ?? [];
  const names = new Map(categories.map((c) => [c.id, c.name]));
  const visible = (opened?.thoughts ?? []).filter((thought) =>
    searching
      ? thoughtMatches(thought, query)
      : thought.status === status &&
        (category === undefined || thought.categoryId === category),
  );
  let results: ReactNode;
  if (error) {
    results = <FormMessages error={error} />;
  } else if (!opened) {
    results = (
      <div role="status" className="flex flex-col gap-2">
        <span className="sr-only">Loading your thoughts…</span>
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  } else if (visible.length === 0) {
    const empty = emptyMessage(query, status, category);
    results = (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>{empty.title}</EmptyTitle>
          <EmptyDescription>{empty.description}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  } else {
    results = (
      <ul className="flex flex-col gap-2">
        {visible.map((thought) => (
          <li key={thought.id}>
            <ThoughtItem
              thought={thought}
              categoryName={
                thought.categoryId ? names.get(thought.categoryId) : undefined
              }
              showStatus={searching}
            />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Field>
        <FieldLabel htmlFor="thought-search" className="sr-only">
          Search your thoughts
        </FieldLabel>
        <InputGroup data-disabled={!opened || undefined}>
          <InputGroupInput
            id="thought-search"
            type="search"
            autoComplete="off"
            placeholder="Search all your thoughts"
            value={query}
            disabled={!opened}
            onChange={(event) => setQuery(event.target.value)}
          />
          <InputGroupAddon>
            <HugeiconsIcon
              icon={Search01Icon}
              strokeWidth={2}
              aria-hidden="true"
            />
          </InputGroupAddon>
        </InputGroup>
      </Field>
      {searching ? (
        <p role="status" className="text-sm text-muted-foreground">
          {visible.length === 1
            ? "1 thought matches."
            : `${visible.length} thoughts match.`}
        </p>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <StatusNav current={status} category={category} />
          {opened && (categories.length > 0 || category !== undefined) && (
            <NativeSelect
              aria-label="Filter by category"
              size="sm"
              value={category === undefined ? "" : (category ?? "none")}
              onChange={(event) =>
                router.push(
                  thoughtsHref(status, filterFromChoice(event.target.value)),
                )
              }
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
        </div>
      )}
      {results}
    </div>
  );
}
