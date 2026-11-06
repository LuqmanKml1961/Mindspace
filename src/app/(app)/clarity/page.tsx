import type { Metadata } from "next";
import Link from "next/link";
import { CheckIn } from "@/components/clarity/check-in";
import { waitingLabel } from "@/components/thoughts/thought-status";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAppContext } from "@/infrastructure/container";

export const metadata: Metadata = { title: "Mind Clarity" };

export default async function ClarityPage() {
  const { user, useCases } = await getAppContext();
  const [record, todayTasks, today, inbox] = await Promise.all([
    useCases.getTodayCheckInRecord(user.id),
    useCases.listTaskRecords(user.id, "today"),
    useCases.getToday(user.id),
    // Only the count is used: one row and the total, in one request.
    useCases.getInboxPreview(user.id, 1),
  ]);
  // The one thing chosen earlier stays on offer, even once its task is done or moved.
  const chosenId = record?.priorityTaskId;
  const chosen =
    chosenId && !todayTasks.some((task) => task.id === chosenId)
      ? await useCases.getTaskRecord(user.id, chosenId)
      : null;

  return (
    <>
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Mind Clarity</h1>
        <p className="text-lg text-muted-foreground">
          A short, optional check-in to notice what’s on your mind.
        </p>
      </header>
      <CheckIn
        userId={user.id}
        record={record}
        taskRecords={chosen ? [...todayTasks, chosen] : todayTasks}
        today={today}
      />
      {inbox.total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              <h2>Your inbox</h2>
            </CardTitle>
            <CardDescription>{waitingLabel(inbox.total)}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Link
              href="/thoughts/review"
              className={buttonVariants({ variant: "outline" })}
            >
              Review one by one
            </Link>
          </CardFooter>
        </Card>
      )}
    </>
  );
}
