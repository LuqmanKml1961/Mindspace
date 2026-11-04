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
import {
  makeCreateCategory,
  makeDeleteCategory,
  makeOpenCategories,
  makeRenameCategory,
} from "@/application/thoughts/categories";
import type {
  CategoryServer,
  ThoughtServer,
} from "@/application/thoughts/ports";
import {
  makeCaptureThought,
  makeDeleteThought,
  makeOpenThoughts,
  makeUpdateThought,
} from "@/application/thoughts/thoughts";
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "@/domain/shared/errors";
import type { EncryptedCategory } from "@/domain/thoughts/category-repository";
import type { EncryptedThought } from "@/domain/thoughts/thought-repository";

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

function memoryThoughts(): ThoughtServer & {
  records: Map<string, EncryptedThought>;
} {
  const records = new Map<string, EncryptedThought>();
  let next = 0;
  return {
    records,
    async create(input) {
      const now = new Date();
      const record = {
        ...input,
        id: `t${++next}`,
        userId: "user-a",
        createdAt: now,
        updatedAt: now,
      };
      records.set(record.id, record);
      return record;
    },
    async update(id, changes) {
      const current = records.get(id);
      if (!current) throw new NotFoundError("This thought no longer exists.");
      const record = { ...current, ...changes, updatedAt: new Date() };
      records.set(id, record);
      return record;
    },
    async delete(id) {
      if (!records.delete(id)) throw new NotFoundError("missing");
    },
  };
}

function memoryCategories(): CategoryServer & {
  records: Map<string, EncryptedCategory>;
} {
  const records = new Map<string, EncryptedCategory>();
  let next = 0;
  return {
    records,
    async create(nameCiphertext) {
      const record = {
        id: `c${++next}`,
        userId: "user-a",
        nameCiphertext,
        createdAt: new Date(),
      };
      records.set(record.id, record);
      return record;
    },
    async rename(id, nameCiphertext) {
      const current = records.get(id);
      if (!current) throw new NotFoundError("missing");
      const record = { ...current, nameCiphertext };
      records.set(id, record);
      return record;
    },
    async delete(id) {
      if (!records.delete(id)) throw new NotFoundError("missing");
    },
  };
}

function thoughtUseCases(unlocked = true) {
  const thoughts = memoryThoughts();
  const deps = { crypto: fakeCrypto, device: device(unlocked), thoughts };
  return {
    thoughts,
    capture: makeCaptureThought(deps),
    open: makeOpenThoughts(deps),
    update: makeUpdateThought(deps),
    remove: makeDeleteThought(deps),
  };
}

describe("captureThought", () => {
  it("checks the text, encrypts each field for this user, and returns the plain thought", async () => {
    const { capture, thoughts } = thoughtUseCases();
    const thought = await capture({
      userId: "user-a",
      content: "  call the dentist  ",
      title: "   ",
    });

    expect(thoughts.records.get(thought.id)).toMatchObject({
      titleCiphertext: null,
      contentCiphertext: "enc[thoughts.content:user-a]call the dentist",
      categoryId: null,
      status: "inbox",
    });
    expect(thought).toMatchObject({
      title: null,
      content: "call the dentist",
      status: "inbox",
    });
  });

  it("rejects empty text before encrypting or sending anything", async () => {
    const { capture, thoughts } = thoughtUseCases();
    await expect(capture({ userId: "user-a", content: "   " })).rejects.toThrow(
      ValidationError,
    );
    expect(thoughts.records.size).toBe(0);
  });

  it("refuses on a locked device and sends nothing", async () => {
    const { capture, thoughts } = thoughtUseCases(false);
    await expect(
      capture({ userId: "user-a", content: "an idea" }),
    ).rejects.toThrow(DeviceLockedError);
    expect(thoughts.records.size).toBe(0);
  });
});

describe("openThoughts", () => {
  it("decrypts records for display, keeping their order", async () => {
    const { capture, open, thoughts } = thoughtUseCases();
    await capture({ userId: "user-a", content: "first", title: "One" });
    await capture({ userId: "user-a", content: "second" });

    const opened = await open({
      userId: "user-a",
      records: [...thoughts.records.values()].reverse(),
    });
    expect(opened.map((t) => [t.title, t.content])).toEqual([
      [null, "second"],
      ["One", "first"],
    ]);
  });

  it("won't open text that was encrypted for another person or another field", async () => {
    const { capture, open, thoughts } = thoughtUseCases();
    const { id } = await capture({ userId: "user-a", content: "mine" });
    const record = thoughts.records.get(id)!;

    await expect(
      open({
        userId: "user-a",
        records: [
          { ...record, contentCiphertext: "enc[thoughts.content:user-b]x" },
        ],
      }),
    ).rejects.toThrow(DecryptFailedError);
    await expect(
      open({
        userId: "user-a",
        records: [{ ...record, titleCiphertext: record.contentCiphertext }],
      }),
    ).rejects.toThrow(DecryptFailedError);
  });
});

