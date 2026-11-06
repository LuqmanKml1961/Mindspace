import { describe, expect, it } from "vitest";
import { checkInEditsSchema } from "@/application/check-ins/schemas";

const cipher = (base64Length: number) =>
  `v1.${"A".repeat(16)}.${"A".repeat(base64Length)}`;
const taskId = "aaaaaaaa-0000-4000-8000-000000000001";

describe("checkInEditsSchema", () => {
  it("accepts ciphertext or null answers, and drops unknown keys", () => {
    const parsed = checkInEditsSchema.parse({
      occupyingMindCiphertext: cipher(24),
      worriesCiphertext: null,
      userId: "someone-else",
      date: "2026-01-01",
    });
    expect(parsed).toEqual({
      occupyingMindCiphertext: cipher(24),
      worriesCiphertext: null,
    });
  });

  it("accepts the largest ciphertexts the database allows, and nothing larger", () => {
    expect(
      checkInEditsSchema.safeParse({
        smallHelpfulThingCiphertext: cipher(10688),
        priorityTaskId: null,
        priorityTextCiphertext: cipher(2688),
      }).success,
    ).toBe(true);
    expect(
      checkInEditsSchema.safeParse({ canWaitCiphertext: cipher(10692) })
        .success,
    ).toBe(false);
    expect(
      checkInEditsSchema.safeParse({
        priorityTaskId: null,
        priorityTextCiphertext: cipher(2692),
      }).success,
    ).toBe(false);
  });

  it("refuses plaintext", () => {
    expect(
      checkInEditsSchema.safeParse({ canControlCiphertext: "my reply" })
        .success,
    ).toBe(false);
  });

  it("needs the priority's task and text together", () => {
    expect(
      checkInEditsSchema.safeParse({ priorityTaskId: taskId }).success,
    ).toBe(false);
    expect(
      checkInEditsSchema.safeParse({
        priorityTaskId: taskId,
        priorityTextCiphertext: null,
      }).success,
    ).toBe(true);
    expect(
      checkInEditsSchema.safeParse({
        priorityTaskId: null,
        priorityTextCiphertext: null,
      }).success,
    ).toBe(true);
  });

  it("refuses a priority that is both a task and written text", () => {
    expect(
      checkInEditsSchema.safeParse({
        priorityTaskId: taskId,
        priorityTextCiphertext: cipher(24),
      }).success,
    ).toBe(false);
  });

  it("refuses a task id that isn't a uuid", () => {
    expect(
      checkInEditsSchema.safeParse({
        priorityTaskId: "task-1",
        priorityTextCiphertext: null,
      }).success,
    ).toBe(false);
  });
});
