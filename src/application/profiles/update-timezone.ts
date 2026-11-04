import { toTimezone } from "@/domain/profiles/profile";
import type { ProfileRepository } from "@/domain/profiles/profile-repository";

export function makeUpdateTimezone({
  profiles,
}: {
  profiles: ProfileRepository;
}) {
  return async ({ userId, timezone }: { userId: string; timezone: string }) => {
    const canonical = toTimezone(timezone);
    await profiles.updateTimezone(userId, canonical);
    return canonical;
  };
}
