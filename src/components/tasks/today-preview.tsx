"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FormMessages } from "@/components/forms/form-parts";
import { TaskItem } from "@/components/tasks/task-item";
import { taskUseCases } from "@/components/tasks/task-use-cases";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import type { Task } from "@/domain/tasks/task";
import type { EncryptedTask } from "@/domain/tasks/task-repository";
import { errorMessage } from "@/lib/action-errors";

const forToday = (total: number) =>
  total === 1 ? "1 task for today" : `${total} tasks for today`;

// Home's daily overview (P4.9): the first few of today's open tasks, those from earlier days
// included, decrypted on this device. Earlier ones read "Waiting since …", in the same muted
// text as the rest: nothing red, nothing urgent (spec §3).
export function TodayPreview({
  userId,
  records,
  total,
  today,
}: {
  userId: string;
  records: EncryptedTask[];
  total: number;
  today: string;
}) {
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let current = true;
    taskUseCases.openTasks({ userId, records }).then(
      (opened) => {
        if (current) setTasks(opened);
      },
      (cause) => {
        if (current) setError(errorMessage(cause));
      },
    );
    return () => {
      current = false;
    };
  }, [userId, records]);

  let content;
  if (total === 0) {
    content = (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Nothing for today.</EmptyTitle>
          <EmptyDescription>
            Enjoy the space. Tasks are there when you need them.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  } else if (error) {
    content = <FormMessages error={error} />;
  } else if (!tasks) {
    content = (
      <div role="status" className="flex flex-col gap-2">
        <span className="sr-only">Loading today’s tasks…</span>
        {records.map((record) => (
          <Skeleton key={record.id} className="h-16 w-full" />
        ))}
      </div>
    );
  } else {
    content = (
      <ul className="flex flex-col gap-2">
        {tasks.map((task) => (
          <li key={task.id} className="flex">
            <TaskItem task={task} today={today} href="/tasks" />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2>Today</h2>
        </CardTitle>
        <CardDescription>
          {total === 0 ? "Nothing planned." : forToday(total)}
        </CardDescription>
      </CardHeader>
      <CardContent>{content}</CardContent>
      {total > records.length && (
        <CardFooter>
          <Link
            href="/tasks"
            className={buttonVariants({
              variant: "link",
              className: "px-0",
            })}
          >
            See all {total} in Tasks
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}
