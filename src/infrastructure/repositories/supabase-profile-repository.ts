import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile } from "@/domain/profiles/profile";
import type { ProfileRepository } from "@/domain/profiles/profile-repository";
import type {
  Database,
  Tables,
} from "@/infrastructure/supabase/database.types";

type ProfileRow = Pick<Tables<"profiles">, "id" | "display_name" | "timezone">;

function toProfile(row: ProfileRow): Profile {
  return { id: row.id, displayName: row.display_name, timezone: row.timezone };
}

// Errors carry only the Postgres code: the details can contain row values.
export function createSupabaseProfileRepository(
  supabase: SupabaseClient<Database>,
): ProfileRepository {
  return {
    async findById(id) {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, timezone")
        .eq("id", id)
        .maybeSingle();
      if (error) throw new Error(`Reading the profile failed (${error.code})`);
      return data ? toProfile(data) : null;
    },
    async updateTimezone(id, timezone) {
      const { data, error } = await supabase
        .from("profiles")
        .update({ timezone })
        .eq("id", id)
        .select("id");
      if (error) throw new Error(`Updating the profile failed (${error.code})`);
      // RLS hides other users' rows, so zero rows means nothing was changed.
      if (data.length === 0)
        throw new Error("Updating the profile changed no rows");
    },
  };
}
