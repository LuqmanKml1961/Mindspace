"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { checkInUseCases } from "@/components/clarity/check-in-use-cases";
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
import { Skeleton } from "@/components/ui/skeleton";
import type { EncryptedDailyCheckIn } from "@/domain/check-ins/daily-check-in-repository";
import type { Task } from "@/domain/tasks/task";
import type { EncryptedTask } from "@/domain/tasks/task-repository";
import { errorMessage } from "@/lib/action-errors";

// Home's one thing (P5.5, spec §4.7): the priority chosen in today's check-in, first on the page.
// The rest of today's tasks stay just below it, one tap away. Decrypted on this device.
export function OneThing({
  userId,
  record,
  task: taskRecord,
  today,
}: {
  userId: string;
  // Today's check-in, if there is one.
  record: EncryptedDailyCheckIn | null;
  // The priority task, when the one thing is a task.
  task: EncryptedTask | null;
  today: string;
}) {
  const [opened, setOpened] = useState<{
    text: string | null;
    task: Task | null;
  } | null>(null);
  const [error, setError] = useState<string>();
  const chosen = Boolean(taskRecord || record?.priorityTextCiphertext);

  useEffect(() => {
    if (!chosen) return;
    let current = true;
    Promise.all([
      record?.priorityTextCiphertext
        ? checkInUseCases.openCheckIns({ userId, records: [record] })
        : Promise.resolve([]),
      taskRecord
        ? taskUseCases.openTasks({ userId, records: [taskRecord] })
        : Promise.resolve([]),
    ]).then(
      ([[checkIn], [task]]) => {
        if (current) {
          setOpened({
            text: checkIn?.priorityText ?? null,
            task: task ?? null,
          });
        }
      },
      (cause) => {
        if (current) setError(errorMessage(cause));
      },
    );
    return () => {
      current = false;
    };
  }, [chosen, userId, record, taskRecord]);

  let content: ReactNode = null;
  if (chosen && error) {
    content = <FormMessages error={error} />;
  } else if (chosen && !opened) {
    content = (
      <div role="status">
        <span className="sr-only">Loading today’s one thing…</span>
        <Skeleton className="h-16 w-full" />
      </div>
    );
  } else if (opened?.task) {
    content = (
      <div className="flex">
        <TaskItem task={opened.task} today={today} href="/tasks" />
      </div>
    );
  } else if (opened) {
    content = (
      <p className="text-xl font-medium break-words whitespace-pre-wrap">
        {opened.text}
      </p>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2>Today’s one thing</h2>
        </CardTitle>
        {!chosen && <CardDescription>Nothing chosen yet.</CardDescription>}
      </CardHeader>
      {content && <CardContent>{content}</CardContent>}
      <CardFooter>
        <Link
          href="/clarity"
          className={buttonVariants({ variant: "link", className: "px-0" })}
        >
          {chosen ? "Change it in Mind Clarity" : "Choose it in Mind Clarity"}
        </Link>
      </CardFooter>
    </Card>
  );
}
