import { requireDeviceKey } from "@/application/encryption/device-key";
import type {
  DeviceKeyStore,
  FieldContext,
  FieldCrypto,
} from "@/application/encryption/ports";
import type { ThoughtServer } from "@/application/thoughts/ports";
import {
  createThought,
  toThoughtChanges,
  type Thought,
  type ThoughtStatus,
} from "@/domain/thoughts/thought";
import type {
  EncryptedThought,
  EncryptedThoughtChanges,
} from "@/domain/thoughts/thought-repository";

// Browser side (D-021): the domain rules run here, then the text is encrypted with this
// device's key before it goes to the server, and decrypted when it comes back.

type Deps = { crypto: FieldCrypto; device: DeviceKeyStore };

const titleField = (userId: string): FieldContext => ({
  table: "thoughts",
  column: "title",
  userId,
});

const contentField = (userId: string): FieldContext => ({
  table: "thoughts",
  column: "content",
  userId,
});

function withText(
  record: EncryptedThought,
  title: string | null,
  content: string,
): Thought {
  return {
    id: record.id,
    userId: record.userId,
    title,
    content,
    categoryId: record.categoryId,
    status: record.status,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

// Decrypts against the signed-in user's id, so a record that isn't theirs can't open.
async function openThought(
  crypto: FieldCrypto,
  key: CryptoKey,
  userId: string,
  record: EncryptedThought,
): Promise<Thought> {
  const title =
    record.titleCiphertext === null
      ? null
      : await crypto.decrypt(key, record.titleCiphertext, titleField(userId));
  const content = await crypto.decrypt(
    key,
    record.contentCiphertext,
    contentField(userId),
  );
  return withText(record, title, content);
}

// Records from a Server Component, decrypted for display. Throws DecryptFailedError.
export function makeOpenThoughts(deps: Deps) {
  return async ({
    userId,
    records,
  }: {
    userId: string;
    records: EncryptedThought[];
  }): Promise<Thought[]> => {
    const key = await requireDeviceKey(deps.device, userId);
    return Promise.all(
      records.map((record) => openThought(deps.crypto, key, userId, record)),
    );
  };
}

export function makeCaptureThought(deps: Deps & { thoughts: ThoughtServer }) {
  return async ({
    userId,
    content,
    title,
    categoryId,
  }: {
    userId: string;
    content: string;
    title?: string | null;
    categoryId?: string | null;
  }): Promise<Thought> => {
    const thought = createThought({ userId, content, title, categoryId });
    const key = await requireDeviceKey(deps.device, userId);
    const record = await deps.thoughts.create({
      titleCiphertext:
        thought.title === null
          ? null
          : await deps.crypto.encrypt(key, thought.title, titleField(userId)),
      contentCiphertext: await deps.crypto.encrypt(
        key,
        thought.content,
        contentField(userId),
      ),
      categoryId: thought.categoryId,
      status: thought.status,
    });
    return withText(record, thought.title, thought.content);
  };
}

// Also assigns or clears a category (categoryId).
export function makeUpdateThought(deps: Deps & { thoughts: ThoughtServer }) {
  return async ({
    userId,
    id,
    changes,
  }: {
    userId: string;
    id: string;
    changes: {
      content?: string;
      title?: string | null;
      categoryId?: string | null;
      status?: ThoughtStatus;
    };
  }): Promise<Thought> => {
    const valid = toThoughtChanges(changes);
    const key = await requireDeviceKey(deps.device, userId);
    const encrypted: EncryptedThoughtChanges = {};
    if (valid.title !== undefined) {
      encrypted.titleCiphertext =
        valid.title === null
          ? null
          : await deps.crypto.encrypt(key, valid.title, titleField(userId));
    }
    if (valid.content !== undefined) {
      encrypted.contentCiphertext = await deps.crypto.encrypt(
        key,
        valid.content,
        contentField(userId),
      );
    }
    if (valid.categoryId !== undefined) {
      encrypted.categoryId = valid.categoryId;
    }
    if (valid.status !== undefined) encrypted.status = valid.status;

    const record = await deps.thoughts.update(id, encrypted);
    return openThought(deps.crypto, key, userId, record);
  };
}

export function makeDeleteThought(deps: { thoughts: ThoughtServer }) {
  return ({ id }: { id: string }) => deps.thoughts.delete(id);
}
