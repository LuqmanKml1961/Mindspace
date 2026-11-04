// End-to-end encryption primitives (D-021). Runs in the browser; Node 22 has the same Web Crypto
// API, so the unit tests exercise this exact code. Parameters come from D-021's sources.

import {
  DecryptFailedError,
  UnlockFailedError,
} from "@/application/encryption/errors";
import type {
  FieldContext,
  FieldCrypto,
  KeyCrypto,
} from "@/application/encryption/ports";
import type { WrappedKey } from "@/domain/encryption/user-keys";

const VERSION = "v1";
export const PBKDF2_ITERATIONS = 600_000; // OWASP Password Storage Cheat Sheet
const SALT_BYTES = 16; // MDN Pbkdf2Params: at least 16 bytes
const IV_BYTES = 12; // MDN AesGcmParams: 96 bits, unique per encryption
const RECOVERY_CODE_BYTES = 16; // 128 bits

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(text: string): Uint8Array<ArrayBuffer> {
  return Uint8Array.from(atob(text), (char) => char.charCodeAt(0));
}

function fieldAad({
  table,
  column,
  userId,
}: FieldContext): Uint8Array<ArrayBuffer> {
  return encoder.encode(`mindspace:${VERSION}:${table}.${column}:${userId}`);
}

// Extractable only so it can be wrapped during setup; devices keep a non-extractable copy.
export function generateDataKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, [
    "encrypt",
    "decrypt",
  ]);
}

// The copy a device keeps: usable for encrypting and decrypting, never exportable.
export async function toDeviceKey(key: CryptoKey): Promise<CryptoKey> {
  if (!key.extractable) return key;
  const raw = await crypto.subtle.exportKey("raw", key);
  return crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, false, [
    "encrypt",
    "decrypt",
  ]);
}

async function deriveWrappingKey(
  secret: string,
  salt: Uint8Array<ArrayBuffer>,
  iterations: number,
): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    material,
    { name: "AES-KW", length: 256 },
    false,
    ["wrapKey", "unwrapKey"],
  );
}

async function wrapWithSecret(
  dataKey: CryptoKey,
  secret: string,
): Promise<WrappedKey> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const wrappingKey = await deriveWrappingKey(secret, salt, PBKDF2_ITERATIONS);
  const wrapped = await crypto.subtle.wrapKey(
    "raw",
    dataKey,
    wrappingKey,
    "AES-KW",
  );
  return {
    salt: toBase64(salt),
    iterations: PBKDF2_ITERATIONS,
    wrappedKey: toBase64(new Uint8Array(wrapped)),
  };
}

// Non-extractable unless it must be wrapped again (recovery with a new passphrase).
async function unwrapWithSecret(
  wrapped: WrappedKey,
  secret: string,
  extractable: boolean,
): Promise<CryptoKey> {
  try {
    const wrappingKey = await deriveWrappingKey(
      secret,
      fromBase64(wrapped.salt),
      wrapped.iterations,
    );
    return await crypto.subtle.unwrapKey(
      "raw",
      fromBase64(wrapped.wrappedKey),
      wrappingKey,
      "AES-KW",
      { name: "AES-GCM" },
      extractable,
      ["encrypt", "decrypt"],
    );
  } catch {
    throw new UnlockFailedError();
  }
}

// NFC, so the same passphrase typed on different devices gives the same key.
const passphraseSecret = (passphrase: string) => passphrase.normalize("NFC");

export function wrapWithPassphrase(dataKey: CryptoKey, passphrase: string) {
  return wrapWithSecret(dataKey, passphraseSecret(passphrase));
}

export function unwrapWithPassphrase(wrapped: WrappedKey, passphrase: string) {
  return unwrapWithSecret(wrapped, passphraseSecret(passphrase), false);
}

// 128 random bits as 32 hex digits in groups of 4, e.g. "1f3a-9c2e-…".
export function createRecoveryCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(RECOVERY_CODE_BYTES));
  const hex = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  return hex.match(/.{4}/g)!.join("-");
}

// Accepts the code as typed: any case, spaces or dashes.
function recoveryCodeSecret(code: string): string {
  const hex = code.toLowerCase().replace(/[\s-]/g, "");
  if (!/^[0-9a-f]{32}$/.test(hex)) throw new UnlockFailedError();
  return hex;
}

export async function wrapWithRecoveryCode(dataKey: CryptoKey, code: string) {
  return wrapWithSecret(dataKey, recoveryCodeSecret(code));
}

// Extractable: recovery wraps the same data key again with a new passphrase.
export async function unwrapWithRecoveryCode(
  wrapped: WrappedKey,
  code: string,
) {
  return unwrapWithSecret(wrapped, recoveryCodeSecret(code), true);
}

// Stored as "v1.<IV base64>.<ciphertext base64>"; a fresh random IV every time.
export async function encryptField(
  key: CryptoKey,
  plaintext: string,
  field: FieldContext,
): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv, additionalData: fieldAad(field) },
    key,
    encoder.encode(plaintext),
  );
  return `${VERSION}.${toBase64(iv)}.${toBase64(new Uint8Array(ciphertext))}`;
}

export async function decryptField(
  key: CryptoKey,
  stored: string,
  field: FieldContext,
): Promise<string> {
  const [version, iv, ciphertext, ...rest] = stored.split(".");
  if (version !== VERSION || !iv || !ciphertext || rest.length > 0) {
    throw new DecryptFailedError();
  }
  try {
    const ivBytes = fromBase64(iv);
    if (ivBytes.length !== IV_BYTES) throw new DecryptFailedError();
    const plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: ivBytes, additionalData: fieldAad(field) },
      key,
      fromBase64(ciphertext),
    );
    return decoder.decode(plaintext);
  } catch {
    throw new DecryptFailedError();
  }
}

export const webFieldCrypto: FieldCrypto = {
  encrypt: encryptField,
  decrypt: decryptField,
};

export const webKeyCrypto: KeyCrypto = {
  generateDataKey,
  toDeviceKey,
  wrapWithPassphrase,
  unwrapWithPassphrase,
  createRecoveryCode,
  wrapWithRecoveryCode,
  unwrapWithRecoveryCode,
};
