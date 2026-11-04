import { describe, expect, it } from "vitest";
import { makeGetProfile } from "@/application/profiles/get-profile";
import { makeUpdateTimezone } from "@/application/profiles/update-timezone";
import type { Profile } from "@/domain/profiles/profile";
import type { ProfileRepository } from "@/domain/profiles/profile-repository";
import { ValidationError } from "@/domain/shared/errors";

function inMemoryProfiles(initial: Profile[]): ProfileRepository & {
  rows: Map<string, Profile>;
} {
  const rows = new Map(initial.map((profile) => [profile.id, profile]));
  return {
    rows,
    async findById(id) {
      return rows.get(id) ?? null;
    },
    async updateTimezone(id, timezone) {
      const profile = rows.get(id);
      if (!profile) throw new Error("not found");
      rows.set(id, { ...profile, timezone });
    },
  };
}

const alex: Profile = { id: "user-a", displayName: null, timezone: "UTC" };

describe("getProfile", () => {
  it("returns the user's profile, or null", async () => {
    const getProfile = makeGetProfile({ profiles: inMemoryProfiles([alex]) });
    await expect(getProfile("user-a")).resolves.toEqual(alex);
    await expect(getProfile("someone-else")).resolves.toBeNull();
  });
});

describe("updateTimezone", () => {
  it("saves the canonical name for that user", async () => {
    const profiles = inMemoryProfiles([alex]);
    const updateTimezone = makeUpdateTimezone({ profiles });

    await expect(
      updateTimezone({ userId: "user-a", timezone: "asia/kuala_lumpur" }),
    ).resolves.toBe("Asia/Kuala_Lumpur");
    expect(profiles.rows.get("user-a")?.timezone).toBe("Asia/Kuala_Lumpur");
  });

  it("rejects an unknown zone without touching the repository", async () => {
    const profiles = inMemoryProfiles([alex]);
    const updateTimezone = makeUpdateTimezone({ profiles });

    await expect(
      updateTimezone({ userId: "user-a", timezone: "Not/AZone" }),
    ).rejects.toThrow(ValidationError);
    expect(profiles.rows.get("user-a")?.timezone).toBe("UTC");
  });
});
