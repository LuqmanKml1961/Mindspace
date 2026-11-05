import { describe, expect, it } from "vitest";
import {
  DecryptFailedError,
  DeviceLockedError,
} from "@/application/encryption/errors";
import type {
  DeviceKeyStore,
  FieldContext,
  FieldCrypto,
} from "@/application/encryption/ports";
import type { TaskServer } from "@/application/tasks/ports";
import {
  makeCreateTask,
  makeDeleteTask,
  makeOpenTasks,
  makeUpdateTask,
} from "@/application/tasks/tasks";
import { NotFoundError, ValidationError } from "@/domain/shared/errors";
import type { EncryptedTask } from "@/domain/tasks/task-repository";

// Fake field crypto: the "ciphertext" names the field it was made for, and only opens there.
const tag = (field: FieldContext) =>
  `enc[${field.table}.${field.column}:${field.userId}]`;
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

function memoryTasks(): TaskServer & {
  records: Map<string, EncryptedTask>;
  edits: unknown[];
} {
  const records = new Map<string, EncryptedTask>();
  const edits: unknown[] = [];
  let next = 0;
  return {
    records,
    edits,
    async create(input) {
      const now = new Date();
      const record: EncryptedTask = {
        ...input,
        id: `task-${++next}`,
        userId: "user-a",
        completedAt: null,
        createdAt: now,
        updatedAt: now,
      };
      records.set(record.id, record);
      return record;
    },
    async update(id, changes) {
      edits.push(changes);
      const current = records.get(id);
      if (!current) throw new NotFoundError("This task no longer exists.");
      const record = { ...current, ...changes, updatedAt: new Date() };
      records.set(id, record);
      return record;
    },
    async delete(id) {
      if (!records.delete(id)) throw new NotFoundError("missing");
    },
  };
}

function useCases(unlocked = true) {
  const tasks = memoryTasks();
  const deps = { crypto: fakeCrypto, device: device(unlocked), tasks };
  return {
    tasks,
    create: makeCreateTask(deps),
    update: makeUpdateTask(deps),
    open: makeOpenTasks(deps),
    remove: makeDeleteTask(deps),
  };
}

describe("tasks (browser)", () => {
  it("creates a task with its title and notes encrypted for their own fields", async () => {
    const { tasks, create } = useCases();
    const task = await create({
      userId: "user-a",
      title: "  Renew passport ",
      notes: "Photos first",
      dueDate: "2026-11-20",
      dueTime: "10:00",
      priority: "high",
      sourceThoughtId: "thought-1",
    });

    expect(task).toMatchObject({
      title: "Renew passport",
      notes: "Photos first",
      dueDate: "2026-11-20",
      dueTime: "10:00",
      priority: "high",
      completedAt: null,
      sourceThoughtId: "thought-1",
    });
    const stored = tasks.records.get(task.id);
    expect(stored?.titleCiphertext).toBe(
      "enc[tasks.title:user-a]Renew passport",
    );
    expect(stored?.notesCiphertext).toBe("enc[tasks.notes:user-a]Photos first");
  });

  it("sends no notes when there are none, and defaults the rest", async () => {
    const { tasks, create } = useCases();
    const task = await create({ userId: "user-a", title: "Call mum" });
    expect(tasks.records.get(task.id)).toMatchObject({
      notesCiphertext: null,
      dueDate: null,
      dueTime: null,
      priority: "normal",
      sourceThoughtId: null,
    });
  });

  it("checks the rules before anything is encrypted or sent", async () => {
    const { tasks, create } = useCases();
    await expect(create({ userId: "user-a", title: "  " })).rejects.toThrow(
      ValidationError,
    );
    await expect(
      create({ userId: "user-a", title: "Call", dueTime: "09:00" }),
    ).rejects.toThrow(new ValidationError("Add a date for this time."));
    expect(tasks.records.size).toBe(0);
  });

  it("needs this device to be unlocked", async () => {
    const { tasks, create } = useCases(false);
    await expect(create({ userId: "user-a", title: "Call" })).rejects.toThrow(
      DeviceLockedError,
    );
    expect(tasks.records.size).toBe(0);
  });

  it("sends only the edited fields, encrypting text and keeping date and time together", async () => {
    const { tasks, create, update } = useCases();
    const task = await create({
      userId: "user-a",
      title: "Old",
      notes: "Keep me",
      dueDate: "2026-11-20",
      dueTime: "10:00",
    });

    const edited = await update({
      userId: "user-a",
      id: task.id,
      changes: { title: "New", due: { date: null, time: null } },
    });

    expect(tasks.edits.at(-1)).toEqual({
      titleCiphertext: "enc[tasks.title:user-a]New",
      dueDate: null,
      dueTime: null,
    });
    expect(edited).toMatchObject({
      title: "New",
      notes: "Keep me",
      dueDate: null,
      dueTime: null,
    });
  });

  it("clears notes and changes priority", async () => {
    const { tasks, create, update } = useCases();
    const task = await create({ userId: "user-a", title: "T", notes: "N" });
    await update({
      userId: "user-a",
      id: task.id,
      changes: { notes: "  ", priority: "low" },
    });
    expect(tasks.edits.at(-1)).toEqual({
      notesCiphertext: null,
      priority: "low",
    });
  });

  it("refuses an edit that breaks a rule, without sending it", async () => {
    const { tasks, create, update } = useCases();
    const task = await create({ userId: "user-a", title: "T" });
    await expect(
      update({
        userId: "user-a",
        id: task.id,
        changes: { due: { date: null, time: "08:00" } },
      }),
    ).rejects.toThrow(new ValidationError("Add a date for this time."));
    expect(tasks.edits).toHaveLength(0);
  });

  it("opens the user's own records and refuses anyone else's", async () => {
    const { tasks, create, open } = useCases();
    const task = await create({ userId: "user-a", title: "Mine", notes: "N" });
    const record = tasks.records.get(task.id)!;

    const [opened] = await open({ userId: "user-a", records: [record] });
    expect(opened).toMatchObject({ title: "Mine", notes: "N" });

    const theirs = {
      ...record,
      titleCiphertext: "enc[tasks.title:user-b]Theirs",
    };
    await expect(open({ userId: "user-a", records: [theirs] })).rejects.toThrow(
      DecryptFailedError,
    );
  });

  it("deletes through the server", async () => {
    const { tasks, create, remove } = useCases();
    const task = await create({ userId: "user-a", title: "Gone soon" });
    await remove({ id: task.id });
    expect(tasks.records.size).toBe(0);
  });
});
