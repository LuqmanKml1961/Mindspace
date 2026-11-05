import { requireDeviceKey } from "@/application/encryption/device-key";
import type {
  DeviceKeyStore,
  FieldContext,
  FieldCrypto,
} from "@/application/encryption/ports";
import type { EncryptedTaskEdits, TaskServer } from "@/application/tasks/ports";
import {
  createTask,
  toTaskChanges,
  type Task,
  type TaskPriority,
} from "@/domain/tasks/task";
import type { EncryptedTask } from "@/domain/tasks/task-repository";

// Browser side (D-021): the domain rules run here, then the title and notes are encrypted with
// this device's key before they go to the server, and decrypted when they come back.

type Deps = { crypto: FieldCrypto; device: DeviceKeyStore };

const titleField = (userId: string): FieldContext => ({
  table: "tasks",
  column: "title",
  userId,
});

const notesField = (userId: string): FieldContext => ({
  table: "tasks",
  column: "notes",
  userId,
});

function withText(
  record: EncryptedTask,
  title: string,
  notes: string | null,
): Task {
  return {
    id: record.id,
    userId: record.userId,
    title,
    notes,
    dueDate: record.dueDate,
    dueTime: record.dueTime,
    priority: record.priority,
    completedAt: record.completedAt,
    sourceThoughtId: record.sourceThoughtId,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

// Decrypts against the signed-in user's id, so a record that isn't theirs can't open.
async function openTask(
  crypto: FieldCrypto,
  key: CryptoKey,
  userId: string,
  record: EncryptedTask,
): Promise<Task> {
  const title = await crypto.decrypt(
    key,
    record.titleCiphertext,
    titleField(userId),
  );
  const notes =
    record.notesCiphertext === null
      ? null
      : await crypto.decrypt(key, record.notesCiphertext, notesField(userId));
  return withText(record, title, notes);
}

function sealNotes(
  crypto: FieldCrypto,
  key: CryptoKey,
  userId: string,
  notes: string | null,
): Promise<string | null> {
  return notes === null
    ? Promise.resolve(null)
    : crypto.encrypt(key, notes, notesField(userId));
}

// Records from a Server Component, decrypted for display. Throws DecryptFailedError.
export function makeOpenTasks(deps: Deps) {
  return async ({
    userId,
    records,
  }: {
    userId: string;
    records: EncryptedTask[];
  }): Promise<Task[]> => {
    const key = await requireDeviceKey(deps.device, userId);
    return Promise.all(
      records.map((record) => openTask(deps.crypto, key, userId, record)),
    );
  };
}

export function makeCreateTask(deps: Deps & { tasks: TaskServer }) {
  return async (props: {
    userId: string;
    title: string;
    notes?: string | null;
    dueDate?: string | null;
    dueTime?: string | null;
    priority?: TaskPriority;
    sourceThoughtId?: string | null;
  }): Promise<Task> => {
    const task = createTask(props);
    const key = await requireDeviceKey(deps.device, props.userId);
    const record = await deps.tasks.create({
      titleCiphertext: await deps.crypto.encrypt(
        key,
        task.title,
        titleField(props.userId),
      ),
      notesCiphertext: await sealNotes(
        deps.crypto,
        key,
        props.userId,
        task.notes,
      ),
      dueDate: task.dueDate,
      dueTime: task.dueTime,
      priority: task.priority,
      sourceThoughtId: task.sourceThoughtId,
    });
    return withText(record, task.title, task.notes);
  };
}

// Edits the title, notes, due date and time (always together), and priority.
export function makeUpdateTask(deps: Deps & { tasks: TaskServer }) {
  return async ({
    userId,
    id,
    changes,
  }: {
    userId: string;
    id: string;
    changes: {
      title?: string;
      notes?: string | null;
      due?: { date: string | null; time: string | null };
      priority?: TaskPriority;
    };
  }): Promise<Task> => {
    const valid = toTaskChanges(changes);
    const key = await requireDeviceKey(deps.device, userId);
    const edits: EncryptedTaskEdits = {};
    if (valid.title !== undefined) {
      edits.titleCiphertext = await deps.crypto.encrypt(
        key,
        valid.title,
        titleField(userId),
      );
    }
    if (valid.notes !== undefined) {
      edits.notesCiphertext = await sealNotes(
        deps.crypto,
        key,
        userId,
        valid.notes,
      );
    }
    if (valid.dueDate !== undefined) edits.dueDate = valid.dueDate;
    if (valid.dueTime !== undefined) edits.dueTime = valid.dueTime;
    if (valid.priority !== undefined) edits.priority = valid.priority;

    const record = await deps.tasks.update(id, edits);
    return openTask(deps.crypto, key, userId, record);
  };
}

export function makeDeleteTask(deps: { tasks: TaskServer }) {
  return ({ id }: { id: string }) => deps.tasks.delete(id);
}
