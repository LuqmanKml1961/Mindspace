import { describe, expect, it } from "vitest";
import { makeExportAccount } from "@/application/account/export";
import type { AccountAdmin, AccountRecords } from "@/application/account/ports";
import {
  makeDeleteAccount,
  makeGetAccountRecords,
} from "@/application/account/records";
import { deleteAccountConfirmationSchema } from "@/application/account/schemas";
import {
  DecryptFailedError,
  DeviceLockedError,
} from "@/application/encryption/errors";
import type {
  DeviceKeyStore,
  FieldContext,
  FieldCrypto,
} from "@/application/encryption/ports";
import type { DailyCheckInRepository } from "@/domain/check-ins/daily-check-in-repository";
import type { ProfileRepository } from "@/domain/profiles/profile-repository";
import type { ReminderRepository } from "@/domain/tasks/reminder-repository";
import type { TaskRepository } from "@/domain/tasks/task-repository";
import type { CategoryRepository } from "@/domain/thoughts/category-repository";
import type { ThoughtRepository } from "@/domain/thoughts/thought-repository";

// Fake field crypto: the "ciphertext" names the field it was made for, and only opens there.
const tag = (field: FieldContext) =>
  `enc[${field.table}.${field.column}:${field.userId}]`;
const sealed = (table: string, column: string, text: string) =>
  `${tag({ table, column, userId: "user-a" })}${text}`;
const fakeCrypto: FieldCrypto = {
  encrypt: async (_key, plaintext, field) => `${tag(field)}${plaintext}`,
  decrypt: async (_key, ciphertext, field) => {
    if (!ciphertext.startsWith(tag(field))) throw new DecryptFailedError();
    return ciphertext.slice(tag(field).length);
  },
};

const key = {} as CryptoKey;
function device(unlocked = true): DeviceKeyStore {
  return {
    save: async () => {},
    load: async (userId) => (unlocked && userId === "user-a" ? key : null),
    clear: async () => {},
  };
}

const at = new Date("2026-11-10T01:00:00Z");

const records: AccountRecords = {
  profile: {
    id: "user-a",
    displayName: null,
    timezone: "Asia/Kuala_Lumpur",
    changedSinceSignUp: true,
  },
  categories: [
    {
      id: "category-1",
      userId: "user-a",
      nameCiphertext: sealed("categories", "name", "Home admin"),
      createdAt: at,
    },
  ],
  thoughts: [
    {
      id: "thought-1",
      userId: "user-a",
      titleCiphertext: null,
      contentCiphertext: sealed("thoughts", "content", "Call the landlord"),
      categoryId: "category-1",
      status: "archived",
      createdAt: at,
      updatedAt: at,
    },
  ],
  tasks: [
    {
      id: "task-1",
      userId: "user-a",
      titleCiphertext: sealed("tasks", "title", "Pay rent"),
      notesCiphertext: sealed("tasks", "notes", "Before Friday"),
      dueDate: "2026-11-14",
      dueTime: null,
      priority: "high",
      completedAt: at,
      sourceThoughtId: "thought-1",
      createdAt: at,
      updatedAt: at,
    },
  ],
  reminders: [
    {
      id: "reminder-1",
      userId: "user-a",
      taskId: "task-1",
      remindAt: at,
      dismissedAt: at,
      createdAt: at,
    },
  ],
  checkIns: [
    {
      id: "check-in-1",
      userId: "user-a",
      date: "2026-11-09",
      occupyingMindCiphertext: sealed(
        "daily_checkins",
        "occupying_mind",
        "Moving house",
      ),
      worriesCiphertext: null,
      canControlCiphertext: null,
      canWaitCiphertext: null,
      smallHelpfulThingCiphertext: null,
      priorityTaskId: null,
      priorityTextCiphertext: sealed(
        "daily_checkins",
        "priority_text",
        "Pack the kitchen",
      ),
      createdAt: at,
      updatedAt: at,
    },
  ],
};

