import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { NotFoundError } from "@/domain/shared/errors";
import type {
  CategoryRepository,
  EncryptedCategory,
} from "@/domain/thoughts/category-repository";
import type {
  Database,
  Tables,
} from "@/infrastructure/supabase/database.types";

const COLUMNS = "id, user_id, name_ciphertext, created_at";

type CategoryRow = Pick<
  Tables<"categories">,
  "id" | "user_id" | "name_ciphertext" | "created_at"
>;

function toEncryptedCategory(row: CategoryRow): EncryptedCategory {
  return {
    id: row.id,
    userId: row.user_id,
    nameCiphertext: row.name_ciphertext,
    createdAt: new Date(row.created_at),
  };
}

const categoryMissing = () =>
  new NotFoundError("This category no longer exists.");

// Errors carry only the Postgres code: the details can contain row values.
export function createSupabaseCategoryRepository(
  supabase: SupabaseClient<Database>,
): CategoryRepository {
  return {
    async create(category) {
      const { data, error } = await supabase
        .from("categories")
        .insert({
          user_id: category.userId,
          name_ciphertext: category.nameCiphertext,
        })
        .select(COLUMNS)
        .single();
      if (error) throw new Error(`Saving the category failed (${error.code})`);
      return toEncryptedCategory(data);
    },
    async list(userId) {
      const { data, error } = await supabase
        .from("categories")
        .select(COLUMNS)
        .eq("user_id", userId)
        .order("created_at", { ascending: true });
      if (error) throw new Error(`Listing categories failed (${error.code})`);
      return data.map(toEncryptedCategory);
    },
    async rename(userId, id, nameCiphertext) {
      const { data, error } = await supabase
        .from("categories")
        .update({ name_ciphertext: nameCiphertext })
        .eq("user_id", userId)
        .eq("id", id)
        .select(COLUMNS)
        .maybeSingle();
      if (error)
        throw new Error(`Renaming the category failed (${error.code})`);
      // RLS and the user_id filter hide other users' rows, so no row means none to change.
      if (!data) throw categoryMissing();
      return toEncryptedCategory(data);
    },
    async delete(userId, id) {
      const { data, error } = await supabase
        .from("categories")
        .delete()
        .eq("user_id", userId)
        .eq("id", id)
        .select("id");
      if (error)
        throw new Error(`Deleting the category failed (${error.code})`);
      if (data.length === 0) throw categoryMissing();
    },
  };
}
