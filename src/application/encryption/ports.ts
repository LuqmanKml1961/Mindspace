import type { UserKeys, WrappedKey } from "@/domain/encryption/user-keys";

// Browser cryptography (D-021). Unwrap failures throw UnlockFailedError.
export interface KeyCrypto {
  generateDataKey(): Promise<CryptoKey>;
  // A non-extractable copy, the only kind kept on a device.
  toDeviceKey(key: CryptoKey): Promise<CryptoKey>;
  wrapWithPassphrase(key: CryptoKey, passphrase: string): Promise<WrappedKey>;
  // Non-extractable: ready to keep on the device.
  unwrapWithPassphrase(
    wrapped: WrappedKey,
    passphrase: string,
  ): Promise<CryptoKey>;
  createRecoveryCode(): string;
  wrapWithRecoveryCode(key: CryptoKey, code: string): Promise<WrappedKey>;
  // Extractable, so it can be wrapped again with a new passphrase.
  unwrapWithRecoveryCode(wrapped: WrappedKey, code: string): Promise<CryptoKey>;
}

// Binds a ciphertext to its owner and field (D-021), so it can't be moved to another field or
// person and still decrypt.
export type FieldContext = { table: string; column: string; userId: string };

// Encrypts one text field with the data key. decrypt throws DecryptFailedError.
export interface FieldCrypto {
  encrypt(
    key: CryptoKey,
    plaintext: string,
    field: FieldContext,
  ): Promise<string>;
  decrypt(
    key: CryptoKey,
    ciphertext: string,
    field: FieldContext,
  ): Promise<string>;
}

// The unlocked key on this device ("once per device"); cleared at sign-out.
export interface DeviceKeyStore {
  save(userId: string, key: CryptoKey): Promise<void>;
  load(userId: string): Promise<CryptoKey | null>;
  clear(): Promise<void>;
}

// The signed-in user's wrapped keys on the server, reached from the browser.
export interface KeyServer {
  create(keys: UserKeys): Promise<void>;
  replace(keys: UserKeys): Promise<void>;
}
