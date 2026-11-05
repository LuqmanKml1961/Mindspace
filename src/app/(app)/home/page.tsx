import type { Metadata } from "next";
import Link from "next/link";
import { InboxPreview } from "@/components/thoughts/inbox-preview";
import { buttonVariants } from "@/components/ui/button";
import { getAppContext } from "@/infrastructure/container";

export const metadata: Metadata = { title: "Home" };

const PREVIEW_SIZE = 3;

export default async function HomePage() {
  const { user, useCases } = await getAppContext();
  const inbox = await useCases.getInboxPreview(user.id, PREVIEW_SIZE);

  return (
    <>
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Take a breath.
        </h1>
        <p className="text-lg text-muted-foreground">
          You don’t have to figure everything out right now.
        </p>
      </header>
      <div>
        <Link href="/thoughts" className={buttonVariants({ size: "lg" })}>
          Brain Dump
        </Link>
      </div>
      <section
        aria-labelledby="right-now-heading"
        className="flex flex-col gap-3"
      >
        <h2 id="right-now-heading" className="text-lg font-semibold">
          Your mind, right now
        </h2>
        <InboxPreview
          userId={user.id}
          records={inbox.records}
          total={inbox.total}
        />
      </section>
    </>
  );
}
