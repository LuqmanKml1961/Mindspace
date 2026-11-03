# Mindspace — Development Log

## ▶ Resume here

| Item               | Value                                              |
| ------------------ | -------------------------------------------------- |
| **Current phase**  | Phase 1 — Foundation                               |
| **Phase progress** | 11 / 11 tasks done. Phase acceptance check pending |
| **Last updated**   | 2026-11-03 (Session 2)                             |
| **Blocked on**     | Nothing                                            |

**Next actions (in order)**

1. **Phase 1 acceptance check.** Not yet done in a real browser: at 360px and on desktop with no
   horizontal scroll, keyboard nav with visible focus, and the active route marked. Check on
   your phone at https://m1ndspace.vercel.app, or ask Claude to run a browser check. Then mark
   Phase 1 Done.
2. **Upgrade to the Next.js security release** as soon as it is on npm (see Known issues). This
   is urgent, because the app is now public.
3. **Phase 2 (P2.1):** create a hosted Supabase free-tier project (your action), then set up
   the CLI and the local stack.

**Running the app:** use **pnpm** (`pnpm dev`), not yarn. The `packageManager` field enforces
pnpm. If the dev server shows old colours, restart it and hard-refresh.

**Known issues**

- **The Next.js security release is pending and the app is now live on 16.4.4.** Next.js
  announced seven medium vulnerabilities for 2026-11-03; affected versions are not yet stated
  (source: nextjs.org/blog/upcoming-nextjs-security-release-november-2026). It was not on npm
  at the last check (`latest` = 16.4.4). You deployed to https://m1ndspace.vercel.app on
  2026-11-03. There is no sign-in and no user data yet, so exposure is low, but upgrade `next`
  and `eslint-config-next` to the patched version as soon as it is published, then redeploy.

## How to resume (for you or Claude)

1. Read **Resume here** above.
2. Open the current phase in [`ROADMAP.md`](ROADMAP.md) and take the first unticked task.
3. Check [`DECISIONS.md`](DECISIONS.md) for anything that task still needs.
4. Keep [`ARCHITECTURE.md`](ARCHITECTURE.md) and [`DATA_MODEL.md`](DATA_MODEL.md) open for
   conventions and the schema.

## How to update this log (end of every session)

1. Update the **Resume here** block: phase, progress, date, blockers, next actions.
2. Tick the completed tasks in `ROADMAP.md`.
3. Add a new **Session log** entry at the top of that section (newest first), using the template.
4. Record new or changed decisions in `DECISIONS.md`, and data-model changes in `DATA_MODEL.md`.
5. Update the **Phase tracker** when a phase starts or finishes.

## Phase tracker

| Phase | Name                            | Status      | Started    | Completed  |
| ----- | ------------------------------- | ----------- | ---------- | ---------- |
| 0     | Planning and decisions          | Done        | 2026-11-03 | 2026-11-03 |
| 1     | Foundation                      | In progress | 2026-11-03 | —          |
| 2     | Supabase and authentication     | Not started | —          | —          |
| 3     | Brain Dump                      | Not started | —          | —          |
| —     | Checkpoint A: personal use      | Not started | —          | —          |
| 4     | External Memory                 | Not started | —          | —          |
| 5     | Mind Clarity                    | Not started | —          | —          |
| 6     | PWA, privacy and beta readiness | Not started | —          | —          |
| —     | Validation stages 1–3           | Not started | —          | —          |

## Environment snapshot

Checked 2026-11-03 on Windows 11 Pro. Update this when tools change.

