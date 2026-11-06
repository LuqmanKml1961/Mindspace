import { isCalendarDate } from "@/domain/shared/calendar";
import { ValidationError } from "@/domain/shared/errors";
import { characterCount } from "@/domain/shared/text";

// Enforced here, on the device; the database checks the ciphertext sizes derived from them
// (DATA_MODEL.md, daily_checkins). Answers are Q-7. A written priority matches a task title.
export const CHECK_IN_ANSWER_MAX = 2_000;
export const CHECK_IN_PRIORITY_MAX = 500;

// The prompts of spec §4.6, in the order the check-in asks them.
export const CHECK_IN_PROMPTS = [
  "occupyingMind",
  "worries",
  "canControl",
  "canWait",
  "smallHelpfulThing",
] as const;
export type CheckInPrompt = (typeof CHECK_IN_PROMPTS)[number];

// Every prompt is optional: null means skipped.
export type CheckInAnswers = Record<CheckInPrompt, string | null>;

// The day's one priority (spec §4.7): an existing task or a few written words, never both.
// Neither means no priority yet.
export type CheckInPriority = {
  priorityTaskId: string | null;
  priorityText: string | null;
};

export type DailyCheckIn = CheckInAnswers &
  CheckInPriority & {
    id: string;
    userId: string;
    // The user's own calendar day (YYYY-MM-DD). One check-in per user per day.
    date: string;
    createdAt: Date;
    updatedAt: Date;
  };

// A check-in before it is saved: the database assigns id and timestamps.
export type NewDailyCheckIn = CheckInAnswers &
  CheckInPriority &
  Pick<DailyCheckIn, "userId" | "date">;

export type DailyCheckInChanges = Partial<CheckInAnswers & CheckInPriority>;

type AnswersInput = Partial<Record<CheckInPrompt, string | null>>;
type PriorityInput = { taskId?: string | null; text?: string | null };

// Trimmed; a blank answer is stored as skipped. Trimmed before encryption, since the server
// can't check the text.
export function toCheckInAnswer(
  input: string | null | undefined,
): string | null {
  const answer = input?.trim() ?? "";
  if (answer.length === 0) return null;
  if (characterCount(answer) > CHECK_IN_ANSWER_MAX) {
    throw new ValidationError(
      `Answers can be up to ${CHECK_IN_ANSWER_MAX.toLocaleString("en")} characters.`,
    );
  }
  return answer;
}

export function toCheckInPriority(input: PriorityInput): CheckInPriority {
  const taskId = input.taskId || null;
  const text = input.text?.trim() || null;
  if (taskId !== null && text !== null) {
    throw new ValidationError(
      "Choose a task or write your priority, not both.",
    );
  }
  if (text !== null && characterCount(text) > CHECK_IN_PRIORITY_MAX) {
    throw new ValidationError(
      `Your priority can be up to ${CHECK_IN_PRIORITY_MAX} characters.`,
    );
  }
  return { priorityTaskId: taskId, priorityText: text };
}

// Everything but the date is optional, so a check-in can start empty and fill in step by step.
export function createDailyCheckIn(props: {
  userId: string;
  date: string;
  answers?: AnswersInput;
  priority?: PriorityInput;
}): NewDailyCheckIn {
  if (!isCalendarDate(props.date)) {
    throw new ValidationError("A check-in needs a real date.");
  }
  const answers = props.answers ?? {};
  return {
    userId: props.userId,
    date: props.date,
    occupyingMind: toCheckInAnswer(answers.occupyingMind),
    worries: toCheckInAnswer(answers.worries),
    canControl: toCheckInAnswer(answers.canControl),
    canWait: toCheckInAnswer(answers.canWait),
    smallHelpfulThing: toCheckInAnswer(answers.smallHelpfulThing),
    ...toCheckInPriority(props.priority ?? {}),
  };
}

// Validates only the answers being changed. The priority's task and text always change
// together, so the never-both rule doesn't depend on what is already saved.
export function toCheckInChanges(input: {
  answers?: AnswersInput;
  priority?: PriorityInput;
}): DailyCheckInChanges {
  const changes: DailyCheckInChanges = {};
  for (const prompt of CHECK_IN_PROMPTS) {
    const answer = input.answers?.[prompt];
    if (answer !== undefined) changes[prompt] = toCheckInAnswer(answer);
  }
  if (input.priority !== undefined) {
    Object.assign(changes, toCheckInPriority(input.priority));
  }
  return changes;
}
