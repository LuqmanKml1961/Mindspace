import { describe, expect, it } from "vitest";
import {
  makeForgetDevice,
  makeGetDeviceKey,
} from "@/application/encryption/device-key";
import { UnlockFailedError } from "@/application/encryption/errors";
import type {
  DeviceKeyStore,
  KeyCrypto,
  KeyServer,
} from "@/application/encryption/ports";
import { makeRecoverWithCode } from "@/application/encryption/recover-with-code";
import { userKeysSchema } from "@/application/encryption/schemas";
import { makeSetUpEncryption } from "@/application/encryption/set-up-encryption";
import { makeUnlockDevice } from "@/application/encryption/unlock-device";
import type { UserKeys } from "@/domain/encryption/user-keys";
import { ConflictError, ValidationError } from "@/domain/shared/errors";

// Fakes: a "key" is an id plus extractability; wrapping records which secret locks it.
type FakeKey = { id: string; extractable: boolean };
const asKey = (key: FakeKey) => key as unknown as CryptoKey;
const asFake = (key: CryptoKey) => key as unknown as FakeKey;

function fakeCrypto(): KeyCrypto {
  let next = 0;
  const unwrap = (
    wrappedKey: string,
    expected: string,
    extractable: boolean,
  ) => {
    const [id, secret] = wrappedKey.split("|");
    if (secret !== expected) throw new UnlockFailedError();
    return asKey({ id, extractable });
  };
  const wrap = (key: CryptoKey, secret: string) => ({
    salt: "salt",
    iterations: 600_000,
    wrappedKey: `${asFake(key).id}|${secret}`,
  });
  return {
    generateDataKey: async () =>
      asKey({ id: `key-${++next}`, extractable: true }),
    toDeviceKey: async (key) =>
      asKey({ id: asFake(key).id, extractable: false }),
    wrapWithPassphrase: async (key, passphrase) => wrap(key, `p:${passphrase}`),
    unwrapWithPassphrase: async (wrapped, passphrase) =>
      unwrap(wrapped.wrappedKey, `p:${passphrase}`, false),
    createRecoveryCode: () => "recovery-code",
    wrapWithRecoveryCode: async (key, code) => wrap(key, `r:${code}`),
    unwrapWithRecoveryCode: async (wrapped, code) =>
      unwrap(wrapped.wrappedKey, `r:${code}`, true),
  };
}

function memoryDevice(): DeviceKeyStore & { keys: Map<string, CryptoKey> } {
  const keys = new Map<string, CryptoKey>();
  return {
    keys,
    save: async (userId, key) => void keys.set(userId, key),
    load: async (userId) => keys.get(userId) ?? null,
    clear: async () => keys.clear(),
  };
}

function memoryServer(): KeyServer & { stored: UserKeys | null } {
  const server = {
    stored: null as UserKeys | null,
    async create(keys: UserKeys) {
      if (server.stored) throw new ConflictError("already set up");
      server.stored = keys;
    },
    async replacePassphraseKey(wrapped: UserKeys["passphrase"]) {
      server.stored = { ...server.stored!, passphrase: wrapped };
    },
  };
  return server;
}

const passphrase = "calm river morning";

async function setUp() {
  const deps = {
    crypto: fakeCrypto(),
    server: memoryServer(),
    device: memoryDevice(),
  };
  const { recoveryCode } = await makeSetUpEncryption(deps)({
    userId: "user-a",
    passphrase,
  });
  return { ...deps, recoveryCode, keys: deps.server.stored! };
}

describe("setUpEncryption", () => {
  it("stores both wrapped copies and keeps a non-extractable key on the device", async () => {
    const { server, device, recoveryCode } = await setUp();
    expect(recoveryCode).toBe("recovery-code");
    expect(server.stored?.version).toBe(1);
    expect(server.stored?.passphrase.wrappedKey).toBe(`key-1|p:${passphrase}`);
    expect(server.stored?.recovery.wrappedKey).toBe("key-1|r:recovery-code");
    expect(asFake(device.keys.get("user-a")!)).toEqual({
      id: "key-1",
      extractable: false,
    });
  });

  it("rejects a short passphrase before doing anything", async () => {
    const server = memoryServer();
    const device = memoryDevice();
    const setUpEncryption = makeSetUpEncryption({
      crypto: fakeCrypto(),
      server,
      device,
    });
    await expect(
      setUpEncryption({ userId: "user-a", passphrase: "too short" }),
    ).rejects.toThrow(ValidationError);
    expect(server.stored).toBeNull();
    expect(device.keys.size).toBe(0);
  });

  it("keeps nothing on the device if the server refuses", async () => {
    const device = memoryDevice();
    const failingServer: KeyServer = {
      create: async () => {
        throw new ConflictError("already set up");
      },
      replacePassphraseKey: async () => {},
    };
    await expect(
      makeSetUpEncryption({
        crypto: fakeCrypto(),
        server: failingServer,
        device,
      })({
        userId: "user-a",
        passphrase,
      }),
    ).rejects.toThrow(ConflictError);
    expect(device.keys.size).toBe(0);
  });
});

