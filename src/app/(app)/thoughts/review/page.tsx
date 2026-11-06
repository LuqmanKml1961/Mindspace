import type { Metadata } from "next";
import Link from "next/link";
import { ThoughtReview } from "@/components/thoughts/thought-review";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getAppContext } from "@/infrastructure/container";

export const metadata: Metadata = { title: "Review your inbox" };

export default async function ReviewPage() {
  const { user, useCases } = await getAppContext();
  const [records, categoryRecords, today] = await Promise.all([
    useCases.listThoughtRecords(user.id, { status: "inbox" }),
    useCases.listCategoryRecords(user.id),
    useCases.getToday(user.id),
  ]);

  return (
    <>
      <header className="flex flex-col gap-3">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/thoughts" />}>
                Brain Dump
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Review</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="text-3xl font-semibold tracking-tight">
          Review your inbox
        </h1>
        <p className="text-lg text-muted-foreground">
          One thought at a time, oldest first. Skip anything you’re not ready to
          decide.
        </p>
      </header>
      <ThoughtReview
        userId={user.id}
        records={records}
        categoryRecords={categoryRecords}
        today={today}
      />
    </>
  );
}
