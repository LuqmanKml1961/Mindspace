import {
  makeForgetDevice,
  makeGetDeviceKey,
} from "@/application/encryption/device-key";
import type { KeyServer } from "@/application/encryption/ports";
import { makeRecoverWithCode } from "@/application/encryption/recover-with-code";
import { makeSetUpEncryption } from "@/application/encryption/set-up-encryption";
import { makeUnlockDevice } from "@/application/encryption/unlock-device";
import {
  makeCreateCategory,
  makeDeleteCategory,
  makeOpenCategories,
  makeRenameCategory,
} from "@/application/thoughts/categories";
import type {
  CategoryServer,
  ThoughtServer,
} from "@/application/thoughts/ports";
import type { TaskServer } from "@/application/tasks/ports";
import {
  makeCreateTask,
  makeDeleteTask,
  makeOpenTasks,
  makeUpdateTask,
} from "@/application/tasks/tasks";
import {
  makeCaptureThought,
  makeDeleteThought,
  makeOpenThoughts,
  makeUpdateThought,
} from "@/application/thoughts/thoughts";
import { indexedDbKeyStore } from "@/infrastructure/crypto/device-key-store";
import {
  webFieldCrypto,
  webKeyCrypto,
} from "@/infrastructure/crypto/web-crypto";

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

export function createBrainDumpUseCases(servers: {
  thoughts: ThoughtServer;
  categories: CategoryServer;
}) {
  const deps = {
    crypto: webFieldCrypto,
    device: indexedDbKeyStore,
    ...servers,
  };
  return {
    openThoughts: makeOpenThoughts(deps),
    captureThought: makeCaptureThought(deps),
    updateThought: makeUpdateThought(deps),
    deleteThought: makeDeleteThought(deps),
    openCategories: makeOpenCategories(deps),
    createCategory: makeCreateCategory(deps),
    renameCategory: makeRenameCategory(deps),
    deleteCategory: makeDeleteCategory(deps),
  };
}

export function createTaskUseCases(servers: { tasks: TaskServer }) {
  const deps = {
    crypto: webFieldCrypto,
    device: indexedDbKeyStore,
    ...servers,
  };
  return {
    openTasks: makeOpenTasks(deps),
    createTask: makeCreateTask(deps),
    updateTask: makeUpdateTask(deps),
    deleteTask: makeDeleteTask(deps),
  };
}