| Tool         | Version / state                                                           |
| ------------ | ------------------------------------------------------------------------- |
| Node.js      | v22.23.1                                                                  |
| npm          | 10.9.8                                                                    |
| pnpm         | 11.17.0 (latest stable on npm: 12.16.1)                                   |
| yarn         | 4.12.0                                                                    |
| Docker       | 29.6.1 (daemon not checked)                                               |
| Git          | 2.44.0.windows.1                                                          |
| Supabase CLI | not installed (plan: project dev dependency, D-011)                       |
| GitHub CLI   | not installed                                                             |
| Git remote   | `origin` → https://github.com/LuqmanKml1961/Mindspace.git                 |
| Git history  | branch `main`; you push (Claude doesn't). `cb37847` was pushed 2026-11-03 |
| Deployment   | https://m1ndspace.vercel.app (Vercel, from `main`; D-009)                 |

**Project dependencies** (as of P1.5, 2026-11-03):

| Package                                | Version        | Notes                                                                                           |
| -------------------------------------- | -------------- | ----------------------------------------------------------------------------------------------- |
| next / eslint-config-next              | 16.4.4         | published 2026-11-02; the security release is pending (Known issues)                            |
| react / react-dom                      | 19.3.0         | exact pin from the template                                                                     |
| tailwindcss / @tailwindcss/turbopack   | 4.3.3          | Tailwind runs through the Turbopack loader in `next.config.ts`; there is no `postcss.config`    |
| typescript                             | 5.9.3          |                                                                                                 |
| eslint                                 | 9.39.5         | npm flags ESLint 9 as deprecated (10.x exists); kept on the template's `^9`                     |
| @types/node                            | 20.19.43       | template default (`^20`), while local Node is 22                                                |
| prettier / prettier-plugin-tailwindcss | 3.9.10 / 0.8.1 | exact pins (P1.3)                                                                               |
| shadcn                                 | 4.23.0         | dev dependency (moved by `mcp init`); provides `shadcn/tailwind.css`, imported by `globals.css` |
| @base-ui/react                         | 1.9.0          | component primitives (D-012)                                                                    |
| cn                                     | 0.5.1          | shadcn's class merger, replacing clsx + tailwind-merge (D-012)                                  |
| class-variance-authority               | 0.7.1          | component variants (`cva`)                                                                      |
| @hugeicons/react / core-free-icons     | 1.1.10 / 4.4.0 | icons, from the Maia preset (D-012); `lucide-react` removed                                     |
| tw-animate-css                         | 1.4.0          | animation utilities imported by `globals.css`                                                   |

## Personal-use observations

Filled in during Checkpoint A and Stage 1. Prompts from spec §15: which features you use
repeatedly, how fast capture feels, whether you return to saved thoughts, whether reminders help
or distract, and what feels unnecessarily complicated.

_None yet._

---

## Session log

<!--
Template — copy it above the newest entry:

### YYYY-MM-DD — Session N: <short title>
- **Phase:** <phase> · **Tasks:** <IDs worked on>
- **Done:**
  - ...
- **Decisions:** <IDs confirmed or changed, or "none">
- **Problems / findings:**
  - ...
- **Commits:** <hash + message, or "none">
- **Next:** <first task for the next session>
-->

### 2026-11-03 — Session 2 (cont.): gitignore, README, deployment

- **Phase:** 1 · **Tasks:** P1.9, P1.10 (done by you), P1.11
- **Done:**
  - P1.9: `.gitignore` now has `!.env.example` and `.claude/settings.local.json`. Verified with
    `git -c core.excludesFile=/dev/null check-ignore -v`: `.env.example` is allowed; `.env`,
    `.env.local` and `.env.production.local` are ignored; `settings.local.json` is ignored by the
    repo rule; `settings.json` is still tracked. `.env.example` itself moves to P2.2.
  - P1.10: you connected Vercel and deployed https://m1ndspace.vercel.app. Verified read-only:
    `/` returns a 307 to `/home`, the title is "Home · Mindspace", both navs are present, and
    `origin/main` = local `main` = `cb37847`.
  - P1.11: rewrote `README.md` with the tagline, live URL, status, stack, prerequisites (Node
    20.9+ per Next.js `engines`; pnpm 11 pinned), pnpm-only commands, scripts, the pre-commit
    checks and a docs map.
- **Decisions:** none new.
- **Problems / findings:**
  - The deploy happened before the Next.js security release existed, so the upgrade is now
    urgent rather than "before the first deploy".
  - The Phase 1 acceptance checks for layout (360px, no horizontal scroll, keyboard, focus) are
    not yet verified in a real browser. Only the HTML was checked.
- **Commits:** `chore: ignore personal Claude settings and allow .env.example (P1.9)` and
  `docs: rewrite README and record the Vercel deployment (P1.10, P1.11)`
- **Next:** Phase 1 acceptance check, then the security upgrade, then P2.1.

### 2026-11-03 — Session 2 (cont.): app shell and placeholder screens

- **Phase:** 1 · **Tasks:** P1.7, P1.8, done together because the shell can't be checked without
  routes. They are committed separately.
- **Done:**
  - Read the bundled Next.js 16.4.4 docs for route groups, `usePathname` (client-only), `redirect`
    (307 in Server Components), `LayoutProps` and the metadata `title.template`. Read the
    Hugeicons 1.1.10 and Base UI 1.9.0 type definitions for `HugeiconsIcon` props and Button
    `render`/`nativeButton`. Confirmed the five icon names exist in the free set.
  - Searched the shadcn registry (`sidebar`, `navigation`, `bottom`, `tab`). There is no bottom
    nav component. A Sidebar dry run showed it would overwrite Button and add 7 files, so I chose
    a custom `src/components/layout/app-nav.tsx`.
  - Added `src/app/(app)/layout.tsx` (sidebar, `main`, tab bar) and `src/lib/site.ts` (name,
    tagline, description). The root metadata now uses the `%s · Mindspace` title template.
  - P1.8: five placeholder pages, `/` now `redirect("/home")`, and the five unused template SVGs
    removed.
  - Verified: lint, typecheck, format and build pass (7 routes). Against your running dev server:
    `/` returns a 307 to `/home`; every route serves the right `<h1>` and title; exactly the
    current link carries `aria-current="page"` in both navs.
- **Decisions:** none new. The custom nav instead of shadcn Sidebar is recorded in ROADMAP P1.7
  and DESIGN.md §6a.
- **Problems / findings:**
  - Base UI `Button` with `nativeButton={false} render={<Link />}` rendered
    `<a role="button">`, which is wrong for navigation. Switched to
    `<Link className={buttonVariants(…)}>`; the re-check shows a plain `<a>`. Recorded as a
    DESIGN.md rule.
  - The `(app)` group layout's only generated route key is `"/"` (route groups aren't in
    paths), so it uses `LayoutProps<"/">` like the root layout.
  - Your running dev server still serves the pre-P1.6 stylesheet. Restart it to see the
    palette.
