import { describe, expect, it } from "vitest";
import {
  DEFAULT_TIMEZONE,
  shouldDetectTimezone,
  timezoneOptions,
  toTimezone,
  type Profile,
} from "@/domain/profiles/profile";
import { ValidationError } from "@/domain/shared/errors";

describe("shouldDetectTimezone", () => {
  const signedUp: Profile = {
    id: "user-a",
    displayName: null,
    timezone: "UTC",
    changedSinceSignUp: false,
  };

  it("is true only for a profile still as sign-up left it", () => {
    expect(shouldDetectTimezone(signedUp)).toBe(true);
  });

  it("leaves any zone other than the sign-up default alone", () => {
    expect(shouldDetectTimezone({ ...signedUp, timezone: "Asia/Tokyo" })).toBe(
      false,
    );
  });

  it("never overrides a saved zone, UTC included", () => {
    expect(
      shouldDetectTimezone({ ...signedUp, changedSinceSignUp: true }),
    ).toBe(false);
    expect(
      shouldDetectTimezone({
        ...signedUp,
        timezone: "Asia/Kuala_Lumpur",
        changedSinceSignUp: true,
      }),
    ).toBe(false);
  });
});

describe("toTimezone", () => {
  it("returns the canonical IANA name", () => {
    expect(toTimezone("Asia/Kuala_Lumpur")).toBe("Asia/Kuala_Lumpur");
    expect(toTimezone("asia/kuala_lumpur")).toBe("Asia/Kuala_Lumpur");
    expect(toTimezone("Etc/UTC")).toBe("UTC");
  });

  it.each(["Not/AZone", "", "  Asia/Tokyo  "])(
    "rejects %j with a ValidationError",
    (input) => {
      expect(() => toTimezone(input)).toThrow(ValidationError);
    },
  );
});

describe("timezoneOptions", () => {
  it("matches the database default, 'UTC'", () => {
    expect(DEFAULT_TIMEZONE).toBe("UTC");
  });

  it("lists UTC first, once, followed by the IANA zones", () => {
    const options = timezoneOptions();
    expect(options[0]).toBe("UTC");
    expect(options.filter((zone) => zone === "UTC")).toHaveLength(1);
    expect(options).toContain("Asia/Kuala_Lumpur");
  });
});
