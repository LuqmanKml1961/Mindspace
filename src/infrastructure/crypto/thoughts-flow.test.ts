import { describe, expect, it } from "vitest";
import { DecryptFailedError } from "@/application/encryption/errors";
import type { DeviceKeyStore } from "@/application/encryption/ports";
import {
  makeCreateCategory,
  makeOpenCategories,
} from "@/application/thoughts/categories";
import type {
  CategoryServer,
  EncryptedThoughtInput,
  ThoughtServer,
} from "@/application/thoughts/ports";
import {
  categoryNameCiphertextSchema,
  thoughtInputSchema,
} from "@/application/thoughts/schemas";
import {
  makeCaptureThought,
  makeOpenThoughts,
} from "@/application/thoughts/thoughts";
import type { EncryptedCategory } from "@/domain/thoughts/category-repository";
import type { EncryptedThought } from "@/domain/thoughts/thought-repository";
import {
  generateDataKey,
  toDeviceKey,
  webFieldCrypto,
} from "@/infrastructure/crypto/web-crypto";

// The real Web Crypto module through the Brain Dump use cases; only the server is in memory.

async function unlockedDevice(): Promise<DeviceKeyStore> {
  const key = await toDeviceKey(await generateDataKey());
  return {
    save: async () => {},
    load: async (userId) => (userId === "user-a" ? key : null),
    clear: async () => {},
  };
}

function recordingThoughts(): ThoughtServer & {
  sent: EncryptedThoughtInput[];
} {
  const sent: EncryptedThoughtInput[] = [];
  return {
    sent,
    async create(input) {
      sent.push(input);
      const now = new Date();
      return {
        ...input,
        id: "t1",
        userId: "user-a",
        createdAt: now,
        updatedAt: now,
      };
    },
    update: async () => {
      throw new Error("not used");
    },
    delete: async () => {},
  };
}

describe("Brain Dump with real Web Crypto", () => {
  it("sends only well-formed ciphertext and opens it again on the device", async () => {
    const device = await unlockedDevice();
    const thoughts = recordingThoughts();
    const deps = { crypto: webFieldCrypto, device, thoughts };

    const captured = await makeCaptureThought(deps)({
      userId: "user-a",
      title: "Dentist",
      content: "Call the dentist about the crown 🦷",
    });

    const [sent] = thoughts.sent;
    expect(thoughtInputSchema.safeParse(sent).success).toBe(true);
    expect(JSON.stringify(sent)).not.toMatch(/dentist|crown|🦷/i);

    const record: EncryptedThought = {
      ...sent,
      id: captured.id,
      userId: "user-a",
      createdAt: captured.createdAt,
      updatedAt: captured.updatedAt,
    };
    const open = makeOpenThoughts(deps);
    await expect(
      open({ userId: "user-a", records: [record] }),
    ).resolves.toEqual([captured]);

    // Moved between fields, or opened as someone else: refused.
    await expect(
      open({
        userId: "user-a",
        records: [{ ...record, titleCiphertext: record.contentCiphertext }],
      }),
    ).rejects.toThrow(DecryptFailedError);
    const otherDevice: DeviceKeyStore = {
      ...device,
      load: async () => device.load("user-a"),
    };
    await expect(
      makeOpenThoughts({ crypto: webFieldCrypto, device: otherDevice })({
        userId: "user-b",
        records: [record],
      }),
    ).rejects.toThrow(DecryptFailedError);
  });

  it("encrypts category names the server accepts, and opens them", async () => {
    const device = await unlockedDevice();
    const stored: EncryptedCategory[] = [];
    const categories: CategoryServer = {
      async create(nameCiphertext) {
        const record = {
          id: `c${stored.length + 1}`,
          userId: "user-a",
          nameCiphertext,
          createdAt: new Date(),
        };
        stored.push(record);
        return record;
      },
      rename: async () => {
        throw new Error("not used");
      },
      delete: async () => {},
    };
    const deps = { crypto: webFieldCrypto, device, categories };

    await makeCreateCategory(deps)({
      userId: "user-a",
      name: "😀".repeat(50),
      existing: [],
    });
    expect(
      categoryNameCiphertextSchema.safeParse(stored[0].nameCiphertext).success,
    ).toBe(true);
    await expect(
      makeOpenCategories(deps)({ userId: "user-a", records: stored }),
    ).resolves.toMatchObject([{ name: "😀".repeat(50) }]);
  });
});
