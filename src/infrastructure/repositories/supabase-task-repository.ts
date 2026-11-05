import "server-only";
import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import { NotFoundError } from "@/domain/shared/errors";
import { isTaskPriority } from "@/domain/tasks/task";
import type {
  EncryptedTask,
  EncryptedTaskChanges,
  TaskRepository,
  TaskView,
} from "@/domain/tasks/task-repository";
import type {
  Database,
  Tables,
  TablesUpdate,
} from "@/infrastructure/supabase/database.types";
import { fetchAllRows } from "@/infrastructure/supabase/fetch-all-rows";

const COLUMNS =
  "id, user_id, title_ciphertext, notes_ciphertext, due_date, due_time, priority, completed_at, source_thought_id, created_at, updated_at";

type TaskRow = Pick<
  Tables<"tasks">,
  | "id"
  | "user_id"
  | "title_ciphertext"
  | "notes_ciphertext"
  | "due_date"
  | "due_time"
  | "priority"
  | "completed_at"
  | "source_thought_id"
  | "created_at"
  | "updated_at"
>;

function toEncryptedTask(row: TaskRow): EncryptedTask {
  if (!isTaskPriority(row.priority)) {
    throw new Error("Unknown task priority in the database");
  }
  return {
    id: row.id,
    userId: row.user_id,
    titleCiphertext: row.title_ciphertext,
    notesCiphertext: row.notes_ciphertext,
    dueDate: row.due_date,
    // Postgres returns HH:MM:SS; the domain keeps HH:MM.
    dueTime: row.due_time ? row.due_time.slice(0, 5) : null,
    priority: row.priority,
    completedAt: row.completed_at ? new Date(row.completed_at) : null,
    sourceThoughtId: row.source_thought_id,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function toRowChanges(changes: EncryptedTaskChanges): TablesUpdate<"tasks"> {
  const row: TablesUpdate<"tasks"> = {};
  if (changes.titleCiphertext !== undefined)
    row.title_ciphertext = changes.titleCiphertext;
  if (changes.notesCiphertext !== undefined)
    row.notes_ciphertext = changes.notesCiphertext;
  if (changes.dueDate !== undefined) row.due_date = changes.dueDate;
  if (changes.dueTime !== undefined) row.due_time = changes.dueTime;
  if (changes.priority !== undefined) row.priority = changes.priority;
  if (changes.completedAt !== undefined) {
    row.completed_at = changes.completedAt?.toISOString() ?? null;
  }
  return row;
}

const taskMissing = () => new NotFoundError("This task no longer exists.");

// 23503: the composite FK found no thought with this id for this user.
function failure(action: string, error: PostgrestError): Error {
  if (error.code === "23503") {
    return new NotFoundError("That thought no longer exists.");
  }
  return new Error(`${action} failed (${error.code})`);
}

// Errors carry only the Postgres code: the details can contain row values.
export function createSupabaseTaskRepository(
  supabase: SupabaseClient<Database>,
): TaskRepository {
  async function findById(userId: string, id: string) {
    const { data, error } = await supabase
      .from("tasks")
      .select(COLUMNS)
      .eq("user_id", userId)
      .eq("id", id)
      .maybeSingle();
    if (error) throw failure("Reading the task", error);
    return data ? toEncryptedTask(data) : null;
  }

  // One page of a view, in the order documented on TaskRepository.list. Filters change a query
  // builder in place, so every view starts from a fresh one.
  function viewPage(userId: string, view: TaskView, from: number, to: number) {
    const mine = () =>
      supabase
        .from("tasks")
        .select(COLUMNS, { count: "exact" })
        .eq("user_id", userId);
    const open = () => mine().is("completed_at", null);
    const byDue = (dated: ReturnType<typeof mine>) =>
      dated
        .order("due_date")
        .order("due_time", { nullsFirst: false })
        .order("created_at");
    let ordered;
    switch (view.view) {
      case "today":
        ordered = byDue(open().lte("due_date", view.today));
        break;
      case "upcoming":
        ordered = byDue(open().gt("due_date", view.today));
        break;
      case "noDate":
        ordered = open()
          .is("due_date", null)
          .order("created_at", { ascending: false });
        break;
      case "completed":
        ordered = mine()
          .gte("completed_at", view.since.toISOString())
          .order("completed_at", { ascending: false });
        break;
    }
    return ordered.order("id").range(from, to);
  }

  return {
    findById,
    async create(task) {
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          user_id: task.userId,
          title_ciphertext: task.titleCiphertext,
          notes_ciphertext: task.notesCiphertext,
          due_date: task.dueDate,
          due_time: task.dueTime,
          priority: task.priority,
          source_thought_id: task.sourceThoughtId,
        })
        .select(COLUMNS)
        .single();
      if (error) throw failure("Saving the task", error);
      return toEncryptedTask(data);
    },
    async list(userId, view) {
      const rows = await fetchAllRows(
        (from, to) => viewPage(userId, view, from, to),
        (error) => failure("Listing tasks", error),
      );
      return rows.map(toEncryptedTask);
    },
    async update(userId, id, changes) {
      const row = toRowChanges(changes);
      if (Object.keys(row).length === 0) {
        const current = await findById(userId, id);
        if (!current) throw taskMissing();
        return current;
      }
      const { data, error } = await supabase
        .from("tasks")
        .update(row)
        .eq("user_id", userId)
        .eq("id", id)
        .select(COLUMNS)
        .maybeSingle();
      if (error) throw failure("Updating the task", error);
      // RLS and the user_id filter hide other users' rows, so no row means none to change.
      if (!data) throw taskMissing();
      return toEncryptedTask(data);
    },
    async delete(userId, id) {
      const { data, error } = await supabase
        .from("tasks")
        .delete()
        .eq("user_id", userId)
        .eq("id", id)
        .select("id");
      if (error) throw failure("Deleting the task", error);
      if (data.length === 0) throw taskMissing();
    },
  };
}
