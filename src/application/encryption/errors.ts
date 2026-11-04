// Wrong passphrase or recovery code (or damaged key data): nothing was unlocked.
export class UnlockFailedError extends Error {
  constructor() {
    super("That didn’t unlock your thoughts. Check it and try again.");
    this.name = "UnlockFailedError";
  }
}

// Tampered, moved or malformed ciphertext, or the wrong key.
export class DecryptFailedError extends Error {
  constructor() {
    super("This text couldn’t be decrypted.");
    this.name = "DecryptFailedError";
  }
}
