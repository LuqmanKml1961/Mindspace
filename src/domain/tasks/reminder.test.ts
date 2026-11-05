import { describe, expect, it } from "vitest";
import { ValidationError } from "@/domain/shared/errors";
import { createReminder } from "@/domain/tasks/reminder";

describe("createReminder", () => {
  const remindAt = new Date("2026-11-06T01:30:00Z");

  it("belongs to a task and keeps its time", () => {
    expect(
      createReminder({ userId: "user-a", taskId: "task-1", remindAt }),
    ).toEqual({ userId: "user-a", taskId: "task-1", remindAt });
  });

  it("refuses a reminder without a task", () => {
    expect(() =>
      createReminder({ userId: "user-a", taskId: "", remindAt }),
    ).toThrow(new ValidationError("A reminder belongs to a task."));
  });

  it("refuses a time that isn't a real moment", () => {
    expect(() =>
      createReminder({
        userId: "user-a",
        taskId: "task-1",
        remindAt: new Date("not a date"),
      }),
    ).toThrow(new ValidationError("Choose when to be reminded."));
  });
});
