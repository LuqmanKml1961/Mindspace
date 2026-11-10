import "server-only";
import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import { NotFoundError } from "@/domain/shared/errors";
import type { Reminder } from "@/domain/tasks/reminder";
import type { ReminderRepository } from "@/domain/tasks/reminder-repository";
import type {
  Database,
  Tables,
} from "@/infrastructure/supabase/database.types";
import { fetchAllRows } from "@/infrastructure/supabase/fetch-all-rows";

const COLUMNS = "id, user_id, task_id, remind_at, dismissed_at, created_at";

type ReminderRow = Pick<
  Tables<"reminders">,
  "id" | "user_id" | "task_id" | "remind_at" | "dismissed_at" | "created_at"
>;

function toReminder(row: ReminderRow): Reminder {
  return {
    id: row.id,
    userId: row.user_id,
    taskId: row.task_id,
    remindAt: new Date(row.remind_at),
    dismissedAt: row.dismissed_at ? new Date(row.dismissed_at) : null,
    createdAt: new Date(row.created_at),
  };
}

const reminderMissing = () =>
  new NotFoundError("This reminder no longer exists.");

// 23503: the composite FK found no task with this id for this user.
function failure(action: string, error: PostgrestError): Error {
  if (error.code === "23503") {
    return new NotFoundError("That task no longer exists.");
  }
  return new Error(`${action} failed (${error.code})`);
}

// Errors carry only the Postgres code: the details can contain row values.
export function createSupabaseReminderRepository(
  supabase: SupabaseClient<Database>,
): ReminderRepository {
  return {
    async create(reminder) {
      const { data, error } = await supabase
        .from("reminders")
        .insert({
          user_id: reminder.userId,
          task_id: reminder.taskId,
          remind_at: reminder.remindAt.toISOString(),
        })
        .select(COLUMNS)
        .single();
      if (error) throw failure("Saving the reminder", error);
      return toReminder(data);
    },
    async listActive(userId) {
      const rows = await fetchAllRows(
        (from, to) =>
          supabase
            .from("reminders")
            .select(COLUMNS, { count: "exact" })
            .eq("user_id", userId)
            .is("dismissed_at", null)
            .order("remind_at")
            .order("id")
            .range(from, to),
        (error) => failure("Listing reminders", error),
      );
      return rows.map(toReminder);
    },
    async listAll(userId) {
      const rows = await fetchAllRows(
        (from, to) =>
          supabase
            .from("reminders")
            .select(COLUMNS, { count: "exact" })
            .eq("user_id", userId)
            .order("created_at")
            .order("id")
            .range(from, to),
        (error) => failure("Listing reminders", error),
      );
      return rows.map(toReminder);
    },
    async dismiss(userId, id, at) {
      const { data, error } = await supabase
        .from("reminders")
        .update({ dismissed_at: at.toISOString() })
        .eq("user_id", userId)
        .eq("id", id)
        .select(COLUMNS)
        .maybeSingle();
      if (error) throw failure("Dismissing the reminder", error);
      // RLS and the user_id filter hide other users' rows, so no row means none to change.
      if (!data) throw reminderMissing();
      return toReminder(data);
    },
  };
}
