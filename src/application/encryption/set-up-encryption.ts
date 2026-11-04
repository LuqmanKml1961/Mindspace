import type {
  DeviceKeyStore,
  KeyCrypto,
  KeyServer,
} from "@/application/encryption/ports";
import { toPassphrase } from "@/domain/encryption/passphrase";
import {
  ENCRYPTION_VERSION,
  type UserKeys,
} from "@/domain/encryption/user-keys";

// First-time setup in the browser. Returns the recovery code, to show once.
export function makeSetUpEncryption(deps: {
  crypto: KeyCrypto;
  server: KeyServer;
  device: DeviceKeyStore;
}) {
  return async ({
    userId,
    passphrase,
  }: {
    userId: string;
    passphrase: string;
  }): Promise<{ recoveryCode: string }> => {
    const checked = toPassphrase(passphrase);
    const dataKey = await deps.crypto.generateDataKey();
    const recoveryCode = deps.crypto.createRecoveryCode();
    const keys: UserKeys = {
      version: ENCRYPTION_VERSION,
      passphrase: await deps.crypto.wrapWithPassphrase(dataKey, checked),
      recovery: await deps.crypto.wrapWithRecoveryCode(dataKey, recoveryCode),
    };
    // Server first: if saving fails, nothing is kept on the device.
    await deps.server.create(keys);
    await deps.device.save(userId, await deps.crypto.toDeviceKey(dataKey));
    return { recoveryCode };
  };
}
