import { ValidationError } from "@/domain/shared/errors";

export type Profile = {
  id: string;
  displayName: string | null;
  timezone: string;
  // false until anything in the profile is saved after sign-up.
  changedSinceSignUp: boolean;
};

// The database default for new profiles.
export const DEFAULT_TIMEZONE = "UTC";

// The device's zone is saved once, for a profile still as sign-up left it (DATA_MODEL Q-5). A
// zone chosen in Settings, UTC included, is never overwritten.
export function shouldDetectTimezone(profile: Profile): boolean {
  return profile.timezone === DEFAULT_TIMEZONE && !profile.changedSinceSignUp;
}

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
