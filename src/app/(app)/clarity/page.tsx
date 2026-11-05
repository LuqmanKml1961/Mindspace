import type { Metadata } from "next";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";

export const metadata: Metadata = { title: "Mind Clarity" };

export default function ClarityPage() {
  return (
    <>
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Mind Clarity</h1>
        <p className="text-lg text-muted-foreground">
          A short, optional check-in to notice what’s on your mind.
        </p>
      </header>
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Coming soon</EmptyTitle>
          <EmptyDescription>
            Daily check-ins come after tasks and reminders.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </>
  );
}
