import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Unit tests for the inner layers and the Web Crypto module (Node 22 has the same API).
export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^@\//,
        replacement: fileURLToPath(new URL("./src/", import.meta.url)),
      },
    ],
  },
  test: {
    include: [
      "src/domain/**/*.test.ts",
      "src/application/**/*.test.ts",
      "src/infrastructure/crypto/**/*.test.ts",
    ],
  },
});
