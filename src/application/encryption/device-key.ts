import type { DeviceKeyStore } from "@/application/encryption/ports";

// The key kept on this device, or null when the device is locked.
export function makeGetDeviceKey(deps: { device: DeviceKeyStore }) {
  return (userId: string) => deps.device.load(userId);
}

// At sign-out: this device forgets every key it kept.
export function makeForgetDevice(deps: { device: DeviceKeyStore }) {
  return () => deps.device.clear();
}
