import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/infrastructure/config/env";
import { supabaseSecretKey } from "@/infrastructure/config/secret-env";
import type { Database } from "@/infrastructure/supabase/database.types";

// The secret-key client, only for Auth's admin API (deleting an account). It has no grants on
// the user tables (D-018) and keeps no session.
export function createSupabaseAdminClient() {
  return createClient<Database>(env.supabaseUrl, supabaseSecretKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
