"use client";

import { recapGroups } from "@/components/clarity/check-in-prompts";
import { STEP_HEADING_ID } from "@/components/clarity/check-in-step";
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

// The end of the check-in (P5.4): the answers grouped, so what can be acted on now stands apart
// from what can wait, and today's one thing. Skipped questions don't appear.
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
  const groups = recapGroups
    .map((group) => ({
      ...group,
      answers: group.prompts
        .map((prompt) => checkIn[prompt])
        .filter((answer) => answer !== null),
    }))
    .filter((group) => group.answers.length > 0);
  const priority =
    checkIn.priorityText ??
    tasks.find((task) => task.id === checkIn.priorityTaskId)?.title ??
    null;
  const nothingYet = groups.length === 0 && priority === null;

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
          <>
            {groups.map((group) => (
              <section key={group.title} className="flex flex-col gap-2">
                <div className="flex flex-col gap-0.5">
                  <h3 className="font-medium">{group.title}</h3>
                  {group.description && (
                    <p className="text-sm text-muted-foreground">
                      {group.description}
                    </p>
                  )}
                </div>
                <ul className="flex flex-col gap-2">
                  {group.answers.map((answer, index) => (
                    <li key={index} className="break-words whitespace-pre-wrap">
                      {answer}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
            {priority !== null && (
              <section className="flex flex-col gap-2">
                <h3 className="font-medium">Today’s one thing</h3>
                <p className="break-words whitespace-pre-wrap">{priority}</p>
              </section>
            )}
          </>
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
