import type { UserKeys, WrappedKey } from "@/domain/encryption/user-keys";
import type { UserKeysRepository } from "@/domain/encryption/user-keys-repository";

// Server side: stores only what the browser already wrapped (D-021).
export function makeGetUserKeys(deps: { userKeys: UserKeysRepository }) {
  return (userId: string) => deps.userKeys.find(userId);
}

export function makeCreateUserKeys(deps: { userKeys: UserKeysRepository }) {
  return (userId: string, keys: UserKeys) => deps.userKeys.create(userId, keys);
}

export function makeReplacePassphraseKey(deps: {
  userKeys: UserKeysRepository;
}) {
  return (userId: string, wrapped: WrappedKey) =>
    deps.userKeys.replacePassphraseKey(userId, wrapped);
}
