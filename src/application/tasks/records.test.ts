import { describe, expect, it } from "vitest";
import {
  makeCompleteTask,
  makeCreateTaskRecord,
  makeGetToday,
  makeListTaskRecords,
  makeReopenTask,
  makeUpdateTaskRecord,
  RECENTLY_COMPLETED_DAYS,
} from "@/application/tasks/records";
import {
  makeAddReminder,
  makeDismissReminder,
  makeListReminderRecords,
} from "@/application/tasks/reminders";
import type { Profile } from "@/domain/profiles/profile";
import type { ProfileRepository } from "@/domain/profiles/profile-repository";
import { ValidationError } from "@/domain/shared/errors";
import type { Reminder } from "@/domain/tasks/reminder";
import type { ReminderRepository } from "@/domain/tasks/reminder-repository";
import type { TaskRepository } from "@/domain/tasks/task-repository";

// The server's use cases record what they pass to the repositories, always for the session's user.
function recording() {
  const calls: unknown[][] = [];
  const record =
    (name: string) =>
    async (...args: unknown[]) => {
      calls.push([name, ...args]);
      return args;
    };
  return {
    calls,
    tasks: {
      create: record("create"),
      findById: record("findById"),
      list: record("list"),
      update: record("update"),
      delete: record("delete"),
    } as unknown as TaskRepository,
    reminders: {
      create: record("create"),
      listActive: record("listActive"),
      dismiss: record("dismiss"),
    } as unknown as ReminderRepository,
  };
}

function profiles(timezone: string | null): ProfileRepository {
  return {
    findById: async (id): Promise<Profile | null> =>
      timezone === null
        ? null
        : { id, displayName: null, timezone, changedSinceSignUp: true },
    updateTimezone: async () => {},
  };
}

// 2026-11-05 16:30 UTC is already 2026-11-06 in Kuala Lumpur (UTC+8).
const now = new Date("2026-11-05T16:30:00Z");
const clock = () => now;

const encryptedTask = {
  titleCiphertext: "v1.cipher",
  notesCiphertext: null,
  dueDate: "2026-11-06",
  dueTime: "09:30",
  priority: "normal" as const,
  sourceThoughtId: null,
};

describe("getToday", () => {
  it("is the date in the user's own time zone, or UTC without a profile", async () => {
    await expect(
      makeGetToday({ profiles: profiles("Asia/Kuala_Lumpur"), clock })(
        "user-a",
      ),
    ).resolves.toBe("2026-11-06");
    await expect(
      makeGetToday({ profiles: profiles(null), clock })("user-a"),
    ).resolves.toBe("2026-11-05");
  });
});

describe("listTaskRecords", () => {
  it("uses today in the user's own time zone for Today and Upcoming", async () => {
    const { calls, tasks } = recording();
    const list = makeListTaskRecords({
      tasks,
      profiles: profiles("Asia/Kuala_Lumpur"),
      clock,
    });
    await list("user-a", "today");
    await list("user-a", "upcoming");
    expect(calls).toEqual([
      ["list", "user-a", { view: "today", today: "2026-11-06" }],
      ["list", "user-a", { view: "upcoming", today: "2026-11-06" }],
    ]);
  });

  it("falls back to UTC when there is no profile", async () => {
    const { calls, tasks } = recording();
    const list = makeListTaskRecords({
      tasks,
      profiles: profiles(null),
      clock,
    });
    await list("user-a", "today");
    expect(calls).toEqual([
      ["list", "user-a", { view: "today", today: "2026-11-05" }],
    ]);
  });

  it("looks back a fixed number of days for Completed, and needs no date for No date", async () => {
    const { calls, tasks } = recording();
    const list = makeListTaskRecords({
      tasks,
      profiles: profiles("UTC"),
      clock,
    });
    await list("user-a", "completed");
    await list("user-a", "noDate");
    expect(RECENTLY_COMPLETED_DAYS).toBe(7);
    expect(calls).toEqual([
      [
        "list",
        "user-a",
        { view: "completed", since: new Date("2026-10-29T16:30:00Z") },
      ],
      ["list", "user-a", { view: "noDate" }],
    ]);
  });
});

