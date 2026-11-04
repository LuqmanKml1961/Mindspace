import type { Metadata } from "next";
import { CaptureBox } from "@/components/thoughts/capture-box";
import { StatusNav } from "@/components/thoughts/status-nav";
import { ThoughtList } from "@/components/thoughts/thought-list";
import { isThoughtStatus } from "@/domain/thoughts/thought";
import { getAppContext } from "@/infrastructure/container";

export const metadata: Metadata = { title: "Brain Dump" };

export default async function ThoughtsPage({
  searchParams,
}: PageProps<"/thoughts">) {
  const { status } = await searchParams;
  const current = isThoughtStatus(status) ? status : "inbox";
  const { user, useCases } = await getAppContext();
  const records = await useCases.listThoughtRecords(user.id, {
    status: current,
  });

  return (
    <>
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Brain Dump</h1>
        <p className="text-lg text-muted-foreground">
          Get thoughts out of your head now, and organise them later.
        </p>
      </header>
      <CaptureBox userId={user.id} />
      <section
        aria-labelledby="thoughts-heading"
        className="flex flex-col gap-4"
      >
        <h2 id="thoughts-heading" className="sr-only">
          Your thoughts
        </h2>
        <StatusNav current={current} />
        <ThoughtList userId={user.id} records={records} status={current} />
      </section>
    </>
  );
}
