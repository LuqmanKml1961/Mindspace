import { describe, expect, it } from "vitest";
import { makeGetProfile } from "@/application/profiles/get-profile";
import { makeSaveDetectedTimezone } from "@/application/profiles/save-detected-timezone";
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
    // Like the updated_at trigger, any save marks the profile as changed.
    async updateTimezone(id, timezone) {
      const profile = rows.get(id);
      if (!profile) throw new Error("not found");
      rows.set(id, { ...profile, timezone, changedSinceSignUp: true });
    },
  };
}

const alex: Profile = {
  id: "user-a",
  displayName: null,
  timezone: "UTC",
  changedSinceSignUp: false,
};

describe("saveDetectedTimezone", () => {
  it("saves the device's zone once, for a profile still as sign-up left it", async () => {
    const profiles = inMemoryProfiles([alex]);
    const save = makeSaveDetectedTimezone({ profiles });

    await expect(
      save({ userId: "user-a", timezone: "asia/kuala_lumpur" }),
    ).resolves.toBe("Asia/Kuala_Lumpur");
    await expect(
      save({ userId: "user-a", timezone: "Europe/London" }),
    ).resolves.toBeNull();
    expect(profiles.rows.get("user-a")?.timezone).toBe("Asia/Kuala_Lumpur");
  });

  it("never overrides a zone chosen in Settings, UTC included", async () => {
    const profiles = inMemoryProfiles([{ ...alex, changedSinceSignUp: true }]);
    const save = makeSaveDetectedTimezone({ profiles });

    await expect(
      save({ userId: "user-a", timezone: "Asia/Tokyo" }),
    ).resolves.toBeNull();
    expect(profiles.rows.get("user-a")?.timezone).toBe("UTC");
  });

  it("saves nothing for a device on UTC, so a later device can still set it", async () => {
    const profiles = inMemoryProfiles([alex]);
    const save = makeSaveDetectedTimezone({ profiles });

    await expect(
      save({ userId: "user-a", timezone: "Etc/UTC" }),
    ).resolves.toBeNull();
    expect(profiles.rows.get("user-a")).toEqual(alex);
  });

  it("rejects an unknown zone, and ignores a missing profile", async () => {
    const profiles = inMemoryProfiles([alex]);
    const save = makeSaveDetectedTimezone({ profiles });

    await expect(
      save({ userId: "user-a", timezone: "Not/AZone" }),
    ).rejects.toThrow(ValidationError);
    expect(profiles.rows.get("user-a")).toEqual(alex);
    await expect(
      save({ userId: "someone-else", timezone: "Asia/Tokyo" }),
    ).resolves.toBeNull();
  });
});

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
