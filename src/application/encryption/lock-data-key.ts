import type { KeyCrypto } from "@/application/encryption/ports";
import {
  ENCRYPTION_VERSION,
  type UserKeys,
} from "@/domain/encryption/user-keys";

// Wraps the data key with the passphrase and with a new recovery code, which is shown once.
export async function lockDataKey(
  crypto: KeyCrypto,
  dataKey: CryptoKey,
  passphrase: string,
): Promise<{ keys: UserKeys; recoveryCode: string }> {
  const recoveryCode = crypto.createRecoveryCode();
  return {
    keys: {
      version: ENCRYPTION_VERSION,
      passphrase: await crypto.wrapWithPassphrase(dataKey, passphrase),
      recovery: await crypto.wrapWithRecoveryCode(dataKey, recoveryCode),
    },
    recoveryCode,
  };
}
