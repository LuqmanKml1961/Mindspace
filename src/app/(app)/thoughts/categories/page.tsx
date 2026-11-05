import type { Metadata } from "next";
import Link from "next/link";
import { CategoryManager } from "@/components/thoughts/category-manager";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getAppContext } from "@/infrastructure/container";

export const metadata: Metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const { user, useCases } = await getAppContext();
  const records = await useCases.listCategoryRecords(user.id);

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
              <BreadcrumbPage>Categories</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="text-3xl font-semibold tracking-tight">Categories</h1>
        <p className="text-lg text-muted-foreground">
          Rename or delete the categories you sort your thoughts into.
        </p>
      </header>
      <CategoryManager userId={user.id} records={records} />
    </>
  );
}
