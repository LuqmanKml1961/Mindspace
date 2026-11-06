import type { Metadata } from "next";
import Link from "next/link";
import { PastReflections } from "@/components/clarity/past-reflections";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getAppContext } from "@/infrastructure/container";

export const metadata: Metadata = { title: "Past reflections" };

export default async function PastReflectionsPage() {
  const { user, useCases } = await getAppContext();
  const [past, today] = await Promise.all([
    useCases.listPastCheckInRecords(user.id),
    useCases.getToday(user.id),
  ]);

  return (
    <>
      <header className="flex flex-col gap-3">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/clarity" />}>
                Mind Clarity
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Past reflections</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="text-3xl font-semibold tracking-tight">
          Past reflections
        </h1>
        <p className="text-lg text-muted-foreground">
          Your earlier check-ins, newest first.
        </p>
      </header>
      <PastReflections
        userId={user.id}
        records={past.checkIns}
        taskRecords={past.tasks}
        today={today}
      />
    </>
  );
}
