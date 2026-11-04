import type { ThoughtStatus } from "@/domain/thoughts/thought";

export const statusLabels: Record<ThoughtStatus, string> = {
  inbox: "Inbox",
  parked: "Parked",
  archived: "Archived",
};

// The Brain Dump list for a status; the inbox is the default view.
export function thoughtsHref(status: ThoughtStatus): string {
  return status === "inbox" ? "/thoughts" : `/thoughts?status=${status}`;
}

const captured = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

// Formatted in the browser, in the device's time zone.
export function formatCaptured(date: Date): string {
  return captured.format(date);
}
