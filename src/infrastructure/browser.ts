import {
  makeForgetDevice,
  makeGetDeviceKey,
} from "@/application/encryption/device-key";
import type { KeyServer } from "@/application/encryption/ports";
import { makeRecoverWithCode } from "@/application/encryption/recover-with-code";
import { makeSetUpEncryption } from "@/application/encryption/set-up-encryption";
import { makeUnlockDevice } from "@/application/encryption/unlock-device";
import { indexedDbKeyStore } from "@/infrastructure/crypto/device-key-store";
import { webKeyCrypto } from "@/infrastructure/crypto/web-crypto";

// Browser composition root (D-021), the client-side twin of container.ts. Client Components
// import this, never infrastructure/crypto directly.

export const deviceKeys = {
  get: makeGetDeviceKey({ device: indexedDbKeyStore }),
  forget: makeForgetDevice({ device: indexedDbKeyStore }),
};

// The server is passed in (Server Actions), so infrastructure never imports presentation.
export function createEncryptionUseCases(server: KeyServer) {
  const deps = { crypto: webKeyCrypto, device: indexedDbKeyStore, server };
  return {
    setUpEncryption: makeSetUpEncryption(deps),
    unlockDevice: makeUnlockDevice(deps),
    recoverWithCode: makeRecoverWithCode(deps),
  };
}
