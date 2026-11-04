export const ENCRYPTION_VERSION = 1;

// A data key wrapped by a key derived from a secret (D-021). Safe to store: useless without it.
export type WrappedKey = {
  salt: string;
  iterations: number;
  wrappedKey: string;
};

export type UserKeys = {
  version: typeof ENCRYPTION_VERSION;
  passphrase: WrappedKey;
  recovery: WrappedKey;
};
