import type { ProfileRepository } from "@/domain/profiles/profile-repository";

export function makeGetProfile({ profiles }: { profiles: ProfileRepository }) {
  return (userId: string) => profiles.findById(userId);
}
