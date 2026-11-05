import { describe, expect, it } from "vitest";
import type { EncryptedThoughtInput } from "@/application/thoughts/ports";
import {
  makeCreateCategoryRecord,
  makeCreateThoughtRecord,
  makeDeleteThoughtRecord,
  makeGetInboxPreview,
  makeListThoughtRecords,
  makeUpdateThoughtRecord,
} from "@/application/thoughts/records";
import type { CategoryRepository } from "@/domain/thoughts/category-repository";
import type { ThoughtRepository } from "@/domain/thoughts/thought-repository";

// The server's use cases pass through to the repositories, always for the session's user.
function recordingRepository() {
  const calls: unknown[][] = [];
  const record =
    (name: string) =>
    async (...args: unknown[]) => {
      calls.push([name, ...args]);
      return args[0];
    };
  return {
    calls,
    thoughts: {
      create: record("create"),
      findById: record("findById"),
      list: record("list"),
      listNewest: record("listNewest"),
      update: record("update"),
      delete: record("delete"),
    } as unknown as ThoughtRepository,
    categories: {
      create: record("create"),
      list: record("list"),
      rename: record("rename"),
      delete: record("delete"),
    } as unknown as CategoryRepository,
  };
}

describe("record use cases", () => {
  it("store new records for the session's user, ignoring any user id sent with them", async () => {
    const repo = recordingRepository();
    const sent = {
      titleCiphertext: null,
      contentCiphertext: "v1.x",
      categoryId: null,
      status: "inbox",
      userId: "someone-else",
    } as EncryptedThoughtInput;

    await makeCreateThoughtRecord(repo)("session-user", sent);
    await makeCreateCategoryRecord(repo)("session-user", "v1.y");

    expect(repo.calls).toEqual([
      ["create", { ...sent, userId: "session-user" }],
      ["create", { userId: "session-user", nameCiphertext: "v1.y" }],
    ]);
  });

  it("scope reads and writes to the session's user", async () => {
    const repo = recordingRepository();
    await makeListThoughtRecords(repo)("session-user", { status: "parked" });
    await makeGetInboxPreview(repo)("session-user", 3);
    await makeUpdateThoughtRecord(repo)("session-user", "t1", {
      status: "archived",
    });
    await makeDeleteThoughtRecord(repo)("session-user", "t1");

    expect(repo.calls).toEqual([
      ["list", "session-user", { status: "parked" }],
      ["listNewest", "session-user", { status: "inbox" }, 3],
      ["update", "session-user", "t1", { status: "archived" }],
      ["delete", "session-user", "t1"],
    ]);
  });
});
