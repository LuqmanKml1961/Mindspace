"use client";

import { useEffect, useState } from "react";
import { checkInUseCases } from "@/components/clarity/check-in-use-cases";
import {
  CheckInSummary,
  summarise,
} from "@/components/clarity/check-in-summary";
import { FormMessages } from "@/components/forms/form-parts";
import { taskUseCases } from "@/components/tasks/task-use-cases";
import { formatDay } from "@/components/tasks/task-views";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import type { DailyCheckIn } from "@/domain/check-ins/daily-check-in";
import type { EncryptedDailyCheckIn } from "@/domain/check-ins/daily-check-in-repository";
import type { Task } from "@/domain/tasks/task";
import type { EncryptedTask } from "@/domain/tasks/task-repository";
import { errorMessage } from "@/lib/action-errors";

// Past reflections (P5.7): earlier check-ins, newest first, decrypted on this device. A plain list
// by date: no scores, streaks or "insights", and a day without a check-in simply isn't there.
export function PastReflections({
  userId,
  records,
  taskRecords,
  today,
}: {
  userId: string;
  records: EncryptedDailyCheckIn[];
  // The tasks chosen as their one thing.
  taskRecords: EncryptedTask[];
  today: string;
}) {
  const [opened, setOpened] = useState<{
    checkIns: DailyCheckIn[];
    tasks: Task[];
  } | null>(null);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let current = true;
    Promise.all([
      checkInUseCases.openCheckIns({ userId, records }),
      taskUseCases.openTasks({ userId, records: taskRecords }),
    ]).then(
      ([checkIns, tasks]) => {
        if (current) setOpened({ checkIns, tasks });
      },
      (cause) => {
        if (current) setError(errorMessage(cause));
      },
    );
    return () => {
      current = false;
    };
  }, [userId, records, taskRecords]);

  if (error) return <FormMessages error={error} />;
  if (records.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>No past check-ins yet.</EmptyTitle>
          <EmptyDescription>
            Earlier check-ins appear here, newest first.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }
  if (!opened) {
    return (
      <div role="status" className="flex flex-col gap-4">
        <span className="sr-only">Loading your past check-ins…</span>
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {opened.checkIns.map((checkIn) => (
        <li key={checkIn.id}>
          <Card>
            <CardHeader>
              <CardTitle>
                <h2>{formatDay(checkIn.date, today)}</h2>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <CheckInSummary
                summary={summarise(checkIn, opened.tasks)}
                priorityTitle="The one thing"
              />
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}
