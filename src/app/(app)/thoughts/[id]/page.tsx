import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { idSchema } from "@/application/thoughts/schemas";
import { ThoughtEditor } from "@/components/thoughts/thought-editor";
import { thoughtsHref } from "@/components/thoughts/thought-status";
import { buttonVariants } from "@/components/ui/button";
import { getAppContext } from "@/infrastructure/container";

// The title is encrypted, so the browser tab shows a generic name.
export const metadata: Metadata = { title: "Thought" };

export default async function ThoughtPage({
  params,
}: PageProps<"/thoughts/[id]">) {
  const id = idSchema.safeParse((await params).id);
  if (!id.success) notFound();
  const { user, useCases } = await getAppContext();
  const record = await useCases.getThoughtRecord(user.id, id.data);
  if (!record) notFound();

  return (
    <>
      <header className="flex flex-col gap-3">
        <Link
          href={thoughtsHref(record.status)}
          className={buttonVariants({
            variant: "link",
            className: "w-fit px-0",
          })}
        >
          ← Brain Dump
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">Your thought</h1>
      </header>
      <ThoughtEditor userId={user.id} record={record} />
    </>
  );
}
