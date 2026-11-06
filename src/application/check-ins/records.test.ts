import { describe, expect, it } from "vitest";
import {
  makeGetTodayCheckInRecord,
  makeListPastCheckInRecords,
  makeStartCheckInRecord,
  makeUpdateCheckInRecord,
} from "@/application/check-ins/records";
import type {
  DailyCheckInRepository,
  EncryptedDailyCheckIn,
  NewEncryptedDailyCheckIn,
} from "@/domain/check-ins/daily-check-in-repository";
import { ConflictError } from "@/domain/shared/errors";
import type {
  EncryptedTask,
  TaskRepository,
} from "@/domain/tasks/task-repository";

const today = async () => "2026-11-06";

const stored = (date: string): EncryptedDailyCheckIn => ({
  id: `check-in-${date}`,
  userId: "user-a",
  date,
  occupyingMindCiphertext: null,
  worriesCiphertext: null,
  canControlCiphertext: null,
  canWaitCiphertext: null,
  smallHelpfulThingCiphertext: null,
  priorityTaskId: null,
  priorityTextCiphertext: null,
  createdAt: new Date("2026-11-06T01:00:00Z"),
  updatedAt: new Date("2026-11-06T01:00:00Z"),
});

// A repository holding the given check-ins, which records what it is asked. `raceOnCreate` plays
// another device that starts the same check-in just before this one.
function repository(
  initial: EncryptedDailyCheckIn[] = [],
  options: { raceOnCreate?: boolean; failCreate?: Error } = {},
) {
  const rows = [...initial];
  const calls: unknown[][] = [];
  const checkIns: DailyCheckInRepository = {
    async create(checkIn: NewEncryptedDailyCheckIn) {
      calls.push(["create", checkIn]);
      if (options.failCreate) throw options.failCreate;
      if (options.raceOnCreate) {
        rows.push(stored(checkIn.date));
        throw new ConflictError("There is already a check-in for this day.");
      }
      const row = { ...stored(checkIn.date), ...checkIn };
      rows.push(row);
      return row;
    },
    async findByDate(userId, date) {
      calls.push(["findByDate", userId, date]);
      return rows.find((r) => r.userId === userId && r.date === date) ?? null;
    },
    async list(userId) {
      calls.push(["list", userId]);
      return rows;
    },
    async update(userId, id, changes) {
      calls.push(["update", userId, id, changes]);
      return { ...stored("2026-11-06"), ...changes };
    },
  };
  return { checkIns, calls };
}

describe("getTodayCheckInRecord", () => {
  it("looks for the check-in on the user's own today", async () => {
    const { checkIns, calls } = repository([stored("2026-11-06")]);
    const record = await makeGetTodayCheckInRecord({ checkIns, today })(
      "user-a",
    );
    expect(record?.date).toBe("2026-11-06");
    expect(calls).toEqual([["findByDate", "user-a", "2026-11-06"]]);
  });

  it("is null before today's check-in starts", async () => {
    const { checkIns } = repository([stored("2026-11-05")]);
    await expect(
      makeGetTodayCheckInRecord({ checkIns, today })("user-a"),
    ).resolves.toBeNull();
  });
});

describe("startCheckInRecord", () => {
  it("resumes today's check-in instead of starting another", async () => {
    const { checkIns, calls } = repository([stored("2026-11-06")]);
    const record = await makeStartCheckInRecord({ checkIns, today })("user-a");
    expect(record.id).toBe("check-in-2026-11-06");
    expect(calls.some(([name]) => name === "create")).toBe(false);
  });

  it("starts an empty check-in on the user's own today", async () => {
    const { checkIns, calls } = repository();
    await makeStartCheckInRecord({ checkIns, today })("user-a");
    expect(calls).toContainEqual([
      "create",
      {
        userId: "user-a",
        date: "2026-11-06",
        occupyingMindCiphertext: null,
        worriesCiphertext: null,
        canControlCiphertext: null,
        canWaitCiphertext: null,
        smallHelpfulThingCiphertext: null,
        priorityTaskId: null,
        priorityTextCiphertext: null,
      },
    ]);
  });

  it("resumes the check-in another device started at the same moment", async () => {
    const { checkIns } = repository([], { raceOnCreate: true });
    const record = await makeStartCheckInRecord({ checkIns, today })("user-a");
    expect(record.date).toBe("2026-11-06");
  });

  it("passes on any other failure", async () => {
    const { checkIns } = repository([], {
      failCreate: new Error("Saving the check-in failed (XX000)"),
    });
    await expect(
      makeStartCheckInRecord({ checkIns, today })("user-a"),
    ).rejects.toThrow("Saving the check-in failed (XX000)");
  });
});

describe("updateCheckInRecord", () => {
  it("acts for the session's user", async () => {
    const { checkIns, calls } = repository();
    const edits = { worriesCiphertext: "v1.cipher" };
    await makeUpdateCheckInRecord({ checkIns })("user-a", "check-in-1", edits);
    expect(calls).toEqual([["update", "user-a", "check-in-1", edits]]);
  });
});

describe("listPastCheckInRecords", () => {
  // Tasks that exist, and the ids they were asked for.
  function tasks(existing: string[]) {
    const asked: string[] = [];
    const repository = {
      findById: async (_userId: string, id: string) => {
        asked.push(id);
        return existing.includes(id) ? ({ id } as EncryptedTask) : null;
      },
    } as unknown as TaskRepository;
    return { repository, asked };
  }

  it("lists the days before today with something written, newest first", async () => {
    const { checkIns } = repository([
      { ...stored("2026-11-06"), worriesCiphertext: "v1.today" },
      { ...stored("2026-11-05"), canWaitCiphertext: "v1.a" },
      stored("2026-11-04"),
      { ...stored("2026-11-02"), priorityTextCiphertext: "v1.b" },
    ]);
    const past = await makeListPastCheckInRecords({
      checkIns,
      tasks: tasks([]).repository,
      today,
    })("user-a");
    expect(past.checkIns.map((c) => c.date)).toEqual([
      "2026-11-05",
      "2026-11-02",
    ]);
  });

  it("reads each chosen task once, and leaves out any that no longer exist", async () => {
    const { checkIns } = repository([
      { ...stored("2026-11-05"), priorityTaskId: "task-1" },
      { ...stored("2026-11-04"), priorityTaskId: "task-1" },
      { ...stored("2026-11-03"), priorityTaskId: "task-gone" },
    ]);
    const found = tasks(["task-1"]);
    const past = await makeListPastCheckInRecords({
      checkIns,
      tasks: found.repository,
      today,
    })("user-a");
    expect(found.asked).toEqual(["task-1", "task-gone"]);
    expect(past.tasks.map((t) => t.id)).toEqual(["task-1"]);
    expect(past.checkIns).toHaveLength(3);
  });
});