describe("updateThought", () => {
  it("encrypts only the changed text and returns the whole thought", async () => {
    const { capture, update, thoughts } = thoughtUseCases();
    const { id } = await capture({ userId: "user-a", content: "the idea" });

    const updated = await update({
      userId: "user-a",
      id,
      changes: { title: " A title " },
    });
    expect(thoughts.records.get(id)).toMatchObject({
      titleCiphertext: "enc[thoughts.title:user-a]A title",
      contentCiphertext: "enc[thoughts.content:user-a]the idea",
    });
    expect(updated).toMatchObject({ title: "A title", content: "the idea" });
  });

  it("assigns or clears a category and changes the status", async () => {
    const { capture, update } = thoughtUseCases();
    const { id } = await capture({ userId: "user-a", content: "the idea" });

    await expect(
      update({
        userId: "user-a",
        id,
        changes: { categoryId: "c1", status: "parked" },
      }),
    ).resolves.toMatchObject({ categoryId: "c1", status: "parked" });
    await expect(
      update({ userId: "user-a", id, changes: { categoryId: null } }),
    ).resolves.toMatchObject({ categoryId: null, status: "parked" });
  });

  it("checks the changes before sending them", async () => {
    const { capture, update, thoughts } = thoughtUseCases();
    const { id } = await capture({ userId: "user-a", content: "the idea" });
    const before = thoughts.records.get(id);

    await expect(
      update({ userId: "user-a", id, changes: { content: "  " } }),
    ).rejects.toThrow(ValidationError);
    await expect(
      update({ userId: "user-a", id, changes: { status: "done" as never } }),
    ).rejects.toThrow(ValidationError);
    expect(thoughts.records.get(id)).toBe(before);
  });
});

describe("deleteThought", () => {
  it("asks the server to delete it", async () => {
    const { capture, remove, thoughts } = thoughtUseCases();
    const { id } = await capture({ userId: "user-a", content: "the idea" });
    await remove({ id });
    expect(thoughts.records.size).toBe(0);
    await expect(remove({ id })).rejects.toThrow(NotFoundError);
  });
});

function categoryUseCases() {
  const categories = memoryCategories();
  const deps = { crypto: fakeCrypto, device: device(), categories };
  return {
    categories,
    open: makeOpenCategories(deps),
    create: makeCreateCategory(deps),
    rename: makeRenameCategory(deps),
    remove: makeDeleteCategory(deps),
  };
}

describe("categories", () => {
  it("are created trimmed and encrypted, and opened sorted by name", async () => {
    const { categories, create, open } = categoryUseCases();
    const work = await create({
      userId: "user-a",
      name: "  Work ",
      existing: [],
    });
    await create({ userId: "user-a", name: "Ideas", existing: [work] });

    expect(work.name).toBe("Work");
    expect(categories.records.get(work.id)?.nameCiphertext).toBe(
      "enc[categories.name:user-a]Work",
    );
    const opened = await open({
      userId: "user-a",
      records: [...categories.records.values()],
    });
    expect(opened.map((c) => c.name)).toEqual(["Ideas", "Work"]);
  });

  it("can't share a name with another category, ignoring case", async () => {
    const { categories, create, rename } = categoryUseCases();
    const work = await create({ userId: "user-a", name: "Work", existing: [] });
    const ideas = await create({
      userId: "user-a",
      name: "Ideas",
      existing: [work],
    });
    const existing = [work, ideas];

    await expect(
      create({ userId: "user-a", name: "WORK", existing }),
    ).rejects.toThrow(ConflictError);
    await expect(
      rename({ userId: "user-a", id: ideas.id, name: "work", existing }),
    ).rejects.toThrow(ConflictError);
    expect(categories.records.size).toBe(2);
    await expect(
      rename({ userId: "user-a", id: work.id, name: "WORK", existing }),
    ).resolves.toMatchObject({ id: work.id, name: "WORK" });
  });

  it("are deleted on the server", async () => {
    const { categories, create, remove } = categoryUseCases();
    const work = await create({ userId: "user-a", name: "Work", existing: [] });
    await remove({ id: work.id });
    expect(categories.records.size).toBe(0);
  });
});
