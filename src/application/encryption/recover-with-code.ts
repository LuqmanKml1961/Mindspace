import type {
  DeviceKeyStore,
  KeyCrypto,
  KeyServer,
} from "@/application/encryption/ports";
import { toPassphrase } from "@/domain/encryption/passphrase";
import type { UserKeys } from "@/domain/encryption/user-keys";

// Forgotten passphrase: the recovery code unlocks the same data key, which is wrapped again
// with a new passphrase. No thought needs re-encrypting.
export function makeRecoverWithCode(deps: {
  crypto: KeyCrypto;
  server: KeyServer;
  device: DeviceKeyStore;
}) {
  return async ({
    userId,
    keys,
    recoveryCode,
    newPassphrase,
  }: {
    userId: string;
    keys: UserKeys;
    recoveryCode: string;
    newPassphrase: string;
  }): Promise<void> => {
    const checked = toPassphrase(newPassphrase);
    const dataKey = await deps.crypto.unwrapWithRecoveryCode(
      keys.recovery,
      recoveryCode,
    );
    await deps.server.replacePassphraseKey(
      await deps.crypto.wrapWithPassphrase(dataKey, checked),
    );
    await deps.device.save(userId, await deps.crypto.toDeviceKey(dataKey));
  };
}
