import { describe, expect, it } from "vitest";
import {
  makeOpenCheckIns,
  makeStartCheckIn,
  makeUpdateCheckIn,
} from "@/application/check-ins/check-ins";
import type { CheckInServer } from "@/application/check-ins/ports";
import {
  DecryptFailedError,
  DeviceLockedError,
} from "@/application/encryption/errors";
import type {
  DeviceKeyStore,
  FieldContext,
  FieldCrypto,
} from "@/application/encryption/ports";
import type {
  EncryptedDailyCheckIn,
  EncryptedDailyCheckInChanges,
} from "@/domain/check-ins/daily-check-in-repository";
import { ValidationError } from "@/domain/shared/errors";

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
const sealed = (column: string, text: string) =>
  `enc[daily_checkins.${column}:user-a]${text}`;

const key = {} as CryptoKey;
function device(unlocked = true): DeviceKeyStore {
  return {
    save: async () => {},
    load: async (userId) => (unlocked && userId === "user-a" ? key : null),
    clear: async () => {},
  };
}

const empty: EncryptedDailyCheckIn = {
  id: "check-in-1",
  userId: "user-a",
  date: "2026-11-06",
  occupyingMindCiphertext: null,
  worriesCiphertext: null,
  canControlCiphertext: null,
  canWaitCiphertext: null,
  smallHelpfulThingCiphertext: null,
  priorityTaskId: null,
  priorityTextCiphertext: null,
  createdAt: new Date("2026-11-06T01:00:00Z"),
  updatedAt: new Date("2026-11-06T01:00:00Z"),
};

// Today's check-in on a fake server, which records what it is sent.
function memoryServer(): CheckInServer & {
  record: EncryptedDailyCheckIn;
  starts: number;
  edits: EncryptedDailyCheckInChanges[];
} {
  const server = {
    record: { ...empty },
    starts: 0,
    edits: [] as EncryptedDailyCheckInChanges[],
    async start() {
      server.starts += 1;
      return server.record;
    },
    async update(_id: string, edits: EncryptedDailyCheckInChanges) {
      server.edits.push(edits);
      server.record = { ...server.record, ...edits };
      return server.record;
    },
  };
  return server;
}

describe("openCheckIns", () => {
  it("decrypts every answer and the written priority for its own column", async () => {
    const open = makeOpenCheckIns({ crypto: fakeCrypto, device: device() });
    const [checkIn] = await open({
      userId: "user-a",
      records: [
        {
          ...empty,
          occupyingMindCiphertext: sealed("occupying_mind", "The move"),
          worriesCiphertext: sealed("worries", "Money"),
          canControlCiphertext: sealed("can_control", "My reply"),
          canWaitCiphertext: sealed("can_wait", "The garage"),
          smallHelpfulThingCiphertext: sealed("small_helpful_thing", "A walk"),
          priorityTextCiphertext: sealed("priority_text", "Call the movers"),
        },
      ],
    });
    expect(checkIn).toEqual({
      id: "check-in-1",
      userId: "user-a",
      date: "2026-11-06",
      occupyingMind: "The move",
      worries: "Money",
      canControl: "My reply",
      canWait: "The garage",
      smallHelpfulThing: "A walk",
      priorityTaskId: null,
      priorityText: "Call the movers",
      createdAt: empty.createdAt,
      updatedAt: empty.updatedAt,
    });
  });

  it("refuses an answer moved to another prompt", async () => {
    const open = makeOpenCheckIns({ crypto: fakeCrypto, device: device() });
    await expect(
      open({
        userId: "user-a",
        records: [{ ...empty, worriesCiphertext: sealed("can_wait", "x") }],
      }),
    ).rejects.toThrow(DecryptFailedError);
  });

  it("needs this device to be unlocked", async () => {
    const open = makeOpenCheckIns({
      crypto: fakeCrypto,
      device: device(false),
    });
    await expect(open({ userId: "user-a", records: [empty] })).rejects.toThrow(
      DeviceLockedError,
    );
  });
});

describe("startCheckIn", () => {
  it("resumes or starts today's check-in, opened for display", async () => {
    const server = memoryServer();
    server.record = {
      ...empty,
      canWaitCiphertext: sealed("can_wait", "The garage"),
    };
    const start = makeStartCheckIn({
      crypto: fakeCrypto,
      device: device(),
      checkIns: server,
    });
    await expect(start({ userId: "user-a" })).resolves.toMatchObject({
      date: "2026-11-06",
      canWait: "The garage",
      worries: null,
    });
  });

  it("starts nothing on a locked device", async () => {
    const server = memoryServer();
    const start = makeStartCheckIn({
      crypto: fakeCrypto,
      device: device(false),
      checkIns: server,
    });
    await expect(start({ userId: "user-a" })).rejects.toThrow(
      DeviceLockedError,
    );
    expect(server.starts).toBe(0);
  });
});

describe("updateCheckIn", () => {
  function setup() {
    const server = memoryServer();
    const update = makeUpdateCheckIn({
      crypto: fakeCrypto,
      device: device(),
      checkIns: server,
    });
    return { server, update };
  }

  it("encrypts only the answers given, each for its own column, and skips blank ones", async () => {
    const { server, update } = setup();
    const checkIn = await update({
      userId: "user-a",
      id: "check-in-1",
      changes: { answers: { occupyingMind: " The move ", worries: "  " } },
    });
    expect(server.edits).toEqual([
      {
        occupyingMindCiphertext: sealed("occupying_mind", "The move"),
        worriesCiphertext: null,
      },
    ]);
    expect(checkIn).toMatchObject({ occupyingMind: "The move", worries: null });
  });

  it("sets a written priority, encrypted, and clears the task", async () => {
    const { server, update } = setup();
    await update({
      userId: "user-a",
      id: "check-in-1",
      changes: { priority: { text: "Call the movers" } },
    });
    expect(server.edits).toEqual([
      {
        priorityTaskId: null,
        priorityTextCiphertext: sealed("priority_text", "Call the movers"),
      },
    ]);
  });

  it("sets a task as the priority, and clears the written one", async () => {
    const { server, update } = setup();
    const checkIn = await update({
      userId: "user-a",
      id: "check-in-1",
      changes: { priority: { taskId: "task-1" } },
    });
    expect(server.edits).toEqual([
      { priorityTaskId: "task-1", priorityTextCiphertext: null },
    ]);
    expect(checkIn).toMatchObject({
      priorityTaskId: "task-1",
      priorityText: null,
    });
  });

  it("sends nothing when a rule is broken", async () => {
    const { server, update } = setup();
    await expect(
      update({
        userId: "user-a",
        id: "check-in-1",
        changes: { priority: { taskId: "task-1", text: "Rest" } },
      }),
    ).rejects.toThrow(ValidationError);
    await expect(
      update({
        userId: "user-a",
        id: "check-in-1",
        changes: { answers: { worries: "a".repeat(2_001) } },
      }),
    ).rejects.toThrow(ValidationError);
    expect(server.edits).toEqual([]);
  });

  it("sends nothing from a locked device", async () => {
    const server = memoryServer();
    const update = makeUpdateCheckIn({
      crypto: fakeCrypto,
      device: device(false),
      checkIns: server,
    });
    await expect(
      update({
        userId: "user-a",
        id: "check-in-1",
        changes: { answers: { worries: "Money" } },
      }),
    ).rejects.toThrow(DeviceLockedError);
    expect(server.edits).toEqual([]);
  });
});
