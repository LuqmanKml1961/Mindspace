import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Unit tests for the inner layers only: pure TypeScript, no React or browser (P3.1).
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
    include: ["src/domain/**/*.test.ts", "src/application/**/*.test.ts"],
  },
});
