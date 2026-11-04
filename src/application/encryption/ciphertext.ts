// The stored field format (D-021): "v1.<12-byte IV, 16 base64 chars>.<ciphertext and tag,
// base64>". The same pattern and maximums are checked by the database (DATA_MODEL.md).
export const CIPHERTEXT_PATTERN =
  /^v1\.[A-Za-z0-9+/]{16}\.([A-Za-z0-9+/]{4})+([A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

// The longest ciphertext for a text of this many characters: at most 4 UTF-8 bytes each, plus
// the 16-byte GCM tag, in base64, after the 20-character "v1.<IV>." prefix.
export function ciphertextMaxLength(characters: number): number {
  return 20 + 4 * Math.ceil((4 * characters + 16) / 3);
}
