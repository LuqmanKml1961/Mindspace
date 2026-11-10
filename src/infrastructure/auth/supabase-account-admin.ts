import "server-only";
import type { AccountAdmin } from "@/application/account/ports";
import { createSupabaseAdminClient } from "@/infrastructure/supabase/admin";

export function createSupabaseAccountAdmin(): AccountAdmin {
  return {
    async deleteUser(userId) {
      // A hard delete: the row in auth.users goes, with its sessions and every user-owned row.
      const { error } =
        await createSupabaseAdminClient().auth.admin.deleteUser(userId);
      // Only the status: the message can name the user.
      if (error) {
        throw new Error(`Deleting the account failed (${error.status ?? "?"})`);
      }
    },
  };
}
