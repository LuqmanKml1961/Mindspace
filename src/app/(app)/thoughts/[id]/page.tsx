import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { idSchema } from "@/application/thoughts/schemas";
import { ThoughtEditor } from "@/components/thoughts/thought-editor";
import { thoughtsHref } from "@/components/thoughts/thought-status";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getAppContext } from "@/infrastructure/container";

// The title is encrypted, so the browser tab shows a generic name.
export const metadata: Metadata = { title: "Thought" };

export default async function ThoughtPage({
  params,
}: PageProps<"/thoughts/[id]">) {
  const id = idSchema.safeParse((await params).id);
  if (!id.success) notFound();
  const { user, useCases } = await getAppContext();
  const [record, categoryRecords, today] = await Promise.all([
    useCases.getThoughtRecord(user.id, id.data),
    useCases.listCategoryRecords(user.id),
    useCases.getToday(user.id),
  ]);
  if (!record) notFound();

  return (
    <>
      <header className="flex flex-col gap-3">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                render={<Link href={thoughtsHref(record.status)} />}
              >
                Brain Dump
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>This thought</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="text-3xl font-semibold tracking-tight">Your thought</h1>
      </header>
      <ThoughtEditor
        userId={user.id}
        record={record}
        categoryRecords={categoryRecords}
        today={today}
      />
    </>
  );
}
