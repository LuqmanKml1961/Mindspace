import type { Metadata } from "next";

export const metadata: Metadata = { title: "Brain Dump" };

export default function ThoughtsPage() {
  return (
    <header className="flex flex-col gap-2">
      <h1 className="text-3xl font-semibold tracking-tight">Brain Dump</h1>
      <p className="text-lg text-muted-foreground">
        Get thoughts out of your head now, and organise them later.
      </p>
      <p className="text-sm text-muted-foreground">Coming soon.</p>
    </header>
  );
}
