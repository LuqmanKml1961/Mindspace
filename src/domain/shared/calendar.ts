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
