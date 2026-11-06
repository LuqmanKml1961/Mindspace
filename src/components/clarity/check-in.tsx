"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { CheckInPriority } from "@/components/clarity/check-in-priority";
import { promptQuestions } from "@/components/clarity/check-in-prompts";
import { CheckInRecap } from "@/components/clarity/check-in-recap";
import {
  CheckInStep,
  STEP_HEADING_ID,
} from "@/components/clarity/check-in-step";
import { checkInUseCases } from "@/components/clarity/check-in-use-cases";
import { FormMessages } from "@/components/forms/form-parts";
import { taskUseCases } from "@/components/tasks/task-use-cases";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  CHECK_IN_PROMPTS,
  type DailyCheckIn,
} from "@/domain/check-ins/daily-check-in";
import type { EncryptedDailyCheckIn } from "@/domain/check-ins/daily-check-in-repository";
import type { Task } from "@/domain/tasks/task";
import type { EncryptedTask } from "@/domain/tasks/task-repository";
import { errorMessage } from "@/lib/action-errors";
import { notify } from "@/lib/notify";

// The five questions, then the one thing.
const STEPS = CHECK_IN_PROMPTS.length + 1;

// A step by number (0 to 5), or the recap.
type Stage = number | "recap";

type Changes = Parameters<typeof checkInUseCases.updateCheckIn>[0]["changes"];

// Today's check-in (P5.4): one question per step, every step skippable, and the flow can end at
// any point. Each move saves that step's answer, so stopping halfway keeps what was written. The
// server sends ciphertext; this device decrypts it (D-021).
export function CheckIn({
  userId,
  record,
  taskRecords,
  today,
}: {
  userId: string;
  record: EncryptedDailyCheckIn | null;
  // Today's open tasks, offered as the one thing, plus the one already chosen.
  taskRecords: EncryptedTask[];
  today: string;
}) {
  const [opened, setOpened] = useState<{
    checkIn: DailyCheckIn | null;
    tasks: Task[];
  } | null>(null);
  const [error, setError] = useState<string>();
  const [stage, setStage] = useState<Stage>("recap");
  const [pending, startTransition] = useTransition();
  const moved = useRef(false);

  useEffect(() => {
    let current = true;
    Promise.all([
      record
        ? checkInUseCases.openCheckIns({ userId, records: [record] })
        : Promise.resolve([]),
      taskUseCases.openTasks({ userId, records: taskRecords }),
    ]).then(
      ([[checkIn], tasks]) => {
        if (current) setOpened({ checkIn: checkIn ?? null, tasks });
      },
      (cause) => {
        if (current) setError(errorMessage(cause));
      },
    );
    return () => {
      current = false;
    };
  }, [userId, record, taskRecords]);

  // After each move, the new heading takes focus, so a screen reader reads the question.
  useEffect(() => {
    if (moved.current) document.getElementById(STEP_HEADING_ID)?.focus();
  }, [stage]);

  // Saves the changes, if any, then moves on. On failure it stays put, and the text stays too.
  function go(next: Stage, changes?: Changes) {
    startTransition(async () => {
      try {
        let checkIn = opened?.checkIn ?? null;
        if (checkIn === null) {
          checkIn = await checkInUseCases.startCheckIn({ userId });
        } else if (changes) {
          checkIn = await checkInUseCases.updateCheckIn({
            userId,
            id: checkIn.id,
            changes,
          });
        }
        setOpened((previous) => previous && { ...previous, checkIn });
        moved.current = true;
        setStage(next);
      } catch (cause) {
        notify.error(errorMessage(cause));
      }
    });
  }

  if (error) return <FormMessages error={error} />;
  if (!opened) {
    return (
      <div role="status" className="flex flex-col gap-2">
        <span className="sr-only">Loading your check-in…</span>
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const { checkIn, tasks } = opened;
  if (checkIn === null) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Today’s check-in</h2>
          </CardTitle>
          <CardDescription>
            A couple of minutes to notice what’s on your mind. Every question is
            optional, and you can stop at any point.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button disabled={pending} onClick={() => go(0)}>
            {pending && <Spinner data-icon="inline-start" />}
            Start check-in
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (stage === "recap") {
    return (
      <CheckInRecap
        checkIn={checkIn}
        tasks={tasks}
        today={today}
        pending={pending}
        onEdit={() => go(0)}
      />
    );
  }

  if (stage < CHECK_IN_PROMPTS.length) {
    const prompt = CHECK_IN_PROMPTS[stage];
    return (
      <CheckInStep
        key={prompt}
        question={promptQuestions[prompt]}
        position={stage + 1}
        total={STEPS}
        saved={checkIn[prompt]}
        pending={pending}
        onMove={(answer, move) =>
          go(
            move === "next" ? stage + 1 : move === "back" ? stage - 1 : "recap",
            answer === undefined
              ? undefined
              : { answers: { [prompt]: answer } },
          )
        }
      />
    );
  }

  return (
    <CheckInPriority
      tasks={tasks}
      saved={checkIn}
      position={STEPS}
      total={STEPS}
      pending={pending}
      onMove={(priority, move) =>
        go(
          move === "back" ? stage - 1 : "recap",
          priority === undefined ? undefined : { priority },
        )
      }
    />
  );
}
