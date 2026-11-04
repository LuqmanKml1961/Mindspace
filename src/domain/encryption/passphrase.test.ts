import { describe, expect, it } from "vitest";
import {
  PASSPHRASE_MAX,
  PASSPHRASE_MIN,
  toPassphrase,
} from "@/domain/encryption/passphrase";
import { ValidationError } from "@/domain/shared/errors";

describe("toPassphrase", () => {
  it("accepts 12 characters or more, unchanged (spaces kept)", () => {
    expect(toPassphrase("calm river 1")).toBe("calm river 1");
    expect(toPassphrase(" calm river morning ")).toBe(" calm river morning ");
  });

  it.each(["", "short", "eleven char", " ".repeat(20)])(
    "rejects %j",
    (input) => {
      expect(() => toPassphrase(input)).toThrow(ValidationError);
    },
  );

  it("counts characters, so 12 emoji are enough and 11 are not", () => {
    expect(() => toPassphrase("😀".repeat(PASSPHRASE_MIN))).not.toThrow();
    expect(() => toPassphrase("😀".repeat(PASSPHRASE_MIN - 1))).toThrow(
      ValidationError,
    );
  });

  it("rejects absurdly long input", () => {
    expect(() => toPassphrase("a".repeat(PASSPHRASE_MAX + 1))).toThrow(
      ValidationError,
    );
  });
});
