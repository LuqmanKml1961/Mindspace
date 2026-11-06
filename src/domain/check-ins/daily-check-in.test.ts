import { describe, expect, it } from "vitest";
import {
  CHECK_IN_ANSWER_MAX,
  CHECK_IN_PRIORITY_MAX,
  CHECK_IN_PROMPTS,
  createDailyCheckIn,
  toCheckInAnswer,
  toCheckInChanges,
  toCheckInPriority,
} from "@/domain/check-ins/daily-check-in";
import { ValidationError } from "@/domain/shared/errors";

describe("createDailyCheckIn", () => {
  it("can start empty: every answer is skipped and there is no priority", () => {
    expect(
      createDailyCheckIn({ userId: "user-a", date: "2026-11-06" }),
    ).toEqual({
      userId: "user-a",
      date: "2026-11-06",
      occupyingMind: null,
      worries: null,
      canControl: null,
      canWait: null,
      smallHelpfulThing: null,
      priorityTaskId: null,
      priorityText: null,
    });
  });

  it("keeps the answers given, trimmed, and skips the blank ones", () => {
    expect(
      createDailyCheckIn({
        userId: "user-a",
        date: "2026-11-06",
        answers: {
          occupyingMind: "  The move ",
          worries: "   ",
          canWait: "The garage",
        },
        priority: { text: " Call the movers " },
      }),
    ).toMatchObject({
      occupyingMind: "The move",
      worries: null,
      canControl: null,
      canWait: "The garage",
      smallHelpfulThing: null,
      priorityTaskId: null,
      priorityText: "Call the movers",
    });
  });

  it.each(["2026-02-30", "2026-11-6", ""])("refuses the date %j", (date) => {
    expect(() => createDailyCheckIn({ userId: "user-a", date })).toThrow(
      new ValidationError("A check-in needs a real date."),
    );
  });
});

describe("toCheckInAnswer", () => {
  it(`allows ${CHECK_IN_ANSWER_MAX} characters, counting an emoji as one`, () => {
    expect(CHECK_IN_ANSWER_MAX).toBe(2_000);
    expect(toCheckInAnswer("😀".repeat(CHECK_IN_ANSWER_MAX))).not.toBeNull();
  });

  it("refuses a longer answer", () => {
    expect(() => toCheckInAnswer("a".repeat(CHECK_IN_ANSWER_MAX + 1))).toThrow(
      new ValidationError("Answers can be up to 2,000 characters."),
    );
  });

  it("treats blank or missing as skipped", () => {
    expect(toCheckInAnswer(" \n ")).toBeNull();
    expect(toCheckInAnswer(null)).toBeNull();
    expect(toCheckInAnswer(undefined)).toBeNull();
  });
});

describe("toCheckInPriority", () => {
  it("is an existing task or written words", () => {
    expect(toCheckInPriority({ taskId: "task-1" })).toEqual({
      priorityTaskId: "task-1",
      priorityText: null,
    });
    expect(toCheckInPriority({ text: " Rest " })).toEqual({
      priorityTaskId: null,
      priorityText: "Rest",
    });
  });

  it("refuses both at once", () => {
    expect(() => toCheckInPriority({ taskId: "task-1", text: "Rest" })).toThrow(
      new ValidationError("Choose a task or write your priority, not both."),
    );
  });

  it("treats blank text alongside a task as no text", () => {
    expect(toCheckInPriority({ taskId: "task-1", text: "  " })).toEqual({
      priorityTaskId: "task-1",
      priorityText: null,
    });
  });

  it(`allows ${CHECK_IN_PRIORITY_MAX} characters of text, the same as a task title`, () => {
    expect(CHECK_IN_PRIORITY_MAX).toBe(500);
    expect(
      toCheckInPriority({ text: "😀".repeat(CHECK_IN_PRIORITY_MAX) })
        .priorityText,
    ).not.toBeNull();
    expect(() =>
      toCheckInPriority({ text: "a".repeat(CHECK_IN_PRIORITY_MAX + 1) }),
    ).toThrow(
      new ValidationError("Your priority can be up to 500 characters."),
    );
  });
});

describe("toCheckInChanges", () => {
  it("validates only the answers being changed", () => {
    expect(
      toCheckInChanges({ answers: { worries: " Money ", canControl: "" } }),
    ).toEqual({ worries: "Money", canControl: null });
  });

  it("changes nothing when nothing is given", () => {
    expect(toCheckInChanges({})).toEqual({});
  });

  it("always sets both parts of the priority, so switching from a task clears it", () => {
    expect(toCheckInChanges({ priority: { text: "Rest" } })).toEqual({
      priorityTaskId: null,
      priorityText: "Rest",
    });
    expect(toCheckInChanges({ priority: {} })).toEqual({
      priorityTaskId: null,
      priorityText: null,
    });
  });

  it("refuses an answer over the limit", () => {
    expect(() =>
      toCheckInChanges({
        answers: { smallHelpfulThing: "a".repeat(CHECK_IN_ANSWER_MAX + 1) },
      }),
    ).toThrow(ValidationError);
  });
});

describe("CHECK_IN_PROMPTS", () => {
  it("lists the prompts of spec §4.6 in order", () => {
    expect(CHECK_IN_PROMPTS).toEqual([
      "occupyingMind",
      "worries",
      "canControl",
      "canWait",
      "smallHelpfulThing",
    ]);
  });
});
