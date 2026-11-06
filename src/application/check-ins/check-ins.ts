import type { CheckInServer } from "@/application/check-ins/ports";
import { requireDeviceKey } from "@/application/encryption/device-key";
import type {
  DeviceKeyStore,
  FieldContext,
  FieldCrypto,
} from "@/application/encryption/ports";
import {
  CHECK_IN_PROMPTS,
  toCheckInChanges,
  type CheckInPrompt,
  type DailyCheckIn,
} from "@/domain/check-ins/daily-check-in";
import type {
  EncryptedDailyCheckIn,
  EncryptedDailyCheckInChanges,
} from "@/domain/check-ins/daily-check-in-repository";

// Browser side (D-021): the domain rules run here, then every answer and the written priority are
// encrypted with this device's key before they go to the server, and decrypted when they come
// back. Each one is bound to its own column, so an answer can't be moved to another prompt.

type Deps = { crypto: FieldCrypto; device: DeviceKeyStore };

const ANSWERS = {
  occupyingMind: {
    column: "occupying_mind",
    stored: "occupyingMindCiphertext",
  },
  worries: { column: "worries", stored: "worriesCiphertext" },
  canControl: { column: "can_control", stored: "canControlCiphertext" },
  canWait: { column: "can_wait", stored: "canWaitCiphertext" },
  smallHelpfulThing: {
    column: "small_helpful_thing",
    stored: "smallHelpfulThingCiphertext",
  },
} as const satisfies Record<
  CheckInPrompt,
  { column: string; stored: keyof EncryptedDailyCheckIn }
>;

const PRIORITY_TEXT_COLUMN = "priority_text";

const field = (column: string, userId: string): FieldContext => ({
  table: "daily_checkins",
  column,
  userId,
});

// Decrypts against the signed-in user's id, so a record that isn't theirs can't open.
async function openCheckIn(
  crypto: FieldCrypto,
  key: CryptoKey,
  userId: string,
  record: EncryptedDailyCheckIn,
): Promise<DailyCheckIn> {
  const open = (ciphertext: string | null, column: string) =>
    ciphertext === null
      ? Promise.resolve(null)
      : crypto.decrypt(key, ciphertext, field(column, userId));
  const answer = (prompt: CheckInPrompt) =>
    open(record[ANSWERS[prompt].stored], ANSWERS[prompt].column);
  const [
    occupyingMind,
    worries,
    canControl,
    canWait,
    smallHelpfulThing,
    priorityText,
  ] = await Promise.all([
    answer("occupyingMind"),
    answer("worries"),
    answer("canControl"),
    answer("canWait"),
    answer("smallHelpfulThing"),
    open(record.priorityTextCiphertext, PRIORITY_TEXT_COLUMN),
  ]);
  return {
    id: record.id,
    userId: record.userId,
    date: record.date,
    occupyingMind,
    worries,
    canControl,
    canWait,
    smallHelpfulThing,
    priorityTaskId: record.priorityTaskId,
    priorityText,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

// Records from a Server Component, decrypted for display. Throws DecryptFailedError.
export function makeOpenCheckIns(deps: Deps) {
  return async ({
    userId,
    records,
  }: {
    userId: string;
    records: EncryptedDailyCheckIn[];
  }): Promise<DailyCheckIn[]> => {
    const key = await requireDeviceKey(deps.device, userId);
    return Promise.all(
      records.map((record) => openCheckIn(deps.crypto, key, userId, record)),
    );
  };
}

// Resumes today's check-in, or starts an empty one. The device must be unlocked first, so a
// locked device never starts one it can't fill in.
export function makeStartCheckIn(deps: Deps & { checkIns: CheckInServer }) {
  return async ({ userId }: { userId: string }): Promise<DailyCheckIn> => {
    const key = await requireDeviceKey(deps.device, userId);
    return openCheckIn(deps.crypto, key, userId, await deps.checkIns.start());
  };
}

// Saves answers (blank means skipped) and sets the day's priority: a task or written words,
// never both. Only what is given changes.
export function makeUpdateCheckIn(deps: Deps & { checkIns: CheckInServer }) {
  return async ({
    userId,
    id,
    changes,
  }: {
    userId: string;
    id: string;
    changes: {
      answers?: Partial<Record<CheckInPrompt, string | null>>;
      priority?: { taskId?: string | null; text?: string | null };
    };
  }): Promise<DailyCheckIn> => {
    const valid = toCheckInChanges(changes);
    const key = await requireDeviceKey(deps.device, userId);
    const seal = (text: string | null, column: string) =>
      text === null
        ? Promise.resolve(null)
        : deps.crypto.encrypt(key, text, field(column, userId));

    const edits: EncryptedDailyCheckInChanges = {};
    for (const prompt of CHECK_IN_PROMPTS) {
      const answer = valid[prompt];
      if (answer !== undefined) {
        edits[ANSWERS[prompt].stored] = await seal(
          answer,
          ANSWERS[prompt].column,
        );
      }
    }
    if (valid.priorityTaskId !== undefined) {
      edits.priorityTaskId = valid.priorityTaskId;
    }
    if (valid.priorityText !== undefined) {
      edits.priorityTextCiphertext = await seal(
        valid.priorityText,
        PRIORITY_TEXT_COLUMN,
      );
    }

    const record = await deps.checkIns.update(id, edits);
    return openCheckIn(deps.crypto, key, userId, record);
  };
}
