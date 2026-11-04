import { z } from "zod";
import { ENCRYPTION_VERSION } from "@/domain/encryption/user-keys";

// Mirrors the user_keys checks: 16-byte salts (24 base64 chars), AES-KW of a 32-byte key
// (40 bytes, 56 chars) and at least 600,000 PBKDF2 iterations.
export const wrappedKeySchema = z.object({
  salt: z.string().regex(/^[A-Za-z0-9+/]{22}==$/),
  iterations: z.number().int().min(600_000),
  wrappedKey: z.string().regex(/^[A-Za-z0-9+/]{54}==$/),
});

export const userKeysSchema = z.object({
  version: z.literal(ENCRYPTION_VERSION),
  passphrase: wrappedKeySchema,
  recovery: wrappedKeySchema,
});
