import { DeviceLockedError } from "@/application/encryption/errors";
import type { DeviceKeyStore } from "@/application/encryption/ports";

// For use cases that encrypt or decrypt: the key, or DeviceLockedError if it has gone.
export async function requireDeviceKey(
  device: DeviceKeyStore,
  userId: string,
): Promise<CryptoKey> {
  const key = await device.load(userId);
  if (!key) throw new DeviceLockedError();
  return key;
}

// The key kept on this device, or null when the device is locked.
export function makeGetDeviceKey(deps: { device: DeviceKeyStore }) {
  return (userId: string) => deps.device.load(userId);
}

// At sign-out: this device forgets every key it kept.
export function makeForgetDevice(deps: { device: DeviceKeyStore }) {
  return () => deps.device.clear();
}
