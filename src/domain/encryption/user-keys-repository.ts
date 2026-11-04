import type { UserKeys, WrappedKey } from "@/domain/encryption/user-keys";

export interface UserKeysRepository {
  find(userId: string): Promise<UserKeys | null>;
  // Throws ConflictError if this user already has keys.
  create(userId: string, keys: UserKeys): Promise<void>;
  // Throws NotFoundError if this user has no keys yet.
  replacePassphraseKey(userId: string, wrapped: WrappedKey): Promise<void>;
}