describe("unlockDevice", () => {
  it("keeps the unlocked key on a new device", async () => {
    const { crypto, keys } = await setUp();
    const newDevice = memoryDevice();
    await makeUnlockDevice({ crypto, device: newDevice })({
      userId: "user-a",
      keys,
      passphrase,
    });
    expect(asFake(newDevice.keys.get("user-a")!)).toEqual({
      id: "key-1",
      extractable: false,
    });
  });

  it("refuses a wrong passphrase and keeps nothing", async () => {
    const { crypto, keys } = await setUp();
    const newDevice = memoryDevice();
    await expect(
      makeUnlockDevice({ crypto, device: newDevice })({
        userId: "user-a",
        keys,
        passphrase: "wrong passphrase",
      }),
    ).rejects.toThrow(UnlockFailedError);
    expect(newDevice.keys.size).toBe(0);
  });
});

describe("recoverWithCode", () => {
  it("wraps the same key with a new passphrase and keeps it on the device", async () => {
    const { crypto, server, keys, recoveryCode } = await setUp();
    const newDevice = memoryDevice();
    await makeRecoverWithCode({ crypto, server, device: newDevice })({
      userId: "user-a",
      keys,
      recoveryCode,
      newPassphrase: "a brand new passphrase",
    });
    expect(server.stored?.passphrase.wrappedKey).toBe(
      "key-1|p:a brand new passphrase",
    );
    expect(server.stored?.recovery).toEqual(keys.recovery);
    expect(asFake(newDevice.keys.get("user-a")!).extractable).toBe(false);
  });

  it("changes nothing with a wrong code or a short new passphrase", async () => {
    const { crypto, server, keys, recoveryCode } = await setUp();
    const newDevice = memoryDevice();
    const recover = makeRecoverWithCode({ crypto, server, device: newDevice });

    await expect(
      recover({
        userId: "user-a",
        keys,
        recoveryCode: "wrong-code",
        newPassphrase: "a brand new passphrase",
      }),
    ).rejects.toThrow(UnlockFailedError);
    await expect(
      recover({ userId: "user-a", keys, recoveryCode, newPassphrase: "short" }),
    ).rejects.toThrow(ValidationError);

    expect(server.stored).toEqual(keys);
    expect(newDevice.keys.size).toBe(0);
  });
});

describe("device key", () => {
  it("is read back, and forgotten at sign-out", async () => {
    const { device } = await setUp();
    await expect(
      makeGetDeviceKey({ device })("user-a"),
    ).resolves.not.toBeNull();
    await makeForgetDevice({ device })();
    await expect(makeGetDeviceKey({ device })("user-a")).resolves.toBeNull();
  });
});

describe("userKeysSchema", () => {
  const wrapped = {
    salt: `${"A".repeat(22)}==`,
    iterations: 600_000,
    wrappedKey: `${"A".repeat(54)}==`,
  };
  const valid = { version: 1, passphrase: wrapped, recovery: wrapped };

  it("accepts well-formed wrapped keys", () => {
    expect(userKeysSchema.safeParse(valid).success).toBe(true);
  });

  it.each([
    [
      "fewer iterations",
      { ...valid, passphrase: { ...wrapped, iterations: 599_999 } },
    ],
    [
      "a malformed salt",
      { ...valid, recovery: { ...wrapped, salt: "not base64" } },
    ],
    [
      "a short wrapped key",
      { ...valid, passphrase: { ...wrapped, wrappedKey: "AAAA" } },
    ],
    ["another version", { ...valid, version: 2 }],
  ])("rejects %s", (_label, input) => {
    expect(userKeysSchema.safeParse(input).success).toBe(false);
  });
});
