"use client";

import { useState } from "react";
import { validationMessage } from "@/components/forms/form-parts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldDescription, FieldError } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { toCheckInAnswer } from "@/domain/check-ins/daily-check-in";

export type Move = "next" | "back" | "finish";

export const STEP_HEADING_ID = "check-in-heading";

// One question of the check-in. Next, Back and Finish for now save what was written if it
// changed (a blank answer is saved as skipped); Skip for now leaves the saved answer as it was.
export function CheckInStep({
  question,
  position,
  total,
  saved,
  pending,
  onMove,
}: {
  question: string;
  position: number;
  total: number;
  saved: string | null;
  pending: boolean;
  // `answer` is undefined when nothing changed.
  onMove: (answer: string | null | undefined, move: Move) => void;
}) {
  const [draft, setDraft] = useState(saved ?? "");
  const error = validationMessage(() => toCheckInAnswer(draft));
  const move = (to: Move) => {
    const answer = toCheckInAnswer(draft);
    onMove(answer === saved ? undefined : answer, to);
  };

  return (
    <Card>
      <form
        className="contents"
        onSubmit={(event) => {
          event.preventDefault();
          if (!pending && !error) move("next");
        }}
      >
        <CardHeader>
          <CardDescription>
            {position} of {total}
          </CardDescription>
          <CardTitle>
            <h2 id={STEP_HEADING_ID} tabIndex={-1} className="outline-none">
              {question}
            </h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Field data-invalid={error ? true : undefined}>
            <Textarea
              aria-labelledby={STEP_HEADING_ID}
              aria-invalid={error ? true : undefined}
              value={draft}
              readOnly={pending}
              className="max-h-[50svh] min-h-32"
              onChange={(event) => setDraft(event.target.value)}
            />
            {error ? (
              <FieldError>{error}</FieldError>
            ) : (
              <FieldDescription>Optional. A word is enough.</FieldDescription>
            )}
          </Field>
        </CardContent>
        <CardFooter className="flex-wrap justify-between gap-2">
          <div className="flex gap-2">
            {position > 1 && (
              <Button
                type="button"
                variant="ghost"
                disabled={pending || !!error}
                onClick={() => move("back")}
              >
                Back
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              disabled={pending || !!error}
              onClick={() => move("finish")}
            >
              Finish for now
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => onMove(undefined, "next")}
            >
              Skip for now
            </Button>
            <Button type="submit" disabled={pending || !!error}>
              {pending && <Spinner data-icon="inline-start" />}
              Next
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