- **Commits:** `feat(shell): add app shell with sidebar and bottom tab bar (P1.7)` and
  `feat(pages): add placeholder screens and redirect / to /home (P1.8)`
- **Next:** P1.9.

### 2026-11-03 — Session 2 (cont.): design tokens

- **Phase:** 1 · **Tasks:** P1.6
- **Done:**
  - Mapped your five-colour palette (D-013) onto every shadcn token in `src/app/globals.css`,
    in both light and dark. The values were generated by a script from the checked set, so no
    hex was hand-typed. The token names are unchanged and Maia's `--radius` is kept.
  - Contrast was checked with the WCAG formula; the method was validated against known values.
    The first mapping failed four dark-mode pairs. For each, the smallest passing adjustment was
    found by search: dark primary `#8eb095` (Muted Teal plus 8% white), dark muted text
    `#adc1ad`, and dark destructive `#e8aa9f`. All 15 text checks per theme now pass 4.5:1, and
    the focus ring passes 3:1.
  - Added `next-themes` 0.4.6 to `layout.tsx`. It already ships `"use client"`, so no wrapper is
    needed. Set up as the README describes: `suppressHydrationWarning` on `<html>`,
    `attribute="class"`, `defaultTheme="system"`, `enableSystem`, `disableTransitionOnChange`.
  - Option B in Button: `default` is 40px (`h-10 px-4`), `lg` 44px (`h-11 px-5`), `icon` 40px and
    `icon-lg` 44px. `xs` and `sm` are unchanged.
  - Wrote `docs/DESIGN.md`. Rebuilt the scratch preview page with your palette.
  - Verified: lint, typecheck, format and build pass. The production CSS contains the new tokens.
    Your running dev server serves the next-themes script but still has the old stylesheet, so
    restart it.
