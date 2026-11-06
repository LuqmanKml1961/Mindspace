import type { ThoughtStatus } from "@/domain/thoughts/thought";

export const statusLabels: Record<ThoughtStatus, string> = {
  inbox: "Inbox",
  parked: "Parked",
  archived: "Archived",
};

// A category filter: an id, "none" (no category), or undefined (all categories).
export type CategoryFilter = string | null | undefined;

// The Brain Dump list for a status (the inbox is the default) and, optionally, a category.
export function thoughtsHref(
  status: ThoughtStatus,
  category?: CategoryFilter,
): string {
  const query = new URLSearchParams();
  if (status !== "inbox") query.set("status", status);
  if (category !== undefined) query.set("category", category ?? "none");
  const search = query.toString();
  return search ? `/thoughts?${search}` : "/thoughts";
}

// How many inbox thoughts wait, calmly (Home and Mind Clarity).
export const waitingLabel = (total: number) =>
  total === 1
    ? "1 thought waiting · no rush"
    : `${total} thoughts waiting · no rush`;

const captured = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

// Formatted in the browser, in the device's time zone.
export function formatCaptured(date: Date): string {
  return captured.format(date);
}
