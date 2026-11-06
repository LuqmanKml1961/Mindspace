import "server-only";
import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import type {
  DailyCheckInRepository,
  EncryptedDailyCheckIn,
  EncryptedDailyCheckInChanges,
} from "@/domain/check-ins/daily-check-in-repository";
import { ConflictError, NotFoundError } from "@/domain/shared/errors";
import type {
  Database,
  Tables,
  TablesUpdate,
} from "@/infrastructure/supabase/database.types";
import { fetchAllRows } from "@/infrastructure/supabase/fetch-all-rows";

const COLUMNS =
  "id, user_id, checkin_date, occupying_mind_ciphertext, worries_ciphertext, can_control_ciphertext, can_wait_ciphertext, small_helpful_thing_ciphertext, priority_task_id, priority_text_ciphertext, created_at, updated_at";

type CheckInRow = Tables<"daily_checkins">;

function toEncryptedCheckIn(row: CheckInRow): EncryptedDailyCheckIn {
  return {
    id: row.id,
    userId: row.user_id,
    date: row.checkin_date,
    occupyingMindCiphertext: row.occupying_mind_ciphertext,
    worriesCiphertext: row.worries_ciphertext,
    canControlCiphertext: row.can_control_ciphertext,
    canWaitCiphertext: row.can_wait_ciphertext,
    smallHelpfulThingCiphertext: row.small_helpful_thing_ciphertext,
    priorityTaskId: row.priority_task_id,
    priorityTextCiphertext: row.priority_text_ciphertext,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function toRowChanges(
  changes: EncryptedDailyCheckInChanges,
): TablesUpdate<"daily_checkins"> {
  const row: TablesUpdate<"daily_checkins"> = {};
  if (changes.occupyingMindCiphertext !== undefined)
    row.occupying_mind_ciphertext = changes.occupyingMindCiphertext;
  if (changes.worriesCiphertext !== undefined)
    row.worries_ciphertext = changes.worriesCiphertext;
  if (changes.canControlCiphertext !== undefined)
    row.can_control_ciphertext = changes.canControlCiphertext;
  if (changes.canWaitCiphertext !== undefined)
    row.can_wait_ciphertext = changes.canWaitCiphertext;
  if (changes.smallHelpfulThingCiphertext !== undefined)
    row.small_helpful_thing_ciphertext = changes.smallHelpfulThingCiphertext;
  if (changes.priorityTaskId !== undefined)
    row.priority_task_id = changes.priorityTaskId;
  if (changes.priorityTextCiphertext !== undefined)
    row.priority_text_ciphertext = changes.priorityTextCiphertext;
  return row;
}

const checkInMissing = () =>
  new NotFoundError("This check-in no longer exists.");

// 23505: this user already has a check-in for that date. 23503: the composite FK found no task
// with this id for this user.
function failure(action: string, error: PostgrestError): Error {
  if (error.code === "23505") {
    return new ConflictError("There is already a check-in for this day.");
  }
  if (error.code === "23503") {
    return new NotFoundError("That task no longer exists.");
  }
  return new Error(`${action} failed (${error.code})`);
}

// Errors carry only the Postgres code: the details can contain row values.
export function createSupabaseDailyCheckInRepository(
  supabase: SupabaseClient<Database>,
): DailyCheckInRepository {
  async function findById(userId: string, id: string) {
    const { data, error } = await supabase
      .from("daily_checkins")
      .select(COLUMNS)
      .eq("user_id", userId)
      .eq("id", id)
      .maybeSingle();
    if (error) throw failure("Reading the check-in", error);
    return data ? toEncryptedCheckIn(data) : null;
  }

  return {
    async create(checkIn) {
      const { data, error } = await supabase
        .from("daily_checkins")
        .insert({
          user_id: checkIn.userId,
          checkin_date: checkIn.date,
          occupying_mind_ciphertext: checkIn.occupyingMindCiphertext,
          worries_ciphertext: checkIn.worriesCiphertext,
          can_control_ciphertext: checkIn.canControlCiphertext,
          can_wait_ciphertext: checkIn.canWaitCiphertext,
          small_helpful_thing_ciphertext: checkIn.smallHelpfulThingCiphertext,
          priority_task_id: checkIn.priorityTaskId,
          priority_text_ciphertext: checkIn.priorityTextCiphertext,
        })
        .select(COLUMNS)
        .single();
      if (error) throw failure("Saving the check-in", error);
      return toEncryptedCheckIn(data);
    },
    async findByDate(userId, date) {
      const { data, error } = await supabase
        .from("daily_checkins")
        .select(COLUMNS)
        .eq("user_id", userId)
        .eq("checkin_date", date)
        .maybeSingle();
      if (error) throw failure("Reading the check-in", error);
      return data ? toEncryptedCheckIn(data) : null;
    },
    async list(userId) {
      const rows = await fetchAllRows(
        (from, to) =>
          supabase
            .from("daily_checkins")
            .select(COLUMNS, { count: "exact" })
            .eq("user_id", userId)
            // Unique per user, so the order is stable from page to page.
            .order("checkin_date", { ascending: false })
            .range(from, to),
        (error) => failure("Listing check-ins", error),
      );
      return rows.map(toEncryptedCheckIn);
    },
    async update(userId, id, changes) {
      const row = toRowChanges(changes);
      if (Object.keys(row).length === 0) {
        const current = await findById(userId, id);
        if (!current) throw checkInMissing();
        return current;
      }
      const { data, error } = await supabase
        .from("daily_checkins")
        .update(row)
        .eq("user_id", userId)
        .eq("id", id)
        .select(COLUMNS)
        .maybeSingle();
      if (error) throw failure("Updating the check-in", error);
      // RLS and the user_id filter hide other users' rows, so no row means none to change.
      if (!data) throw checkInMissing();
      return toEncryptedCheckIn(data);
    },
  };
}
