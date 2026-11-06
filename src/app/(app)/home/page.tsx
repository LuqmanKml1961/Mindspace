import type { Metadata } from "next";
import Link from "next/link";
import { ReminderList } from "@/components/tasks/reminder-list";
import { TodayPreview } from "@/components/tasks/today-preview";
import { InboxPreview } from "@/components/thoughts/inbox-preview";
import { buttonVariants } from "@/components/ui/button";
import { getAppContext } from "@/infrastructure/container";

export const metadata: Metadata = { title: "Home" };

const PREVIEW_SIZE = 3;
const TODAY_SHOWN = 5;
const REMINDERS_SHOWN = 5;

export default async function HomePage() {
  const { user, useCases } = await getAppContext();
  const [inbox, reminders, todayTasks, today] = await Promise.all([
    useCases.getInboxPreview(user.id, PREVIEW_SIZE),
    useCases.listReminderRecords(user.id),
    useCases.listTaskRecords(user.id, "today"),
    useCases.getToday(user.id),
  ]);

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
      <TodayPreview
        userId={user.id}
        records={todayTasks.slice(0, TODAY_SHOWN)}
        total={todayTasks.length}
        today={today}
      />
      <ReminderList
        userId={user.id}
        reminders={reminders.reminders}
        tasks={reminders.tasks}
        title="Upcoming reminders"
        limit={REMINDERS_SHOWN}
      />
      <InboxPreview
        userId={user.id}
        records={inbox.records}
        total={inbox.total}
      />
    </>
  );
}
