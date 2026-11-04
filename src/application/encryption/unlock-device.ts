import type { DeviceKeyStore, KeyCrypto } from "@/application/encryption/ports";
import type { UserKeys } from "@/domain/encryption/user-keys";

// On a new device: the passphrase unlocks the data key, which is then kept on this device.
export function makeUnlockDevice(deps: {
  crypto: KeyCrypto;
  device: DeviceKeyStore;
}) {
  return async ({
    userId,
    keys,
    passphrase,
  }: {
    userId: string;
    keys: UserKeys;
    passphrase: string;
  }): Promise<void> => {
    const key = await deps.crypto.unwrapWithPassphrase(
      keys.passphrase,
      passphrase,
    );
    await deps.device.save(userId, key);
  };
}
