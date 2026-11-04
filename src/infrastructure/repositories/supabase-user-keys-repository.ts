import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ENCRYPTION_VERSION,
  type UserKeys,
} from "@/domain/encryption/user-keys";
import type { UserKeysRepository } from "@/domain/encryption/user-keys-repository";
import { ConflictError, NotFoundError } from "@/domain/shared/errors";
import type {
  Database,
  Tables,
} from "@/infrastructure/supabase/database.types";

const COLUMNS =
  "version, passphrase_salt, passphrase_iterations, passphrase_wrapped_key, recovery_salt, recovery_iterations, recovery_wrapped_key";

type UserKeysRow = Pick<
  Tables<"user_keys">,
  | "version"
  | "passphrase_salt"
  | "passphrase_iterations"
  | "passphrase_wrapped_key"
  | "recovery_salt"
  | "recovery_iterations"
  | "recovery_wrapped_key"
>;

function toUserKeys(row: UserKeysRow): UserKeys {
  if (row.version !== ENCRYPTION_VERSION) {
    throw new Error(`Unsupported encryption version (${row.version})`);
  }
  return {
    version: ENCRYPTION_VERSION,
    passphrase: {
      salt: row.passphrase_salt,
      iterations: row.passphrase_iterations,
      wrappedKey: row.passphrase_wrapped_key,
    },
    recovery: {
      salt: row.recovery_salt,
      iterations: row.recovery_iterations,
      wrappedKey: row.recovery_wrapped_key,
    },
  };
}

// Errors carry only the Postgres code.
export function createSupabaseUserKeysRepository(
  supabase: SupabaseClient<Database>,
): UserKeysRepository {
  return {
    async find(userId) {
      const { data, error } = await supabase
        .from("user_keys")
        .select(COLUMNS)
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw new Error(`Reading keys failed (${error.code})`);
      return data ? toUserKeys(data) : null;
    },
    async create(userId, keys) {
      const { error } = await supabase.from("user_keys").insert({
        user_id: userId,
        version: keys.version,
        passphrase_salt: keys.passphrase.salt,
        passphrase_iterations: keys.passphrase.iterations,
        passphrase_wrapped_key: keys.passphrase.wrappedKey,
        recovery_salt: keys.recovery.salt,
        recovery_iterations: keys.recovery.iterations,
        recovery_wrapped_key: keys.recovery.wrappedKey,
      });
      // 23505: unique violation on the primary key, so keys already exist.
      if (error?.code === "23505") {
        throw new ConflictError(
          "Encryption is already set up for this account.",
        );
      }
      if (error) throw new Error(`Saving keys failed (${error.code})`);
    },
    async replace(userId, keys) {
      const { data, error } = await supabase
        .from("user_keys")
        .update({
          version: keys.version,
          passphrase_salt: keys.passphrase.salt,
          passphrase_iterations: keys.passphrase.iterations,
          passphrase_wrapped_key: keys.passphrase.wrappedKey,
          recovery_salt: keys.recovery.salt,
          recovery_iterations: keys.recovery.iterations,
          recovery_wrapped_key: keys.recovery.wrappedKey,
        })
        .eq("user_id", userId)
        .select("user_id");
      if (error) throw new Error(`Updating keys failed (${error.code})`);
      if (data.length === 0) {
        throw new NotFoundError(
          "Encryption isn’t set up for this account yet.",
        );
      }
    },
  };
}
