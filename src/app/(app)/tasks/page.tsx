import type { Metadata } from "next";
import { QuickAdd } from "@/components/tasks/quick-add";
import { ReminderList } from "@/components/tasks/reminder-list";
import { TaskList } from "@/components/tasks/task-list";
import { TaskViewNav } from "@/components/tasks/task-view-nav";
import { taskViewFromParam } from "@/components/tasks/task-views";
import { getAppContext } from "@/infrastructure/container";

export const metadata: Metadata = { title: "Tasks" };

export default async function TasksPage({ searchParams }: PageProps<"/tasks">) {
  const view = taskViewFromParam((await searchParams).view);
  const { user, useCases } = await getAppContext();
  const [records, today, reminders] = await Promise.all([
    useCases.listTaskRecords(user.id, view),
    useCases.getToday(user.id),
    useCases.listReminderRecords(user.id),
  ]);

  return (
    <>
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Tasks</h1>
        <p className="text-lg text-muted-foreground">
          An external memory for the things you need to do.
        </p>
      </header>
      <ReminderList
        userId={user.id}
        reminders={reminders.reminders}
        tasks={reminders.tasks}
        title="Reminders"
        dueOnly
      />
      <QuickAdd userId={user.id} view={view} today={today} />
      <section aria-labelledby="tasks-heading" className="flex flex-col gap-4">
        <h2 id="tasks-heading" className="sr-only">
          Your tasks
        </h2>
        <TaskViewNav current={view} />
        <TaskList
          userId={user.id}
          records={records}
          reminders={reminders.reminders}
          today={today}
          view={view}
        />
      </section>
    </>
  );
}
