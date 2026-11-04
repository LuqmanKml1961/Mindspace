import { ValidationError } from "@/domain/shared/errors";

export type Profile = {
  id: string;
  displayName: string | null;
  timezone: string;
};

// The database default for new profiles.
export const DEFAULT_TIMEZONE = "UTC";

function canonicalTimezone(input: string): string | null {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: input,
    }).resolvedOptions().timeZone;
  } catch {
    return null; // RangeError: not an IANA time zone
  }
}

// Returns the canonical IANA name, e.g. "asia/kuala_lumpur" → "Asia/Kuala_Lumpur".
export function toTimezone(input: string): string {
  const timezone = canonicalTimezone(input);
  if (!timezone || timezone.length > 64) {
    throw new ValidationError("Choose a time zone from the list.");
  }
  return timezone;
}

// Intl leaves out "UTC", the default, so it is added first.
export function timezoneOptions(): string[] {
  return [DEFAULT_TIMEZONE, ...Intl.supportedValuesOf("timeZone")];
}
