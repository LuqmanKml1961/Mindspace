import "server-only";
import { redirect } from "next/navigation";
import type { AuthService } from "@/application/auth/auth-service";
import {
  makeCreateUserKeys,
  makeGetUserKeys,
  makeReplaceUserKeys,
} from "@/application/encryption/user-keys";
import { makeGetProfile } from "@/application/profiles/get-profile";
import { makeUpdateTimezone } from "@/application/profiles/update-timezone";
import { createSupabaseAuthService } from "@/infrastructure/auth/supabase-auth-service";
import { createSupabaseProfileRepository } from "@/infrastructure/repositories/supabase-profile-repository";
import { createSupabaseUserKeysRepository } from "@/infrastructure/repositories/supabase-user-keys-repository";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server";

export async function getAuthService(): Promise<AuthService> {
  return createSupabaseAuthService(await createSupabaseServerClient());
}

// The security check for every data read and Server Action; the proxy is only a convenience.
export async function getAppContext() {
  const supabase = await createSupabaseServerClient();
  // getClaims verifies the token's signature, so the user id can be trusted.
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/sign-in");

  const profiles = createSupabaseProfileRepository(supabase);
  const userKeys = createSupabaseUserKeysRepository(supabase);
  return {
    user: { id: data.claims.sub, email: data.claims.email ?? null },
    useCases: {
      getProfile: makeGetProfile({ profiles }),
      updateTimezone: makeUpdateTimezone({ profiles }),
      getUserKeys: makeGetUserKeys({ userKeys }),
      createUserKeys: makeCreateUserKeys({ userKeys }),
      replaceUserKeys: makeReplaceUserKeys({ userKeys }),
    },
  };
}
