import { describe, expect, it } from "vitest";
import {
  DecryptFailedError,
  UnlockFailedError,
} from "@/application/encryption/errors";
import type { FieldContext } from "@/application/encryption/ports";
import {
  createRecoveryCode,
  decryptField,
  encryptField,
  generateDataKey,
  PBKDF2_ITERATIONS,
  toDeviceKey,
  unwrapWithPassphrase,
  unwrapWithRecoveryCode,
  wrapWithPassphrase,
  wrapWithRecoveryCode,
} from "@/infrastructure/crypto/web-crypto";

const content: FieldContext = {
  table: "thoughts",
  column: "content",
  userId: "user-a",
};
const FORMAT = /^v1\.[A-Za-z0-9+/]{16}\.[A-Za-z0-9+/]+=*$/;

describe("field encryption", () => {
  it("round-trips text, including emoji and line breaks", async () => {
    const key = await generateDataKey();
    const text = "call mum 😀\nbuy milk";
    const stored = await encryptField(key, text, content);
    expect(stored).toMatch(FORMAT);
    expect(stored).not.toContain("mum");
    await expect(decryptField(key, stored, content)).resolves.toBe(text);
  });

  it("uses a fresh IV every time, so equal texts never look equal", async () => {
    const key = await generateDataKey();
    const ivs = new Set<string>();
    for (let i = 0; i < 500; i++) {
      ivs.add((await encryptField(key, "same", content)).split(".")[1]);
    }
    expect(ivs.size).toBe(500);
  });

  it("matches the maximum size in DATA_MODEL (10,000 four-byte characters)", async () => {
    const key = await generateDataKey();
    const stored = await encryptField(key, "😀".repeat(10_000), content);
    expect(stored).toHaveLength(53_376);
  });

  it("rejects a ciphertext moved to another field or person", async () => {
    const key = await generateDataKey();
    const stored = await encryptField(key, "private", content);
    await expect(
      decryptField(key, stored, { ...content, column: "title" }),
    ).rejects.toThrow(DecryptFailedError);
    await expect(
      decryptField(key, stored, { ...content, userId: "user-b" }),
    ).rejects.toThrow(DecryptFailedError);
  });

  it("rejects tampered or malformed ciphertext, and the wrong key", async () => {
    const key = await generateDataKey();
    const stored = await encryptField(key, "private", content);
    const [v, iv, ct] = stored.split(".");
    const flipped = ct[0] === "A" ? `B${ct.slice(1)}` : `A${ct.slice(1)}`;
    for (const bad of [
      `${v}.${iv}.${flipped}`,
      `v2.${iv}.${ct}`,
      `${v}.${iv}`,
      `${v}.@@@.${ct}`,
      `${v}.${iv}.${ct}.extra`,
    ]) {
      await expect(decryptField(key, bad, content)).rejects.toThrow(
        DecryptFailedError,
      );
    }
    await expect(
      decryptField(await generateDataKey(), stored, content),
    ).rejects.toThrow(DecryptFailedError);
  });
});

describe("passphrase wrapping", () => {
  it("stores 600,000 iterations and a 16-byte salt", async () => {
    const wrapped = await wrapWithPassphrase(
      await generateDataKey(),
      "calm river morning",
    );
    expect(PBKDF2_ITERATIONS).toBe(600_000);
    expect(wrapped.iterations).toBe(600_000);
    expect(atob(wrapped.salt)).toHaveLength(16);
  });

  it("unlocks with the right passphrase only, as a non-extractable key", async () => {
    const dataKey = await generateDataKey();
    const stored = await encryptField(dataKey, "private", content);
    const wrapped = await wrapWithPassphrase(dataKey, "calm river morning");

    const unlocked = await unwrapWithPassphrase(wrapped, "calm river morning");
    await expect(decryptField(unlocked, stored, content)).resolves.toBe(
      "private",
    );
    expect(unlocked.extractable).toBe(false);
    await expect(crypto.subtle.exportKey("raw", unlocked)).rejects.toThrow();

    await expect(
      unwrapWithPassphrase(wrapped, "calm river evening"),
    ).rejects.toThrow(UnlockFailedError);
  });

  it("treats composed and decomposed accents as the same passphrase", async () => {
    const dataKey = await generateDataKey();
    const wrapped = await wrapWithPassphrase(dataKey, "café by the river");
    await expect(
      unwrapWithPassphrase(wrapped, "café by the river"),
    ).resolves.toBeDefined();
  });
});

describe("device key", () => {
  it("is a non-extractable copy that still decrypts", async () => {
    const dataKey = await generateDataKey();
    const stored = await encryptField(dataKey, "private", content);
    const deviceKey = await toDeviceKey(dataKey);
    expect(deviceKey.extractable).toBe(false);
    await expect(crypto.subtle.exportKey("raw", deviceKey)).rejects.toThrow();
    await expect(decryptField(deviceKey, stored, content)).resolves.toBe(
      "private",
    );
  });
});

describe("recovery code", () => {
  it("unwraps an extractable key, so a new passphrase can wrap it again", async () => {
    const dataKey = await generateDataKey();
    const code = createRecoveryCode();
    const recovered = await unwrapWithRecoveryCode(
      await wrapWithRecoveryCode(dataKey, code),
      code,
    );
    expect(recovered.extractable).toBe(true);
    const rewrapped = await wrapWithPassphrase(
      recovered,
      "a new calm passphrase",
    );
    await expect(
      unwrapWithPassphrase(rewrapped, "a new calm passphrase"),
    ).resolves.toBeDefined();
  });

  it("is 32 hex digits in groups of 4, different each time", () => {
    const code = createRecoveryCode();
    expect(code).toMatch(/^([0-9a-f]{4}-){7}[0-9a-f]{4}$/);
    expect(createRecoveryCode()).not.toBe(code);
  });

  it("unlocks as typed (any case or spacing), and only the right code", async () => {
    const dataKey = await generateDataKey();
    const stored = await encryptField(dataKey, "private", content);
    const code = createRecoveryCode();
    const wrapped = await wrapWithRecoveryCode(dataKey, code);

    const typed = code.toUpperCase().replaceAll("-", " ");
    const unlocked = await unwrapWithRecoveryCode(wrapped, typed);
    await expect(decryptField(unlocked, stored, content)).resolves.toBe(
      "private",
    );

    await expect(
      unwrapWithRecoveryCode(wrapped, createRecoveryCode()),
    ).rejects.toThrow(UnlockFailedError);
    await expect(unwrapWithRecoveryCode(wrapped, "not a code")).rejects.toThrow(
      UnlockFailedError,
    );
  });
});
