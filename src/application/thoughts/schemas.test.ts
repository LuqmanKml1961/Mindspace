import { describe, expect, it } from "vitest";
import { ciphertextMaxLength } from "@/application/encryption/ciphertext";
import {
  categoryNameCiphertextSchema,
  thoughtChangesSchema,
  thoughtInputSchema,
} from "@/application/thoughts/schemas";

// A well-formed ciphertext of a given total length ("v1." + 16-char IV + "." + base64 body).
const cipher = (length: number) =>
  `v1.${"A".repeat(16)}.${"A".repeat(length - 20)}`;

const valid = {
  titleCiphertext: null,
  contentCiphertext: cipher(44),
  categoryId: "8d6a2f43-4a8b-4c55-9a1e-2f3c4d5e6f70",
  status: "inbox",
};

describe("ciphertextMaxLength", () => {
  it("matches the database maximums for content, title and category name", () => {
    expect(ciphertextMaxLength(10_000)).toBe(53_376);
    expect(ciphertextMaxLength(200)).toBe(1_108);
    expect(ciphertextMaxLength(50)).toBe(308);
  });
});

describe("thoughtInputSchema", () => {
  it("accepts well-formed ciphertext up to the maximum, and drops a user id", () => {
    const parsed = thoughtInputSchema.parse({
      ...valid,
      titleCiphertext: cipher(1_108),
      contentCiphertext: cipher(53_376),
      userId: "someone-else",
    });
    expect(parsed).not.toHaveProperty("userId");
  });

  it.each([
    [
      "plaintext content",
      { ...valid, contentCiphertext: "my private thought" },
    ],
    ["plaintext title", { ...valid, titleCiphertext: "a private title" }],
    [
      "content over the maximum",
      { ...valid, contentCiphertext: cipher(53_380) },
    ],
    ["a title over the maximum", { ...valid, titleCiphertext: cipher(1_112) }],
    [
      "another version",
      { ...valid, contentCiphertext: `v2${cipher(44).slice(2)}` },
    ],
    ["a category id that isn't a uuid", { ...valid, categoryId: "c1" }],
    ["an unknown status", { ...valid, status: "done" }],
  ])("rejects %s", (_label, input) => {
    expect(thoughtInputSchema.safeParse(input).success).toBe(false);
  });
});

describe("thoughtChangesSchema", () => {
  it("accepts any subset of the fields, each checked the same way", () => {
    expect(thoughtChangesSchema.safeParse({}).success).toBe(true);
    expect(thoughtChangesSchema.safeParse({ status: "parked" }).success).toBe(
      true,
    );
    expect(
      thoughtChangesSchema.safeParse({ contentCiphertext: "plain" }).success,
    ).toBe(false);
  });
});

describe("categoryNameCiphertextSchema", () => {
  it("accepts up to 308 characters of ciphertext, and nothing else", () => {
    expect(categoryNameCiphertextSchema.safeParse(cipher(308)).success).toBe(
      true,
    );
    expect(categoryNameCiphertextSchema.safeParse(cipher(312)).success).toBe(
      false,
    );
    expect(categoryNameCiphertextSchema.safeParse("Work").success).toBe(false);
  });
});
