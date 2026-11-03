import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Onion Architecture dependency rules: see docs/ARCHITECTURE.md §4.
// Matches an import of a src/ layer by alias (@/layer) or by relative path (../layer).
const layerImport = (layers) => `^(@/|(\\.\\./)+)(${layers.join("|")})(/|$)`;

const restrictImports = (...patterns) => ({
  "no-restricted-imports": ["error", { patterns }],
});

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/domain/**"],
    rules: restrictImports(
      {
        regex: layerImport([
          "application",
          "infrastructure",
          "app",
          "components",
          "lib",
        ]),
        message: "Domain is the core layer and must not import outer layers.",
      },
      {
        regex: "^(react|react-dom|next|zod)(/|$)|^@supabase/",
        message:
          "Domain must stay framework-free: no React, Next.js, Supabase or zod.",
      },
    ),
  },
  {
    files: ["src/application/**"],
    rules: restrictImports(
      {
        regex: layerImport(["infrastructure", "app", "components", "lib"]),
        message: "Application may only depend on the domain layer.",
      },
      {
        regex: "^(react|react-dom|next)(/|$)|^@supabase/",
        message: "Application must not depend on React, Next.js or Supabase.",
      },
    ),
  },
  {
    files: ["src/infrastructure/**"],
    rules: restrictImports({
      regex: layerImport(["app", "components"]),
      message: "Infrastructure must not import presentation code.",
    }),
  },
  {
    files: ["src/app/**", "src/components/**", "src/lib/**"],
    rules: restrictImports(
      {
        regex: "^@supabase/",
        message:
          "Presentation must not use Supabase directly; go through src/infrastructure/container.",
      },
      {
        regex: "^(@/|(\\.\\./)+)infrastructure(/(?!container$).*)?$",
        message:
          "Presentation may only import infrastructure through src/infrastructure/container.",
      },
    ),
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
