import { lockDataKey } from "@/application/encryption/lock-data-key";
import type {
  DeviceKeyStore,
  KeyCrypto,
  KeyServer,
} from "@/application/encryption/ports";
import { toPassphrase } from "@/domain/encryption/passphrase";
import type { UserKeys } from "@/domain/encryption/user-keys";

// Forgotten passphrase: the recovery code unlocks the same data key, which is wrapped again with
// the new passphrase and a new recovery code, so each code works once. No thought is
// re-encrypted. Returns the new recovery code, to show once.
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
  }): Promise<{ recoveryCode: string }> => {
    const checked = toPassphrase(newPassphrase);
    const dataKey = await deps.crypto.unwrapWithRecoveryCode(
      keys.recovery,
      recoveryCode,
    );
    const locked = await lockDataKey(deps.crypto, dataKey, checked);
    // Device first: the data key itself doesn't change, so if anything fails here the server
    // still has the old copies and the old code keeps working.
    await deps.device.save(userId, await deps.crypto.toDeviceKey(dataKey));
    await deps.server.replace(locked.keys);
    return { recoveryCode: locked.recoveryCode };
  };
}