describe("task records", () => {
  it("store a new task for the session's user, after checking its date and time", async () => {
    const { calls, tasks } = recording();
    const create = makeCreateTaskRecord({ tasks });
    await create("user-a", encryptedTask);
    expect(calls).toEqual([["create", { ...encryptedTask, userId: "user-a" }]]);

    await expect(
      create("user-a", { ...encryptedTask, dueDate: "2026-02-30" }),
    ).rejects.toThrow(new ValidationError("Choose a real date."));
    await expect(
      create("user-a", { ...encryptedTask, dueDate: null }),
    ).rejects.toThrow(new ValidationError("Add a date for this time."));
    expect(calls).toHaveLength(1);
  });

  it("check an edited date and time, and pass other edits through", async () => {
    const { calls, tasks } = recording();
    const update = makeUpdateTaskRecord({ tasks });
    await update("user-a", "task-1", { priority: "high" });
    await update("user-a", "task-1", { dueDate: "2026-12-01", dueTime: null });
    await expect(
      update("user-a", "task-1", { dueDate: "2026-13-01", dueTime: null }),
    ).rejects.toThrow(new ValidationError("Choose a real date."));
    expect(calls).toEqual([
      ["update", "user-a", "task-1", { priority: "high" }],
      ["update", "user-a", "task-1", { dueDate: "2026-12-01", dueTime: null }],
    ]);
  });

  it("complete with the server's clock, and reopen", async () => {
    const { calls, tasks } = recording();
    await makeCompleteTask({ tasks, clock })("user-a", "task-1");
    await makeReopenTask({ tasks })("user-a", "task-1");
    expect(calls).toEqual([
      ["update", "user-a", "task-1", { completedAt: now }],
      ["update", "user-a", "task-1", { completedAt: null }],
    ]);
  });
});

describe("reminders (server)", () => {
  it("adds a checked reminder for the session's user", async () => {
    const { calls, reminders } = recording();
    const add = makeAddReminder({ reminders });
    const remindAt = new Date("2026-11-06T01:00:00Z");
    await add("user-a", { taskId: "task-1", remindAt });
    expect(calls).toEqual([
      ["create", { userId: "user-a", taskId: "task-1", remindAt }],
    ]);

    await expect(
      add("user-a", { taskId: "task-1", remindAt: new Date("nope") }),
    ).rejects.toThrow(ValidationError);
    expect(calls).toHaveLength(1);
  });

  it("dismisses with the server's clock", async () => {
    const { calls, reminders } = recording();
    await makeDismissReminder({ reminders, clock })("user-a", "reminder-1");
    expect(calls).toEqual([["dismiss", "user-a", "reminder-1", now]]);
  });

  it("lists active reminders with their open tasks, leaving out completed and missing ones", async () => {
    const reminder = (id: string, taskId: string): Reminder => ({
      id,
      userId: "user-a",
      taskId,
      remindAt: now,
      dismissedAt: null,
      createdAt: now,
    });
    const reminders = {
      listActive: async () => [
        reminder("r1", "t-open"),
        reminder("r2", "t-done"),
        reminder("r3", "t-open"),
        reminder("r4", "t-gone"),
      ],
    } as unknown as ReminderRepository;
    const reads: string[] = [];
    const tasks = {
      findById: async (_userId: string, id: string) => {
        reads.push(id);
        if (id === "t-open") return { id, completedAt: null };
        if (id === "t-done") return { id, completedAt: now };
        return null;
      },
    } as unknown as TaskRepository;

    const result = await makeListReminderRecords({ reminders, tasks })(
      "user-a",
    );
    expect(result.reminders.map((r) => r.id)).toEqual(["r1", "r3"]);
    expect(result.tasks.map((t) => t.id)).toEqual(["t-open"]);
    expect(reads.sort()).toEqual(["t-done", "t-gone", "t-open"]);
  });
});
