import { describe, expect, it } from "vitest";
import {
  reminderInputSchema,
  taskEditsSchema,
  taskInputSchema,
} from "@/application/tasks/schemas";

const cipher = (base64Length: number) =>
  `v1.${"A".repeat(16)}.${"A".repeat(base64Length)}`;

const input = {
  titleCiphertext: cipher(24),
  notesCiphertext: null,
  dueDate: "2026-11-06",
  dueTime: "09:30",
  priority: "normal",
  sourceThoughtId: null,
};

describe("taskInputSchema", () => {
  it("accepts ciphertext and readable fields, and drops unknown keys", () => {
    const parsed = taskInputSchema.parse({
      ...input,
      userId: "someone-else",
      completedAt: new Date(),
    });
    expect(parsed).toEqual(input);
  });

  it("accepts the largest ciphertexts the database allows, and nothing larger", () => {
    expect(
      taskInputSchema.safeParse({
        ...input,
        titleCiphertext: cipher(2688),
        notesCiphertext: cipher(53356),
      }).success,
    ).toBe(true);
    expect(
      taskInputSchema.safeParse({ ...input, titleCiphertext: cipher(2692) })
        .success,
    ).toBe(false);
    expect(
      taskInputSchema.safeParse({ ...input, notesCiphertext: cipher(53360) })
        .success,
    ).toBe(false);
  });

  it("refuses plaintext, an unknown priority and a source that isn't an id", () => {
    for (const bad of [
      { titleCiphertext: "call the bank" },
      { notesCiphertext: "private notes" },
      { priority: "urgent" },
      { sourceThoughtId: "thought-1" },
    ]) {
      expect(taskInputSchema.safeParse({ ...input, ...bad }).success).toBe(
        false,
      );
    }
  });
});

describe("taskEditsSchema", () => {
  it("accepts any single edit, and the date and time together", () => {
    expect(taskEditsSchema.safeParse({ priority: "low" }).success).toBe(true);
    expect(
      taskEditsSchema.safeParse({ dueDate: null, dueTime: null }).success,
    ).toBe(true);
  });

  it("refuses a date or a time sent on its own, and drops completion", () => {
    expect(taskEditsSchema.safeParse({ dueTime: "09:30" }).success).toBe(false);
    expect(taskEditsSchema.safeParse({ dueDate: "2026-11-06" }).success).toBe(
      false,
    );
    expect(
      taskEditsSchema.parse({ priority: "high", completedAt: new Date() }),
    ).toEqual({ priority: "high" });
  });
});

describe("reminderInputSchema", () => {
  it("needs a task id and a date", () => {
    const remindAt = new Date("2026-11-06T01:00:00Z");
    const taskId = "aaaaaaaa-0000-4000-8000-000000000001";
    expect(reminderInputSchema.parse({ taskId, remindAt })).toEqual({
      taskId,
      remindAt,
    });
    expect(
      reminderInputSchema.safeParse({ taskId: "task-1", remindAt }).success,
    ).toBe(false);
    expect(
      reminderInputSchema.safeParse({ taskId, remindAt: "tomorrow" }).success,
    ).toBe(false);
  });
});
