import type { Metadata } from "next";

export const metadata: Metadata = { title: "Tasks" };

export default function TasksPage() {
  return (
    <header className="flex flex-col gap-2">
      <h1 className="text-3xl font-semibold tracking-tight">Tasks</h1>
      <p className="text-lg text-muted-foreground">
        An external memory for the things you need to do.
      </p>
      <p className="text-sm text-muted-foreground">Coming soon.</p>
    </header>
  );
}
