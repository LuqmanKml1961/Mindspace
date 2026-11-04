import "server-only";
import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import { NotFoundError } from "@/domain/shared/errors";
import { isThoughtStatus } from "@/domain/thoughts/thought";
import type {
  EncryptedThought,
  EncryptedThoughtChanges,
  ThoughtRepository,
} from "@/domain/thoughts/thought-repository";
import type {
  Database,
  Tables,
  TablesUpdate,
} from "@/infrastructure/supabase/database.types";

const COLUMNS =
  "id, user_id, title_ciphertext, content_ciphertext, category_id, status, created_at, updated_at";

type ThoughtRow = Pick<
  Tables<"thoughts">,
  | "id"
  | "user_id"
  | "title_ciphertext"
  | "content_ciphertext"
  | "category_id"
  | "status"
  | "created_at"
  | "updated_at"
>;

function toEncryptedThought(row: ThoughtRow): EncryptedThought {
  if (!isThoughtStatus(row.status)) {
    throw new Error("Unknown thought status in the database");
  }
  return {
    id: row.id,
    userId: row.user_id,
    titleCiphertext: row.title_ciphertext,
    contentCiphertext: row.content_ciphertext,
    categoryId: row.category_id,
    status: row.status,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function toRowChanges(
  changes: EncryptedThoughtChanges,
): TablesUpdate<"thoughts"> {
  const row: TablesUpdate<"thoughts"> = {};
  if (changes.titleCiphertext !== undefined)
    row.title_ciphertext = changes.titleCiphertext;
  if (changes.contentCiphertext !== undefined)
    row.content_ciphertext = changes.contentCiphertext;
  if (changes.categoryId !== undefined) row.category_id = changes.categoryId;
  if (changes.status !== undefined) row.status = changes.status;
  return row;
}

const thoughtMissing = () =>
  new NotFoundError("This thought no longer exists.");

// 23503: the composite FK found no category with this id for this user.
function failure(action: string, error: PostgrestError): Error {
  if (error.code === "23503") {
    return new NotFoundError("That category no longer exists.");
  }
  return new Error(`${action} failed (${error.code})`);
}

// Errors carry only the Postgres code: the details can contain row values.
export function createSupabaseThoughtRepository(
  supabase: SupabaseClient<Database>,
): ThoughtRepository {
  async function findById(userId: string, id: string) {
    const { data, error } = await supabase
      .from("thoughts")
      .select(COLUMNS)
      .eq("user_id", userId)
      .eq("id", id)
      .maybeSingle();
    if (error) throw failure("Reading the thought", error);
    return data ? toEncryptedThought(data) : null;
  }

  return {
    findById,
    async create(thought) {
      const { data, error } = await supabase
        .from("thoughts")
        .insert({
          user_id: thought.userId,
          title_ciphertext: thought.titleCiphertext,
          content_ciphertext: thought.contentCiphertext,
          category_id: thought.categoryId,
          status: thought.status,
        })
        .select(COLUMNS)
        .single();
      if (error) throw failure("Saving the thought", error);
      return toEncryptedThought(data);
    },
    async list(userId, filter = {}) {
      let query = supabase
        .from("thoughts")
        .select(COLUMNS)
        .eq("user_id", userId);
      if (filter.status) query = query.eq("status", filter.status);
      if (filter.categoryId === null) query = query.is("category_id", null);
      else if (filter.categoryId !== undefined)
        query = query.eq("category_id", filter.categoryId);
      const { data, error } = await query.order("created_at", {
        ascending: false,
      });
      if (error) throw failure("Listing thoughts", error);
      return data.map(toEncryptedThought);
    },
    async update(userId, id, changes) {
      const row = toRowChanges(changes);
      if (Object.keys(row).length === 0) {
        const current = await findById(userId, id);
        if (!current) throw thoughtMissing();
        return current;
      }
      const { data, error } = await supabase
        .from("thoughts")
        .update(row)
        .eq("user_id", userId)
        .eq("id", id)
        .select(COLUMNS)
        .maybeSingle();
      if (error) throw failure("Updating the thought", error);
      // RLS and the user_id filter hide other users' rows, so no row means none to change.
      if (!data) throw thoughtMissing();
      return toEncryptedThought(data);
    },
    async delete(userId, id) {
      const { data, error } = await supabase
        .from("thoughts")
        .delete()
        .eq("user_id", userId)
        .eq("id", id)
        .select("id");
      if (error) throw failure("Deleting the thought", error);
      if (data.length === 0) throw thoughtMissing();
    },
  };
}
