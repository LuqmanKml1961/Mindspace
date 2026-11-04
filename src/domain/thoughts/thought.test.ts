import { describe, expect, it } from "vitest";
import { ValidationError } from "@/domain/shared/errors";
import {
  createThought,
  isThoughtStatus,
  THOUGHT_CONTENT_MAX,
  THOUGHT_TITLE_MAX,
  toThoughtChanges,
  toThoughtContent,
  toThoughtTitle,
} from "@/domain/thoughts/thought";

describe("toThoughtContent", () => {
  it("trims, keeping line breaks inside", () => {
    expect(toThoughtContent("  call mum\nbuy milk \n")).toBe(
      "call mum\nbuy milk",
    );
  });

  it.each(["", "   ", "\n\t "])("rejects empty content %j", (input) => {
    expect(() => toThoughtContent(input)).toThrow(ValidationError);
  });

  it("allows exactly the limit and rejects one more", () => {
    expect(toThoughtContent("a".repeat(THOUGHT_CONTENT_MAX))).toHaveLength(
      THOUGHT_CONTENT_MAX,
    );
    expect(() => toThoughtContent("a".repeat(THOUGHT_CONTENT_MAX + 1))).toThrow(
      ValidationError,
    );
  });

  it("counts an emoji as one character, like Postgres", () => {
    expect(() =>
      toThoughtContent("😀".repeat(THOUGHT_CONTENT_MAX)),
    ).not.toThrow();
    expect(() =>
      toThoughtContent("😀".repeat(THOUGHT_CONTENT_MAX + 1)),
    ).toThrow(ValidationError);
  });
});

describe("toThoughtTitle", () => {
  it("treats a missing or blank title as none", () => {
    expect(toThoughtTitle(undefined)).toBeNull();
    expect(toThoughtTitle(null)).toBeNull();
    expect(toThoughtTitle("   ")).toBeNull();
  });

  it("trims and enforces the limit", () => {
    expect(toThoughtTitle("  Groceries  ")).toBe("Groceries");
    expect(toThoughtTitle("t".repeat(THOUGHT_TITLE_MAX))).toHaveLength(
      THOUGHT_TITLE_MAX,
    );
    expect(() => toThoughtTitle("t".repeat(THOUGHT_TITLE_MAX + 1))).toThrow(
      ValidationError,
    );
  });
});

describe("createThought", () => {
  it("starts in the inbox, with no title or category", () => {
    expect(createThought({ userId: "u1", content: " idea " })).toEqual({
      userId: "u1",
      content: "idea",
      title: null,
      categoryId: null,
      status: "inbox",
    });
  });

  it("keeps a given title, category and status", () => {
    expect(
      createThought({
        userId: "u1",
        content: "idea",
        title: "Plan",
        categoryId: "c1",
        status: "parked",
      }),
    ).toMatchObject({ title: "Plan", categoryId: "c1", status: "parked" });
  });
});

describe("toThoughtChanges", () => {
  it("validates only the fields given", () => {
    expect(toThoughtChanges({ content: " new text " })).toEqual({
      content: "new text",
    });
    expect(toThoughtChanges({ title: "  " })).toEqual({ title: null });
    expect(toThoughtChanges({ categoryId: null })).toEqual({
      categoryId: null,
    });
    expect(toThoughtChanges({})).toEqual({});
  });

  it("rejects an unknown status and empty content", () => {
    expect(() => toThoughtChanges({ status: "done" })).toThrow(ValidationError);
    expect(() => toThoughtChanges({ content: " " })).toThrow(ValidationError);
  });

  it("accepts the three statuses", () => {
    for (const status of ["inbox", "parked", "archived"]) {
      expect(isThoughtStatus(status)).toBe(true);
      expect(toThoughtChanges({ status })).toEqual({ status });
    }
  });
});
