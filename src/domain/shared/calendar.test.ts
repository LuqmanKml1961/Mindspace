import { describe, expect, it } from "vitest";
import { addDays, dateInTimeZone } from "@/domain/shared/calendar";

describe("addDays", () => {
  it("moves across months, years and leap days", () => {
    expect(addDays("2026-11-05", 1)).toBe("2026-11-06");
    expect(addDays("2026-11-30", 1)).toBe("2026-12-01");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("is unaffected by daylight saving, since dates have no time zone", () => {
    expect(addDays("2026-03-07", 1)).toBe("2026-03-08");
    expect(addDays("2026-03-08", 1)).toBe("2026-03-09");
  });
});

const at = (iso: string) => new Date(iso);

describe("dateInTimeZone", () => {
  it("turns over at local midnight, not UTC midnight (Kuala Lumpur, UTC+8)", () => {
    const zone = "Asia/Kuala_Lumpur";
    expect(dateInTimeZone(at("2026-11-05T15:59:59Z"), zone)).toBe("2026-11-05");
    expect(dateInTimeZone(at("2026-11-05T16:00:00Z"), zone)).toBe("2026-11-06");
  });

  it("is still yesterday late at night behind UTC (Los Angeles, UTC−8 in November)", () => {
    const zone = "America/Los_Angeles";
    expect(dateInTimeZone(at("2026-11-06T07:59:59Z"), zone)).toBe("2026-11-05");
    expect(dateInTimeZone(at("2026-11-06T08:00:00Z"), zone)).toBe("2026-11-06");
  });

  it("follows daylight saving (New York, 8 March 2026)", () => {
    const zone = "America/New_York";
    // Midnight before the change is at UTC−5.
    expect(dateInTimeZone(at("2026-03-08T04:59:59Z"), zone)).toBe("2026-03-07");
    expect(dateInTimeZone(at("2026-03-08T05:00:00Z"), zone)).toBe("2026-03-08");
    // Midnight after the change is at UTC−4.
    expect(dateInTimeZone(at("2026-03-09T03:59:59Z"), zone)).toBe("2026-03-08");
    expect(dateInTimeZone(at("2026-03-09T04:00:00Z"), zone)).toBe("2026-03-09");
  });

  it("handles half- and quarter-hour offsets (India +5:30, Nepal +5:45)", () => {
    expect(dateInTimeZone(at("2026-11-05T18:29:59Z"), "Asia/Kolkata")).toBe(
      "2026-11-05",
    );
    expect(dateInTimeZone(at("2026-11-05T18:30:00Z"), "Asia/Kolkata")).toBe(
      "2026-11-06",
    );
    expect(dateInTimeZone(at("2026-11-05T18:14:59Z"), "Asia/Kathmandu")).toBe(
      "2026-11-05",
    );
    expect(dateInTimeZone(at("2026-11-05T18:15:00Z"), "Asia/Kathmandu")).toBe(
      "2026-11-06",
    );
  });

  it("gives the same moment different dates at the edges of the map (+14 and −11)", () => {
    const moment = at("2026-11-05T10:30:00Z");
    expect(dateInTimeZone(moment, "Pacific/Kiritimati")).toBe("2026-11-06");
    expect(dateInTimeZone(moment, "UTC")).toBe("2026-11-05");
    expect(dateInTimeZone(moment, "Pacific/Pago_Pago")).toBe("2026-11-04");
  });

  it("crosses into the new year by local time", () => {
    expect(
      dateInTimeZone(at("2026-12-31T16:00:00Z"), "Asia/Kuala_Lumpur"),
    ).toBe("2027-01-01");
    expect(dateInTimeZone(at("2026-12-31T16:00:00Z"), "UTC")).toBe(
      "2026-12-31",
    );
  });
});
