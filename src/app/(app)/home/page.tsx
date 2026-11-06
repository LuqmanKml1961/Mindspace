import type { Metadata } from "next";
import Link from "next/link";
import { OneThing } from "@/components/clarity/one-thing";
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
  const [inbox, reminders, todayTasks, today, checkIn] = await Promise.all([
    useCases.getInboxPreview(user.id, PREVIEW_SIZE),
    useCases.listReminderRecords(user.id),
    useCases.listTaskRecords(user.id, "today"),
    useCases.getToday(user.id),
    useCases.getTodayCheckInRecord(user.id),
  ]);
  // The one thing's task is usually among today's; if it was done or moved, it is read on its own.
  const priorityId = checkIn?.priorityTaskId;
  const priorityTask = priorityId
    ? (todayTasks.find((task) => task.id === priorityId) ??
      (await useCases.getTaskRecord(user.id, priorityId)))
    : null;

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
      <OneThing
        userId={user.id}
        record={checkIn}
        task={priorityTask}
        today={today}
      />
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
