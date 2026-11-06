"use client";

import { STEP_HEADING_ID } from "@/components/clarity/check-in-step";
import {
  CheckInSummary,
  summarise,
} from "@/components/clarity/check-in-summary";
import { formatDay } from "@/components/tasks/task-views";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DailyCheckIn } from "@/domain/check-ins/daily-check-in";
import type { Task } from "@/domain/tasks/task";

// The end of the check-in (P5.4): today's answers grouped, and today's one thing.
export function CheckInRecap({
  checkIn,
  tasks,
  today,
  pending,
  onEdit,
}: {
  checkIn: DailyCheckIn;
  tasks: Task[];
  today: string;
  pending: boolean;
  onEdit: () => void;
}) {
  const summary = summarise(checkIn, tasks);
  const nothingYet = summary.groups.length === 0 && summary.priority === null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2 id={STEP_HEADING_ID} tabIndex={-1} className="outline-none">
            Today’s check-in
          </h2>
        </CardTitle>
        <CardDescription>{formatDay(checkIn.date, today)}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {nothingYet ? (
          <p className="text-muted-foreground">
            Nothing written yet. Every question is optional.
          </p>
        ) : (
          <CheckInSummary summary={summary} priorityTitle="Today’s one thing" />
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" disabled={pending} onClick={onEdit}>
          {nothingYet ? "Continue check-in" : "Edit answers"}
        </Button>
      </CardFooter>
    </Card>
  );
}
