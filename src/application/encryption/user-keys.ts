import type { UserKeys } from "@/domain/encryption/user-keys";
import type { UserKeysRepository } from "@/domain/encryption/user-keys-repository";

// Server side: stores only what the browser already wrapped (D-021).
export function makeGetUserKeys(deps: { userKeys: UserKeysRepository }) {
  return (userId: string) => deps.userKeys.find(userId);
}

export function makeCreateUserKeys(deps: { userKeys: UserKeysRepository }) {
  return (userId: string, keys: UserKeys) => deps.userKeys.create(userId, keys);
}

export function makeReplaceUserKeys(deps: { userKeys: UserKeysRepository }) {
  return (userId: string, keys: UserKeys) =>
    deps.userKeys.replace(userId, keys);
}
