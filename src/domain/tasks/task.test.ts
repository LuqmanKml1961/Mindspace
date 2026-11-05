import { describe, expect, it } from "vitest";
import { ValidationError } from "@/domain/shared/errors";
import {
  createTask,
  isTaskPriority,
  TASK_NOTES_MAX,
  TASK_TITLE_MAX,
  taskDraftFromThought,
  toTaskChanges,
  toTaskDue,
  toTaskNotes,
  toTaskTitle,
} from "@/domain/tasks/task";

describe("createTask", () => {
  it("needs only a title, and starts open with normal priority and no date", () => {
    expect(
      createTask({ userId: "user-a", title: "  Renew passport " }),
    ).toEqual({
      userId: "user-a",
      title: "Renew passport",
      notes: null,
      dueDate: null,
      dueTime: null,
      priority: "normal",
      sourceThoughtId: null,
    });
  });

  it("keeps notes, a due date and time, a priority and its source thought", () => {
    expect(
      createTask({
        userId: "user-a",
        title: "Reply to the landlord",
        notes: " About the lease ",
        dueDate: "2026-11-06",
        dueTime: "09:30",
        priority: "high",
        sourceThoughtId: "thought-1",
      }),
    ).toMatchObject({
      notes: "About the lease",
      dueDate: "2026-11-06",
      dueTime: "09:30",
      priority: "high",
      sourceThoughtId: "thought-1",
    });
  });

  it("refuses a time without a date", () => {
    expect(() =>
      createTask({ userId: "user-a", title: "Call", dueTime: "10:00" }),
    ).toThrow(new ValidationError("Add a date for this time."));
  });
});

describe("taskDraftFromThought", () => {
  it("uses the thought's title, and keeps the whole text as notes", () => {
    expect(
      taskDraftFromThought({
        title: "Landlord",
        content: "Reply about the lease\nMention the boiler",
      }),
    ).toEqual({
      title: "Landlord",
      notes: "Reply about the lease\nMention the boiler",
    });
  });

  it("uses the first line when there is no title", () => {
    expect(
      taskDraftFromThought({
        title: null,
        content: "\n  Call the bank  \nAsk about the fee",
      }),
    ).toEqual({
      title: "Call the bank",
      notes: "Call the bank  \nAsk about the fee",
    });
  });

  it("leaves the notes empty when the text is only the title", () => {
    expect(
      taskDraftFromThought({ title: null, content: "  Renew passport " }),
    ).toEqual({ title: "Renew passport", notes: null });
  });

  it("cuts a long first line to the title limit, counting an emoji as one", () => {
    const draft = taskDraftFromThought({
      title: null,
      content: "😀".repeat(TASK_TITLE_MAX + 20),
    });
    expect([...draft.title]).toHaveLength(TASK_TITLE_MAX);
    expect(() => toTaskTitle(draft.title)).not.toThrow();
    expect(draft.notes).toBe("😀".repeat(TASK_TITLE_MAX + 20));
  });
});

describe("toTaskTitle", () => {
  it("refuses an empty title", () => {
    expect(() => toTaskTitle("   ")).toThrow(
      new ValidationError("Give the task a title."),
    );
  });

  it("allows up to the limit, counting an emoji as one character", () => {
    expect(toTaskTitle("😀".repeat(TASK_TITLE_MAX))).toHaveLength(
      TASK_TITLE_MAX * 2,
    );
    expect(() => toTaskTitle("a".repeat(TASK_TITLE_MAX + 1))).toThrow(
      new ValidationError("Task titles can be up to 500 characters."),
    );
  });
});

describe("toTaskNotes", () => {
  it("stores blank notes as none", () => {
    expect(toTaskNotes("  \n ")).toBeNull();
    expect(toTaskNotes(null)).toBeNull();
    expect(toTaskNotes(undefined)).toBeNull();
  });

  it("allows as much as a thought, and no more", () => {
    expect(TASK_NOTES_MAX).toBe(10_000);
    expect(toTaskNotes("😀".repeat(TASK_NOTES_MAX))).not.toBeNull();
    expect(() => toTaskNotes("a".repeat(TASK_NOTES_MAX + 1))).toThrow(
      new ValidationError("Notes can be up to 10,000 characters."),
    );
  });
});

describe("toTaskDue", () => {
  it("treats a blank date and time as none", () => {
    expect(toTaskDue({ date: " ", time: "" })).toEqual({
      dueDate: null,
      dueTime: null,
    });
    expect(toTaskDue({})).toEqual({ dueDate: null, dueTime: null });
  });

  it("keeps a real date, with or without a time", () => {
    expect(toTaskDue({ date: "2026-11-05" })).toEqual({
      dueDate: "2026-11-05",
      dueTime: null,
    });
    expect(toTaskDue({ date: "2028-02-29", time: "23:59" })).toEqual({
      dueDate: "2028-02-29",
      dueTime: "23:59",
    });
    expect(toTaskDue({ date: "2026-11-05", time: "00:00" }).dueTime).toBe(
      "00:00",
    );
  });

  it.each([
    "2026-02-29",
    "2026-02-30",
    "2026-13-01",
    "2026-04-31",
    "2026-11-5",
    "5/11/2026",
    "tomorrow",
  ])("refuses %s as a date", (date) => {
    expect(() => toTaskDue({ date })).toThrow(
      new ValidationError("Choose a real date."),
    );
  });

  it.each(["24:00", "9:30", "12:60", "12:30:00", "noon"])(
    "refuses %s as a time",
    (time) => {
      expect(() => toTaskDue({ date: "2026-11-05", time })).toThrow(
        new ValidationError("Choose a time between 00:00 and 23:59."),
      );
    },
  );

  it("refuses a time without a date", () => {
    expect(() => toTaskDue({ date: null, time: "08:00" })).toThrow(
      new ValidationError("Add a date for this time."),
    );
  });
});

describe("isTaskPriority", () => {
  it("accepts only low, normal and high", () => {
    expect(["low", "normal", "high"].every(isTaskPriority)).toBe(true);
    expect(isTaskPriority("urgent")).toBe(false);
    expect(isTaskPriority(undefined)).toBe(false);
  });
});

describe("toTaskChanges", () => {
  it("validates only the fields being changed", () => {
    expect(toTaskChanges({})).toEqual({});
    expect(toTaskChanges({ title: " New title " })).toEqual({
      title: "New title",
    });
    expect(toTaskChanges({ notes: "  " })).toEqual({ notes: null });
    expect(toTaskChanges({ priority: "low" })).toEqual({ priority: "low" });
  });

  it("changes the date and time together, so clearing the date clears the time", () => {
    expect(
      toTaskChanges({ due: { date: "2026-11-07", time: "18:00" } }),
    ).toEqual({ dueDate: "2026-11-07", dueTime: "18:00" });
    expect(toTaskChanges({ due: { date: null, time: null } })).toEqual({
      dueDate: null,
      dueTime: null,
    });
    expect(() => toTaskChanges({ due: { date: null, time: "18:00" } })).toThrow(
      new ValidationError("Add a date for this time."),
    );
  });

  it("completes and reopens a task", () => {
    const at = new Date("2026-11-05T08:00:00Z");
    expect(toTaskChanges({ completedAt: at })).toEqual({ completedAt: at });
    expect(toTaskChanges({ completedAt: null })).toEqual({
      completedAt: null,
    });
  });

  it("refuses an unknown priority and an empty title", () => {
    expect(() => toTaskChanges({ priority: "urgent" })).toThrow(
      new ValidationError("Choose low, normal or high priority."),
    );
    expect(() => toTaskChanges({ title: "" })).toThrow(ValidationError);
  });
});
