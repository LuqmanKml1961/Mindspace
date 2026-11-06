const DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

// A real calendar date written as YYYY-MM-DD, so 2026-02-30 and 2026-11-6 are refused.
export function isCalendarDate(value: string): boolean {
  const match = DATE.exec(value);
  if (!match) return false;
  const [year, month, day] = match.slice(1).map(Number);
  // Date.UTC rolls an impossible day such as 2026-02-30 into the next month.
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

// The calendar date (YYYY-MM-DD) of an instant in an IANA time zone: what "today" is for someone
// there. Intl applies the zone's offset and daylight-saving rules, so no date library is needed.
// Throws a RangeError for a zone Intl doesn't know; profiles only hold checked zones (toTimezone).
export function dateInTimeZone(instant: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(instant);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

// A calendar date (YYYY-MM-DD) moved by whole days. Dates have no time zone, so UTC arithmetic
// is exact here.
export function addDays(date: string, days: number): string {
  const moved = new Date(`${date}T00:00:00Z`);
  moved.setUTCDate(moved.getUTCDate() + days);
  return moved.toISOString().slice(0, 10);
}
