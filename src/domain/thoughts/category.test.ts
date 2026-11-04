import { describe, expect, it } from "vitest";
import { ValidationError } from "@/domain/shared/errors";
import {
  CATEGORY_NAME_MAX,
  createCategory,
  isSameCategoryName,
  toCategoryName,
} from "@/domain/thoughts/category";

describe("isSameCategoryName", () => {
  it("ignores case and how an accent was typed", () => {
    expect(isSameCategoryName("Work", "wORK")).toBe(true);
    expect(isSameCategoryName("Café", "CAFÉ")).toBe(true);
  });

  it("tells different names apart", () => {
    expect(isSameCategoryName("Work", "Works")).toBe(false);
    expect(isSameCategoryName("Cafe", "Café")).toBe(false);
  });
});

describe("toCategoryName", () => {
  it("trims the name", () => {
    expect(toCategoryName("  Ideas ")).toBe("Ideas");
  });

  it.each(["", "   "])("rejects an empty name %j", (input) => {
    expect(() => toCategoryName(input)).toThrow(ValidationError);
  });

  it("allows exactly the limit and rejects one more", () => {
    expect(toCategoryName("n".repeat(CATEGORY_NAME_MAX))).toHaveLength(
      CATEGORY_NAME_MAX,
    );
    expect(() => toCategoryName("n".repeat(CATEGORY_NAME_MAX + 1))).toThrow(
      ValidationError,
    );
  });
});

describe("createCategory", () => {
  it("builds a validated new category", () => {
    expect(createCategory({ userId: "u1", name: " Work " })).toEqual({
      userId: "u1",
      name: "Work",
    });
  });
});
