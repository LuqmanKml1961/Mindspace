import { describe, expect, it } from "vitest";
import { UnlockFailedError } from "@/application/encryption/errors";
import type {
  DeviceKeyStore,
  FieldContext,
  KeyServer,
} from "@/application/encryption/ports";
import { makeRecoverWithCode } from "@/application/encryption/recover-with-code";
import { userKeysSchema } from "@/application/encryption/schemas";
import { makeSetUpEncryption } from "@/application/encryption/set-up-encryption";
import { makeUnlockDevice } from "@/application/encryption/unlock-device";
import type { UserKeys } from "@/domain/encryption/user-keys";
import {
  decryptField,
  encryptField,
  webKeyCrypto,
} from "@/infrastructure/crypto/web-crypto";

// The real Web Crypto module through the real use cases; only the stores are in memory.

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
      server.stored = keys;
    },
    async replace(keys: UserKeys) {
      server.stored = keys;
    },
  };
  return server;
}

const field: FieldContext = {
  table: "thoughts",
  column: "content",
  userId: "user-a",
};

describe("encryption flow with real Web Crypto", () => {
  it("sets up, unlocks a new device, and recovers with the code", async () => {
    const server = memoryServer();
    const laptop = memoryDevice();
    const crypto = webKeyCrypto;

    const { recoveryCode } = await makeSetUpEncryption({
      crypto,
      server,
      device: laptop,
    })({ userId: "user-a", passphrase: "calm river morning" });

    // What the server receives passes the same checks as the Server Action.
    expect(userKeysSchema.safeParse(server.stored).success).toBe(true);
    const laptopKey = laptop.keys.get("user-a")!;
    expect(laptopKey.extractable).toBe(false);
    const stored = await encryptField(laptopKey, "a private thought", field);

    // A new phone unlocks with the passphrase and reads the same thought.
    const phone = memoryDevice();
    const unlock = makeUnlockDevice({ crypto, device: phone });
    await unlock({
      userId: "user-a",
      keys: server.stored!,
      passphrase: "calm river morning",
    });
    await expect(
      decryptField(phone.keys.get("user-a")!, stored, field),
    ).resolves.toBe("a private thought");

    // Forgotten passphrase: the recovery code sets a new one and gives a new code, and the same
    // text still opens.
    const tablet = memoryDevice();
    const recover = makeRecoverWithCode({ crypto, server, device: tablet });
    const { recoveryCode: newCode } = await recover({
      userId: "user-a",
      keys: server.stored!,
      recoveryCode: recoveryCode.toUpperCase(),
      newPassphrase: "a brand new passphrase",
    });
    expect(newCode).not.toBe(recoveryCode);
    expect(userKeysSchema.safeParse(server.stored).success).toBe(true);
    expect(tablet.keys.get("user-a")!.extractable).toBe(false);
    await expect(
      decryptField(tablet.keys.get("user-a")!, stored, field),
    ).resolves.toBe("a private thought");

    await expect(
      unlock({
        userId: "user-a",
        keys: server.stored!,
        passphrase: "calm river morning",
      }),
    ).rejects.toThrow(UnlockFailedError);
    await expect(
      unlock({
        userId: "user-a",
        keys: server.stored!,
        passphrase: "a brand new passphrase",
      }),
    ).resolves.toBeUndefined();

    // The used code no longer works; the new one does, and still opens the same text.
    await expect(
      recover({
        userId: "user-a",
        keys: server.stored!,
        recoveryCode,
        newPassphrase: "another new passphrase",
      }),
    ).rejects.toThrow(UnlockFailedError);
    const watch = memoryDevice();
    await makeRecoverWithCode({ crypto, server, device: watch })({
      userId: "user-a",
      keys: server.stored!,
      recoveryCode: newCode,
      newPassphrase: "another new passphrase",
    });
    await expect(
      decryptField(watch.keys.get("user-a")!, stored, field),
    ).resolves.toBe("a private thought");
    // About a dozen PBKDF2 derivations at 600,000 iterations: slower than the 5 s default
    // when other test files run alongside.
  }, 30_000);
});
