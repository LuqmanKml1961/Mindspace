import type { Metadata } from "next";
import { idSchema } from "@/application/thoughts/schemas";
import { CaptureBox } from "@/components/thoughts/capture-box";
import { StatusNav } from "@/components/thoughts/status-nav";
import { ThoughtList } from "@/components/thoughts/thought-list";
import type { CategoryFilter } from "@/components/thoughts/thought-status";
import { isThoughtStatus } from "@/domain/thoughts/thought";
import { getAppContext } from "@/infrastructure/container";

export const metadata: Metadata = { title: "Brain Dump" };

// "none" lists thoughts without a category; anything that isn't an id means all categories.
function categoryFilterFrom(value: unknown): CategoryFilter {
  if (value === "none") return null;
  const id = idSchema.safeParse(value);
  return id.success ? id.data : undefined;
}

export default async function ThoughtsPage({
  searchParams,
}: PageProps<"/thoughts">) {
  const params = await searchParams;
  const status = isThoughtStatus(params.status) ? params.status : "inbox";
  const category = categoryFilterFrom(params.category);
  const { user, useCases } = await getAppContext();
  const [records, categoryRecords] = await Promise.all([
    useCases.listThoughtRecords(user.id, { status, categoryId: category }),
    useCases.listCategoryRecords(user.id),
  ]);

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
        <StatusNav current={status} category={category} />
        <ThoughtList
          userId={user.id}
          records={records}
          categoryRecords={categoryRecords}
          status={status}
          category={category}
        />
      </section>
    </>
  );
}