describe("getAccountRecords", () => {
  it("reads every row the user owns, in every status and view", async () => {
    const calls: unknown[][] = [];
    const record =
      (name: string, value: unknown) =>
      async (...args: unknown[]) => {
        calls.push([name, ...args]);
        return value;
      };
    const getRecords = makeGetAccountRecords({
      profiles: {
        findById: record("profile", records.profile),
      } as unknown as ProfileRepository,
      categories: {
        list: record("categories", records.categories),
      } as unknown as CategoryRepository,
      thoughts: {
        list: record("thoughts", records.thoughts),
      } as unknown as ThoughtRepository,
      tasks: {
        listAll: record("tasks", records.tasks),
      } as unknown as TaskRepository,
      reminders: {
        listAll: record("reminders", records.reminders),
      } as unknown as ReminderRepository,
      checkIns: {
        list: record("checkIns", records.checkIns),
      } as unknown as DailyCheckInRepository,
    });

    expect(await getRecords("user-a")).toEqual(records);
    // No filter on thoughts: every status and category.
    expect(calls).toEqual([
      ["profile", "user-a"],
      ["categories", "user-a"],
      ["thoughts", "user-a"],
      ["tasks", "user-a"],
      ["reminders", "user-a"],
      ["checkIns", "user-a"],
    ]);
  });
});

describe("deleteAccount", () => {
  it("deletes the sign-in record, then signs this browser out", async () => {
    const steps: string[] = [];
    const deleteAccount = makeDeleteAccount({
      accounts: {
        deleteUser: async (userId) => {
          steps.push(`delete ${userId}`);
        },
      },
      auth: {
        signOut: async () => {
          steps.push("sign out");
        },
      },
    });

    await deleteAccount("user-a");
    expect(steps).toEqual(["delete user-a", "sign out"]);
  });

  it("stays signed in when the deletion fails, so it can be tried again", async () => {
    const steps: string[] = [];
    const accounts: AccountAdmin = {
      deleteUser: async () => {
        throw new Error("Deleting the account failed (500)");
      },
    };
    const deleteAccount = makeDeleteAccount({
      accounts,
      auth: {
        signOut: async () => {
          steps.push("sign out");
        },
      },
    });

    await expect(deleteAccount("user-a")).rejects.toThrow("(500)");
    expect(steps).toEqual([]);
  });
});

describe("exportAccount", () => {
  it("decrypts every field on this device and keeps the rest as stored", async () => {
    const exportAccount = makeExportAccount({
      crypto: fakeCrypto,
      device: device(),
      server: { records: async () => records },
    });

    const data = await exportAccount({ userId: "user-a", now: at });

    expect(data.version).toBe(1);
    expect(data.exportedAt).toBe("2026-11-10T01:00:00.000Z");
    expect(data.profile?.timezone).toBe("Asia/Kuala_Lumpur");
    expect(data.categories.map((c) => c.name)).toEqual(["Home admin"]);
    expect(data.thoughts.map((t) => [t.content, t.status])).toEqual([
      ["Call the landlord", "archived"],
    ]);
    expect(data.tasks.map((t) => [t.title, t.notes, t.completedAt])).toEqual([
      ["Pay rent", "Before Friday", at],
    ]);
    expect(data.reminders).toEqual(records.reminders);
    expect(data.checkIns.map((c) => [c.occupyingMind, c.priorityText])).toEqual(
      [["Moving house", "Pack the kitchen"]],
    );
    expect(JSON.stringify(data)).not.toContain("enc[");
  });

  it("fails on a locked device before asking the server", async () => {
    let asked = false;
    const exportAccount = makeExportAccount({
      crypto: fakeCrypto,
      device: device(false),
      server: {
        records: async () => {
          asked = true;
          return records;
        },
      },
    });

    await expect(exportAccount({ userId: "user-a", now: at })).rejects.toThrow(
      DeviceLockedError,
    );
    expect(asked).toBe(false);
  });
});

describe("deleteAccountConfirmationSchema", () => {
  it("accepts the word delete, in any case and with spaces around it", () => {
    for (const typed of ["delete", " Delete ", "DELETE"]) {
      expect(deleteAccountConfirmationSchema.safeParse(typed).success).toBe(
        true,
      );
    }
  });

  it("rejects anything else", () => {
    for (const typed of ["", "delet", "delete my account", "yes", 1, null]) {
      expect(deleteAccountConfirmationSchema.safeParse(typed).success).toBe(
        false,
      );
    }
  });
});
