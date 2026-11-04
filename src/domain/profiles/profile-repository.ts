import type { Profile } from "@/domain/profiles/profile";

export interface ProfileRepository {
  findById(id: string): Promise<Profile | null>;
  updateTimezone(id: string, timezone: string): Promise<void>;
}
