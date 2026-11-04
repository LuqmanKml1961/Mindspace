// A category as the server stores it (D-021): the name is ciphertext, encrypted on the device.
// Names can't be compared or sorted here, so uniqueness and order are handled on the device.
export type EncryptedCategory = {
  id: string;
  userId: string;
  nameCiphertext: string;
  createdAt: Date;
};

export type NewEncryptedCategory = Pick<
  EncryptedCategory,
  "userId" | "nameCiphertext"
>;

// Every method is scoped to userId, on top of RLS.
export interface CategoryRepository {
  create(category: NewEncryptedCategory): Promise<EncryptedCategory>;
  // Oldest first; the device sorts by name after decrypting.
  list(userId: string): Promise<EncryptedCategory[]>;
  // Throws NotFoundError if there is no such category for this user.
  rename(
    userId: string,
    id: string,
    nameCiphertext: string,
  ): Promise<EncryptedCategory>;
  // Its thoughts stay, without a category. Throws NotFoundError if missing.
  delete(userId: string, id: string): Promise<void>;
}
