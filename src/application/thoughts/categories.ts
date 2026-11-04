import { requireDeviceKey } from "@/application/encryption/device-key";
import type {
  DeviceKeyStore,
  FieldContext,
  FieldCrypto,
} from "@/application/encryption/ports";
import type { CategoryServer } from "@/application/thoughts/ports";
import { ConflictError } from "@/domain/shared/errors";
import {
  createCategory,
  isSameCategoryName,
  toCategoryName,
  type Category,
} from "@/domain/thoughts/category";
import type { EncryptedCategory } from "@/domain/thoughts/category-repository";

// Browser side (D-021). The server can't read names, so uniqueness and sorting happen here,
// against the user's decrypted categories.

type Deps = { crypto: FieldCrypto; device: DeviceKeyStore };

const nameField = (userId: string): FieldContext => ({
  table: "categories",
  column: "name",
  userId,
});

function withName(record: EncryptedCategory, name: string): Category {
  return {
    id: record.id,
    userId: record.userId,
    name,
    createdAt: record.createdAt,
  };
}

// Best effort: another device could add the same name before this list was loaded.
function ensureUnique(name: string, existing: Category[], exceptId?: string) {
  const duplicate = existing.find(
    (category) =>
      category.id !== exceptId && isSameCategoryName(category.name, name),
  );
  if (duplicate) {
    throw new ConflictError(
      `You already have a category called “${duplicate.name}”.`,
    );
  }
}

// Records from a Server Component, decrypted and sorted by name. Throws DecryptFailedError.
export function makeOpenCategories(deps: Deps) {
  return async ({
    userId,
    records,
  }: {
    userId: string;
    records: EncryptedCategory[];
  }): Promise<Category[]> => {
    const key = await requireDeviceKey(deps.device, userId);
    const categories = await Promise.all(
      records.map(async (record) =>
        withName(
          record,
          await deps.crypto.decrypt(
            key,
            record.nameCiphertext,
            nameField(userId),
          ),
        ),
      ),
    );
    return categories.sort((a, b) => a.name.localeCompare(b.name));
  };
}

export function makeCreateCategory(
  deps: Deps & { categories: CategoryServer },
) {
  return async ({
    userId,
    name,
    existing,
  }: {
    userId: string;
    name: string;
    existing: Category[];
  }): Promise<Category> => {
    const category = createCategory({ userId, name });
    ensureUnique(category.name, existing);
    const key = await requireDeviceKey(deps.device, userId);
    const record = await deps.categories.create(
      await deps.crypto.encrypt(key, category.name, nameField(userId)),
    );
    return withName(record, category.name);
  };
}

export function makeRenameCategory(
  deps: Deps & { categories: CategoryServer },
) {
  return async ({
    userId,
    id,
    name,
    existing,
  }: {
    userId: string;
    id: string;
    name: string;
    existing: Category[];
  }): Promise<Category> => {
    const checked = toCategoryName(name);
    ensureUnique(checked, existing, id);
    const key = await requireDeviceKey(deps.device, userId);
    const record = await deps.categories.rename(
      id,
      await deps.crypto.encrypt(key, checked, nameField(userId)),
    );
    return withName(record, checked);
  };
}

export function makeDeleteCategory(deps: { categories: CategoryServer }) {
  return ({ id }: { id: string }) => deps.categories.delete(id);
}
