import { lockDataKey } from "@/application/encryption/lock-data-key";
import type {
  DeviceKeyStore,
  KeyCrypto,
  KeyServer,
} from "@/application/encryption/ports";
import { toPassphrase } from "@/domain/encryption/passphrase";

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
    const { keys, recoveryCode } = await lockDataKey(
      deps.crypto,
      dataKey,
      checked,
    );
    // Server first: if saving fails, nothing is kept on the device.
    await deps.server.create(keys);
    await deps.device.save(userId, await deps.crypto.toDeviceKey(dataKey));
    return { recoveryCode };
  };
}
