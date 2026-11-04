import type { UserKeys } from "@/domain/encryption/user-keys";

export interface UserKeysRepository {
  find(userId: string): Promise<UserKeys | null>;
  // Throws ConflictError if this user already has keys.
  create(userId: string, keys: UserKeys): Promise<void>;
  // Replaces both wrapped copies at once. Throws NotFoundError if this user has no keys yet.
  replace(userId: string, keys: UserKeys): Promise<void>;
}
