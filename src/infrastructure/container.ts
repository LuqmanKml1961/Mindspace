import "server-only";
import type { AuthService } from "@/application/auth/auth-service";
import { createSupabaseAuthService } from "@/infrastructure/auth/supabase-auth-service";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server";

export async function getAuthService(): Promise<AuthService> {
  return createSupabaseAuthService(await createSupabaseServerClient());
}