- **Decisions:** D-013 Accepted (your palette, 40px controls).
- **Problems / findings:**
  - You tried `yarn dev`, which fails because of the `packageManager` pnpm pin. Use `pnpm dev`.
    The README still shows the template's yarn and npm lines until P1.11.
  - Next.js 16 refuses a second dev server for the same project ("Another next dev server is
    already running"), so checks ran against your server with read-only GET requests.
  - Border and input lines are decorative (about 1.4–1.6:1). Review them in P6.4 (DESIGN.md §3).
- **Commits:** `feat(ui): add palette design tokens, system dark mode and 40px controls (P1.6)`
- **Next:** P1.7.

### 2026-11-03 — Session 2 (cont.): switch to the Maia style

- **Phase:** 1 · **Tasks:** D-012 follow-up (no ROADMAP task)
- **Done:**
  - You chose Maia. Ran `shadcn apply --preset maia --yes` with the installed 4.23.0. Because
    Button had no local changes, overwriting it was safe. `components.json` is now `base-maia`
    with `hugeicons`, Button is regenerated (pill shape, roomier sizes), and `layout.tsx` uses
    Figtree on `--font-sans`.
  - Cleaned up after `apply`: removed the unused `Geist` import it left in `layout.tsx`, and
    removed `lucide-react`, which nothing imports now.
  - Verified: lint, typecheck, format and build pass. In the compiled CSS the next/font rule
    `--font-sans: "Figtree"` sits at the top level (unlayered), and nothing references Geist
    Sans.
- **Decisions:** D-012 Accepted (Base UI with Maia).
- **Problems / findings:**
  - The skill's style table says Maia has "40px+ controls", but the generated Button defaults to
    36px (`h-9`) with `lg` at 40px. Control height is now a P1.6 decision.
  - This time `apply` recognised the font variable correctly, because we had renamed it to
    `--font-sans` in P1.5. The P1.5 fix paid off.
- **Commits:** `feat(ui): switch shadcn style to Maia (D-012)`
- **Next:** P1.6.

### 2026-11-03 — Session 2 (cont.): shadcn skill and MCP config

- **Phase:** 1 · **Tasks:** tooling, at your request (no ROADMAP task)
- **Done:**
  - Installed the `shadcn` agent skill:
    `yarn dlx skills@1.7.4 add shadcn/ui --skill shadcn -a claude-code --copy -y`, with telemetry
    off (`DO_NOT_TRACK=1`). I pinned 1.7.4 (15 days old) because 1.7.5 and 1.7.6 were under a
    day old. Files: `.claude/skills/shadcn/` and `skills-lock.json`. Skipped the repo's other
    skill, `migrate-radix-to-base`, which does not apply.
  - Reviewed the skill before use. I scanned every file for risky content and read SKILL.md,
    the bundled script, `customization.md`, `rules/styling.md`, `mcp.md` and `design-system.md`
    in full. Nothing malicious was found. The script only reads files.
  - Ran `yarn dlx shadcn@latest mcp init --client vscode`, which wrote `.vscode/mcp.json`. It
    also moved `shadcn` from `dependencies` to `devDependencies` (same 4.23.0; the lockfile only
    moved the entry). The build still passes.
  - Added `.vscode/mcp.json` to `.prettierignore`, because the CLI writes its own JSON layout.
- **Findings:**
  - When the skill loads, it runs `npx shadcn@latest info --json`, and its `allowed-tools`
    pre-approves `npx/pnpm dlx shadcn@latest *`. `.vscode/mcp.json` also uses
    `shadcn@latest`. These are unpinned, unlike the rest of the project.
  - The skill's `design-system.md` describes Nova as compact (32–36px controls) and Maia as
    soft with generous spacing (40px+). This reopened D-012.
  - The skill documents dark mode as `next-themes` with `defaultTheme="system"`, keeping
    `.dark`. ROADMAP P1.6 now says this instead of a media-query switch.
- **Commits:** `chore: add shadcn agent skill and VS Code MCP config`
- **Next:** D-012 style choice, then P1.6.

### 2026-11-03 — Session 2 (cont.): shadcn/ui

- **Phase:** 1 · **Tasks:** P1.5
- **Done:**
  - Read the `shadcn@4.23.0` CLI source before running it. `init` offers a component library
    (`base`, `radix` or `aria`) and a style preset. Ran `init --defaults --yes --no-monorepo`,
    which means `base-nova`. It wrote `components.json`, `src/lib/utils.ts`,
    `src/components/ui/button.tsx` and the `globals.css` theme tokens, and added 6 dependencies
    (224 packages including transitive ones).
  - Fixed a font bug caused by `init`. It set `--font-sans: var(--font-sans)` but left the
    layout's `--font-geist-sans`, so the compiled CSS had a self-referencing variable and `html`
    would fall back to the browser's default font. Renamed the next/font variable in
    `layout.tsx` to `--font-sans`, which is the name shadcn's font step looks for. Verified in
    the compiled CSS: the next/font rule is unlayered (depth 0) and overrides the self-reference
    inside `@layer theme`.
  - Added `tailwindFunctions: ["cn", "cva"]` to `.prettierrc` and formatted the generated files.
  - Lint (including the layer rules), typecheck, format check and build all pass.
- **Decisions:** D-012 recorded as Proposed (applied). Base UI with the Nova preset is the CLI's
  recommended default; it waits for your confirmation.
- **Problems / findings:**
  - shadcn 4.x uses its own young `cn` package instead of `clsx` + `tailwind-merge`. Ownership
    was verified on npm (see D-012).
  - shadcn's dark mode is class-based (`.dark`), but D-002 says to follow the system setting.
    This is noted in ROADMAP P1.6.
  - `components.json` has a `hooks` alias. A `src/hooks/` folder would need adding to the
    presentation lint rule (noted in ARCHITECTURE.md §4).
  - Long `.{0,3000}` grep regexes over minified bundles hang. Use small Node scripts instead.
- **Commits:** `feat(ui): initialise shadcn/ui with Base UI and fix font variable (P1.5)`
- **Next:** confirm D-012, then P1.6.

### 2026-11-03 — Session 2 (cont.): onion import rules

- **Phase:** 1 · **Tasks:** P1.4
- **Done:**
  - Added per-layer `no-restricted-imports` rules to `eslint.config.mjs` for domain, application,
    infrastructure and presentation (app, components, lib), as in ARCHITECTURE.md §4.
  - Verified with 31 temporary probe imports across all five layer folders. Every case matched
    its expected result (blocked or allowed), covering alias and relative paths, `import type`,
    `export … from`, and the container-only rule for presentation. The probes were deleted.
  - `eslint` and `format:check` pass on the real project.
  - Replaced the sketch in ARCHITECTURE.md §4 with a pointer to `eslint.config.mjs`, and added
    `src/lib/**` to the presentation row.
- **Decisions:** none new. The rules use `regex` patterns, not gitignore-style `group`
  patterns, so one expression covers alias and relative imports.
- **Problems / findings:**
  - Read in the ESLint 9.39.5 source: the rule does not check dynamic `import()`. This is
    documented in ARCHITECTURE.md §4.
  - `eslint-config-next` does not set `no-restricted-imports`, so these overrides replace
    nothing.
  - The layer folders (`src/domain` etc.) still do not exist. They are created by the first
    feature task that needs them, and the rules apply automatically.
- **Commits:** `chore: enforce onion architecture import rules with ESLint (P1.4)`
- **Next:** P1.5.

### 2026-11-03 — Session 2 (cont.): typecheck and Prettier

- **Phase:** 1 · **Tasks:** P1.2, P1.3
- **Done:**
  - P1.2: added `typecheck` (`next typegen && tsc --noEmit`). It passes after deleting `.next/`,
    which matches a fresh checkout.
  - P1.3: added `prettier` 3.9.10 and `prettier-plugin-tailwindcss` 0.8.1 (exact pins), plus
    `.prettierrc` with `tailwindStylesheet`, the `format` and `format:check` scripts, and a
    `.prettierignore`. The ignore list covers files that tools generate or rewrite
    (`pnpm-lock.yaml`, `pnpm-workspace.yaml`, `AGENTS.md`), the spec, and `.claude/`.
  - Added `.gitattributes` (`* text=auto eol=lf`) so Windows checkouts stay LF, which matches
    Prettier's default.
  - Ran `pnpm format` across the repo. Code changes are Tailwind class order only; doc changes
    are table padding and blank lines.
- **Decisions:** no `eslint-config-prettier`. It was checked rather than assumed: no active ESLint
  rule conflicts with Prettier.
- **Problems / findings:**
  - Prettier exposed broken markdown in ROADMAP P1.1: the sub-list was over-indented, so it
    rendered as one paragraph. Fixed the source.
  - Prettier would flip `pnpm-workspace.yaml` to double quotes, while pnpm rewrites it with single
    quotes, so it is in `.prettierignore` to avoid churn.
  - Once, `pnpm exec eslint --print-config > file` hung for over 2 minutes, while
    `node node_modules/eslint/bin/eslint.js` finished in 12 s. The cause was not investigated.
- **Commits:** `chore: add typecheck script and Prettier with Tailwind sorting (P1.2, P1.3)`
- **Next:** P1.4.

### 2026-11-03 — Session 2: Phase 1 start, scaffold

- **Phase:** 1 · **Tasks:** P1.1
- **Done:**
  - Scaffolded with `create-next-app@16.4.4` into a temporary lowercase folder (flags in ROADMAP
    P1.1; Cache Components **off**, React Compiler off, AGENTS.md on). Copied the files into the
    repo root without overwriting anything, then ran `pnpm install` (pnpm 11.17.0).
  - Verified: `pnpm lint` passes; `pnpm build` passes (`/` is static); `next dev` serves `/`
    with HTTP 200; `tsc --noEmit` passes once route types exist.
  - Verified in `node_modules/next/dist/server/lib/generate-agent-files.js` that `next dev` only
    manages a block inside `AGENTS.md` and never touches `CLAUDE.md`.
- **Decisions:** Cache Components off (your call; it can be enabled later in `next.config.ts`).
  Next.js stays on 16.4.4 rather than 16.4.3, with an upgrade to the security release before
  the first deploy.
- **Problems / findings:**
  - pnpm 11 holds back very new releases. Because create-next-app pinned exact versions, pnpm
    added 12 exact-version entries (`next@16.4.4` and its `@next/*` packages) to
    `minimumReleaseAgeExclude` in `pnpm-workspace.yaml`. The same file has `allowBuilds`, with
    the `sharp` and `unrs-resolver` build scripts disabled (template default).
  - A bare `tsc --noEmit` fails on a clean checkout (`LayoutProps` comes from the generated
    `.next/types/routes.d.ts`), so the P1.2 script runs `next typegen` first.
  - The Next.js security release is pending (Known issues).
- **Commits:** `chore: scaffold Next.js app with pnpm (P1.1)`
- **Next:** P1.2.

### 2026-11-03 — Session 1: Planning

- **Phase:** 0 · **Tasks:** P0.1–P0.5 (Phase 0 complete)
- **Done:**
  - Read the spec (`mindspace_product_and_development_plan.md`).
  - Wrote `docs/ROADMAP.md`: phases 0–6 with task IDs, acceptance points, a Definition of Done,
    and the post-MVP backlog.
  - Wrote `docs/ARCHITECTURE.md`: Onion layers, target folder structure, dependency rules with an
    ESLint enforcement plan, request flow, conventions, security, and testing strategy.
  - Wrote `docs/DATA_MODEL.md`: draft schema for all MVP tables, the RLS template, the composite
    ownership-FK pattern, the RLS test checklist, and open questions Q-1 to Q-4.
  - Wrote `docs/DECISIONS.md`: D-001 to D-011, with the spec §18 defaults as Proposed. D-006
    (Onion) is Accepted from the standing rules.
  - Wrote this DEVLOG and a root `CLAUDE.md` so future sessions start from here.
  - Took the environment snapshot (above).
- **Decisions:** D-001 to D-011 all Accepted. D-006 comes from the standing rules; you confirmed
  the rest with the recommended defaults. D-009 is Vercel. D-010 adds "stable releases only".
- **Problems / findings:**
  - The spec has eight gaps or conflicts (voice ordering, no auth milestone, convert-to-task
    dependency, reminder scope, missing data export and deletion, category model, folder
    structure vs Onion, "public beta" vs staged launch). All are resolved in the plan; see
    DECISIONS.md "Spec gaps" G-1 to G-8.
  - The prompt-rules hook had a syntax error (a missing comma). You fixed it, and the hook now
    runs and injects the standing rules (P0.4).
  - Checked the create-next-app 16.4.4 source: it rejects `CLAUDE.md` and the spec file as
    conflicting files, overwrites `.gitignore`, and its template ignores `.env*`. Workarounds
    are noted in ROADMAP P1.1 and P1.9. Because of the overwrite, the `.gitignore` is deferred
    to P1.1.
  - It also fails on the folder name `Mindspace`, because npm package names cannot contain
    capitals. The plan is to scaffold in a temporary lowercase folder and copy the files in.
    Cache Components is on by default in 16.4.4, so you decide on it before P1.1.
  - pnpm stays at 11.17.0 for now (D-010). You will upgrade it yourself later.
- **Commits:**
  - `b80760e docs: add project plan, architecture and development log` (P0.5)
  - `4f65916 chore: add Claude Code project settings and rules hook`
  - `5c23720 docs: note create-next-app constraints for scaffolding`
  - `docs: record accepted decisions and close phase 0` (P0.3)
- **Next:** P1.1.
