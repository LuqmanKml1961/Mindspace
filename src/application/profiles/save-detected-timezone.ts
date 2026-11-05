import {
  DEFAULT_TIMEZONE,
  shouldDetectTimezone,
  toTimezone,
} from "@/domain/profiles/profile";
import type { ProfileRepository } from "@/domain/profiles/profile-repository";

// Saves the device's zone once (DATA_MODEL Q-5). The rule is checked again here, so a repeat or
// a stale request never overwrites a zone that was already saved. Returns the saved zone, or null.
export function makeSaveDetectedTimezone({
  profiles,
}: {
  profiles: ProfileRepository;
}) {
  return async ({
    userId,
    timezone,
  }: {
    userId: string;
    timezone: string;
  }): Promise<string | null> => {
    const profile = await profiles.findById(userId);
    if (!profile || !shouldDetectTimezone(profile)) return null;
    const canonical = toTimezone(timezone);
    if (canonical === DEFAULT_TIMEZONE) return null;
    await profiles.updateTimezone(userId, canonical);
    return canonical;
  };
}
