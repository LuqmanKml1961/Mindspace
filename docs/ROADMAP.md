# Mindspace — Roadmap

- Product intent ("the spec"): [`mindspace_product_and_development_plan.md`](../mindspace_product_and_development_plan.md)
- Current status and session history: [`DEVLOG.md`](DEVLOG.md). Phase **status** lives there only.
- Decisions: [`DECISIONS.md`](DECISIONS.md) · Architecture: [`ARCHITECTURE.md`](ARCHITECTURE.md) ·
  Data model: [`DATA_MODEL.md`](DATA_MODEL.md)

Tick a task here (`- [x]`) when it meets the Definition of Done. DEVLOG entries and commit
messages refer to tasks by ID, e.g. `feat(thoughts): add capture box (P3.6)`.

## Phase overview

| Phase | Name                                   | Spec reference             |
| ----- | -------------------------------------- | -------------------------- |
| 0     | Planning and decisions                 | §17, §18                   |
| 1     | Foundation                             | Milestone 1                |
| 2     | Supabase and authentication            | §17 steps 7–8 (gap G-2)    |
| 3     | Brain Dump                             | Milestone 2 / MVP Module 1 |
| —     | Checkpoint A: personal use             | §17 step 10                |
| 4     | External Memory                        | Milestone 3 / MVP Module 2 |
| 5     | Mind Clarity                           | Milestone 5 / MVP Module 3 |
| 6     | PWA, privacy and beta readiness        | Milestone 6, §10, §14      |
| —     | Validation stages                      | §15                        |
| 7+    | Post-MVP backlog (Voice Capture first) | Milestone 4, §4            |

## Definition of Done (every task)

- The task's acceptance points are met and checked by hand at mobile width (~360px) and on desktop.
- `pnpm lint` and `pnpm typecheck` pass, plus `pnpm test` once tests exist. `pnpm build` must
  pass to complete a phase.
- Onion dependency rules hold (lint enforces them, see ARCHITECTURE.md §4).
- Every new table has RLS enabled, four owner policies, and a two-user pgTAP test.
- Every new screen has loading, empty and error states, with calm, non-judgemental copy.
- No secret keys in client code or `NEXT_PUBLIC_` variables.
- ROADMAP and DEVLOG are updated.
- The work is committed with a Conventional Commit message (`feat:`, `fix:`, `docs:`, `chore:`,
  `refactor:`, `test:`) **only after your confirmation**. Claude never pushes.

## How to work a task (spec §12, condensed)

1. Pick the next unticked task in the current phase. Re-read its acceptance points.
2. Inspect the code that already exists. Do not assume it.
3. Make the smallest change that completes the task.
4. Run the app and test the feature. Run lint, typecheck and tests.
5. For database work, review the migration and RLS policies.
6. Update the DEVLOG, then commit after confirmation.

---

## Phase 0 — Planning and decisions

- [x] P0.1 Read the spec and find its gaps and conflicts (see DECISIONS.md, "Spec gaps").
- [x] P0.2 Write the planning docs: ROADMAP, ARCHITECTURE, DATA_MODEL, DECISIONS, DEVLOG, CLAUDE.md.
- [x] P0.3 You confirm the decisions Phase 1 needs: D-002, D-004, D-005, D-009, D-010.
      (D-001 can stay as a working name.)
- [x] P0.4 Fix the syntax error in `.claude/hooks/user-prompt-rules.cjs`: a missing comma after
      `'Onion Architecture'`. Until it is fixed, the hook crashes and the standing rules are not
      injected.
- [x] P0.5 First commit: `docs: add project plan, architecture and development log`.

**Exit:** the Phase 1 decisions are confirmed and the docs are committed.

---

## Phase 1 — Foundation

**Goal (spec deliverable):** a responsive application shell with navigation and placeholder
screens. No backend yet.
**Needs:** D-002, D-005, D-010, and D-009 for P1.10.

- [x] P1.1 Scaffold with `create-next-app` using pnpm: TypeScript, App Router, ESLint, Tailwind CSS,
      `src/` directory, `@/*` import alias. Record the installed Next.js, React and Tailwind
      versions in the DEVLOG.

  _Constraints (checked in create-next-app 16.4.4 source, 2026-11-03):_

  - The package name comes from the folder name, and npm names cannot contain capitals, so
    scaffolding in `Mindspace/` fails.
  - It refuses a folder holding files outside its allow-list. `CLAUDE.md` and the spec file are
    not on the list.
  - It **overwrites** any existing `.gitignore`.
  - Without `--yes` and explicit flags it prompts interactively.
  - **Approach used:** scaffold into a temporary lowercase folder `mindspace/` with
    `--skip-install --disable-git`, copy the generated files (dotfiles included) into the repo
    root, then run `pnpm install`. This avoids the first three problems, and the explicit flags
    with `--yes` avoid the fourth.
  - **Flags used:** `--ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm
--no-react-compiler --no-cache-components --agents-md --no-agent-feedback --yes`.
  - Generated `AGENTS.md` points to the version-matched Next.js docs in
    `node_modules/next/dist/docs/`; use them to check APIs. Verified: `next dev` only manages a
    block in `AGENTS.md` (`node_modules/next/dist/server/lib/generate-agent-files.js`) and never
    touches `CLAUDE.md`.

- [x] P1.2 Confirm TypeScript strict mode (`strict: true` is already in the generated
      `tsconfig.json`). Add a `typecheck` script that runs `next typegen && tsc --noEmit`. A bare
      `tsc` fails on a clean checkout, because types such as `LayoutProps` are generated into
      `.next/types/` (verified 2026-11-03).
- [x] P1.3 Add Prettier (with Tailwind class sorting) and a `format` script, without conflicting
      with ESLint. Done with `prettier` 3.9.10 and `prettier-plugin-tailwindcss` 0.8.1, pinned
      exactly; the config is in `.prettierrc` (`tailwindStylesheet: ./src/app/globals.css`).
      `eslint-config-prettier` is not needed: none of the 86 active ESLint rules is on its
      358-rule disable list (checked 2026-11-03). `.gitattributes` keeps line endings LF.
- [x] P1.4 Enforce the onion dependency rules in ESLint (ARCHITECTURE.md §4). Check them by adding
      a forbidden import temporarily and confirming lint fails. Done with `regex` patterns in
      `eslint.config.mjs`. 31 temporary probe imports matched expectations (blocked or allowed),
      and the probes were removed afterwards.
- [x] P1.5 Initialise shadcn/ui. Add only the components the shell needs; add more when a feature
      needs them. Once `cn()` and `cva()` exist, add `"tailwindFunctions": ["cn", "cva"]` to
      `.prettierrc` so classes inside those calls are sorted too (the plugin README documents this
      under "Sorting classes in function calls"). Done with `shadcn@4.23.0 init --defaults`
      (`base-nova`), which also generated `Button`, then switched to `base-maia` with
      `shadcn apply --preset maia` (D-012). Fixed a font bug that `init` caused:
      it wrote `--font-sans: var(--font-sans)`, but the layout defined `--font-geist-sans`.
- [x] P1.6 Create the design tokens from D-002: colours (light, plus dark if confirmed), type
      scale, spacing and radius as CSS variables in the Tailwind theme. Write `docs/DESIGN.md`
      covering the tokens and tone of voice (spec §3 and §6). **Dark mode:** shadcn set up a
      class-based variant (`@custom-variant dark (&:is(.dark *))` plus a `.dark {}` token block),
      but D-002 says to follow the **system** setting. Keep the `.dark` convention and add
      `next-themes` with `<ThemeProvider attribute="class" defaultTheme="system" enableSystem>`.
      This is the approach documented in the shadcn skill (`.claude/skills/shadcn/customization.md`),
      and it keeps `shadcn apply` theme updates working. Check the `next-themes` version and its
      React 19.3 / Next 16.4 support before installing. **Control heights:** Maia's default is
      36px (`h-9`). Decide whether to raise it for touch. If so, change every control together,
      following the skill's "control heights move together" table. **Done:** your five-colour
      palette, mapped and contrast-checked (D-013, DESIGN.md §2–3); `next-themes` 0.4.6 with
      the system default; Button default 40px and `lg` 44px (option B); `docs/DESIGN.md`.
- [x] P1.7 Build the app shell: an `(app)` route group layout with a bottom tab bar on mobile and
      a sidebar on desktop. Nav items: Home, Brain Dump, Tasks, Mind Clarity, Settings. Done
      with a custom `app-nav.tsx`, not the shadcn Sidebar. A dry run showed that Sidebar would
      overwrite our 40px Button and add 7 unused files plus `src/hooks/`, and it has no bottom
      tab bar (DESIGN.md §6a).
- [x] P1.8 Add placeholder screens for `/home`, `/thoughts`, `/tasks`, `/clarity` and `/settings`.
      Home uses the spec §6 copy ("Take a breath." / "You don't have to figure everything out
      right now."). `/` redirects to `/home`. Done: pages use the title template
      `%s · Mindspace`, and the unused template SVGs are removed from `public/`.
- [x] P1.9 Commit a `.env.example` with no values. The generated `.gitignore` ignores `.env*`,
      which would also hide `.env.example`, so add `!.env.example`. Also add
      `.claude/settings.local.json` (personal Claude settings; for now only this machine's global
      git ignore covers it). The variables themselves come in Phase 2. **Done:** both
      `.gitignore` rules were added and verified with `git check-ignore` (global excludes off).
      `.env.example` itself moves to **P2.2**, because there are no variables yet and an empty
      file adds nothing.
- [x] P1.10 Deployment previews: connect the `origin` GitHub repo to the host chosen in D-009. This
      is your action (you push). Confirm a preview build succeeds. **Before the first deploy,**
      upgrade `next` and `eslint-config-next` to the Next.js November 2026 security release
      (see DEVLOG Known issues). **Done by you on 2026-11-03:** https://m1ndspace.vercel.app
      serves `cb37847` (verified: `/` returns a 307 to `/home`, with the right title and nav). It
      was deployed on 16.4.4 **before** the security release existed, so the upgrade is now
      urgent (DEVLOG Known issues).
- [x] P1.11 Write a root `README.md`: prerequisites, setup, scripts, and links to the docs.

**Acceptance**

- `pnpm build`, `pnpm lint` and `pnpm typecheck` pass.
- The shell works at 360px and on desktop with no horizontal scroll. The nav can be used with a
  keyboard, focus is visible, and the active route is marked.
- Lint rejects a deliberate cross-layer import.
- The preview URL loads (once D-009 is decided).

---

## Phase 2 — Supabase and authentication

**Goal:** only signed-in users get in, every user has a profile row, and the RLS testing harness
is in place. This phase is separate because RLS needs auth and the spec has no milestone for
auth (gap G-2).
**Needs:** D-003, D-011, D-019 (which replaced D-007).

- [x] P2.1 Add the Supabase CLI as a dev dependency and run `supabase init`. The local stack runs on
      Docker (`supabase start`). You create a hosted free-tier project for preview and production.
      **Progress 2026-11-04:** done: the CLI (`supabase` 2.122.0, pinned; v3.0.0 deferred),
      `supabase init` (Postgres 17, imperative migrations) and the hosted project
      `ftsksqfnjocgilmunljx`. You ran `login` and `link` (status shows the linked project), and
      the local stack runs via `pnpm db:start`, skipping services not used yet. Done
      2026-11-04.
- [x] P2.2 Environment config: put the Supabase URL and public key in `.env.local` and the host
      settings. Create `.env.example` listing the variable names with no values (moved from P1.9;
      `.gitignore` already allows it). Add a typed, validated env module in `src/infrastructure/config/`. Take the variable
      names from the current Supabase Next.js guide, since Supabase's key naming has changed
      (anon → publishable). Verify before using. **Done 2026-11-04:**
      `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (names from the
      Supabase guide), with `src/infrastructure/config/env.ts` throwing a clear error if either is
      missing. **The Vercel env vars are your action, and must happen before pushing.**
- [x] P2.3 Create the Supabase clients with `@supabase/ssr` in `src/infrastructure/supabase/`: a
      server client that reads cookies, and a browser client only if needed. Add session refresh
      in Next.js middleware/proxy, following the current Supabase SSR guide for the installed
      Next.js version. Server-only modules import `server-only`. **Done 2026-11-04:**
      `server.ts`, and `session.ts` (`updateSession`: `getClaims()`, cookies plus cache headers
      via `setAll(cookies, headers)`), called from `src/proxy.ts`. Next 16 renamed `middleware`
      to `proxy`. No browser client yet, as nothing needs it. Verified: a fake session cookie is
      cleared, with `private, no-store` headers.
- [x] P2.4 Migration: the `set_updated_at()` trigger function, the `profiles` table and its RLS,
      and the `handle_new_user()` trigger (DATA_MODEL.md). **Done 2026-11-04:**
      `supabase/migrations/20261104020325_create_profiles.sql`, with functions in `private` and
      explicit grants (D-018). Applied **locally only** and verified (DATA_MODEL.md §1 profiles).
      Pushing it to the hosted project (`supabase db push`) is a separate step, before any
      deployed code uses `profiles`.
- [x] P2.5 Generate the database types into `src/infrastructure/supabase/database.types.ts`. Add a
      `db:types` script. **Done 2026-11-04:** `pnpm db:types` generates the `public` schema from
      the local database, then formats it with Prettier. `createSupabaseServerClient()` is typed
      with `<Database>`. A throwaway probe proved that wrong tables, unselected columns and
      wrongly typed values are type errors.
- [x] P2.6a Email and password (D-019): a `(auth)` route group with sign-up and sign-in pages.
      Sign-up sends a 6-digit confirmation code, which the user types in, with a resend option.
      Add server actions for sign-up, confirm, sign-in and sign-out, an application-layer auth
      port with a Supabase adapter behind the container, zod input schemas, and calm error
      states. Local config: confirmations on, and a code-only Confirm signup template.
      **Done 2026-11-04:** verified end to end in the browser against the local stack (see
      DEVLOG). Sign-out has a minimal Settings → Account button; P2.9 completes that section.
- [x] P2.6b Forgot password: request a reset code by email, type it in, then set a new password
      (a code-only Reset password template). **Done 2026-11-04:** `/forgot-password` (public) sends
      the code. The code step shares `EmailCodeForm` with sign-up and never reveals whether the
      email has an account. A valid code signs the user in and redirects to `/reset-password`
      (protected), which sets the new password. Verified in the browser and against the Auth API.
- [x] P2.6c Google sign-in: an OAuth button, an `auth/callback` route (`exchangeCodeForSession`)
      and an error page. You create the Google Cloud OAuth client. Test sign-in from the
      installed PWA on Android and iOS. **Done 2026-11-04 (local):** a "Continue with Google"
      button on sign-in and sign-up, `/auth/callback` (public in the proxy), and errors shown on
      sign-in (`?error=google`) instead of a separate page. Verified with your Google account
      against the local stack. **The installed-PWA test moves to P2.10**, because it needs the
      hosted setup.
- [x] P2.7 Protect routes: every route except sign-in and sign-up requires a session, and a
      signed-in user who visits sign-in or sign-up is sent to `/home`. **Done 2026-11-04:** in
      `src/proxy.ts`, not the layout. The Next.js 16 docs say layout checks do not re-run on
      navigation and do not stop child segments from rendering. The proxy verifies the token
      with `getClaims()`, and its redirects carry any refreshed session cookies. Secure checks
      next to the data (`getAppContext()`) arrive with the first data read (P2.9).
- [x] P2.8 Set up the pgTAP harness in `supabase/tests/`. First test: user A cannot read or update
      user B's profile. Add a `db:test` script. **Done 2026-11-04:**
      `supabase/tests/profiles_rls_test.sql` (11 tests, created with `supabase test new`) and
      `pnpm db:test`. A sabotaged copy (an open select policy, an open update policy, extra
      grants, the trigger disabled) failed the 7 tests aimed at those breaks.
- [x] P2.9 Settings page: the signed-in email, a timezone setting (pre-filled from the browser,
      editable), and sign-out. (Settings → Appearance already exists: D-015.) **Done 2026-11-04:**
      the first full onion slice: domain `Profile` and `toTimezone`, a `ProfileRepository` port,
      use cases, a Supabase repository, and `getAppContext()` in the container. A profile still on
      `UTC` is pre-filled with the device zone, which you save. Setting it automatically at first
      sign-in is open (DATA_MODEL Q-5).
- [x] P2.10 Hosted auth setup, Google only (D-020): the `profiles` migration on the hosted
      database, the Google provider (the same Google client), the Site URL and redirect URLs. Then
      test Google sign-in on the live site and from the installed PWA on Android and iOS. The
      hosted email setup moved to P6.10. **Progress 2026-11-04:** the hosted `profiles` schema is
      already applied and matches local (read-only checks), and the advisors report no issues.
      Email sign-in is hidden in the UI (`src/lib/features.ts`). The sign-in screen is Google-only,
      with a note and the logo. **Done 2026-11-04:** - the hosted settings were checked from here: Google on with your client ID, Email off; - live redirects and the callback error path work; - you tested Google sign-in on the live site and from the installed app, plus the Android
      retest: all good.

**Acceptance**

- Sign-in and sign-out work locally and on the preview deployment.
- Visiting any `(app)` route while signed out redirects to sign-in.
- `supabase test db` passes, and the profiles RLS is proven with two users.
- No secret or service-role key appears in a client component or a `NEXT_PUBLIC_` variable
  (checked with grep).

---

## Phase 3 — Brain Dump (spec Milestone 2, MVP Module 1)

**Goal (spec deliverable):** users can capture and manage their thoughts securely.

- [x] P3.1 Set up Vitest for `src/domain` and `src/application`, with a `test` script. **Done
      2026-11-04:** Vitest 5.0.5 and Vite 8.3.5 (pinned), `@types/node` 22, `vitest.config.mts`
      with the `@/` alias. 9 tests on the profile code; two deliberate breakages each failed tests.
- [x] P3.2 Domain: `Thought` and `Category`, their rules (trimmed content must not be empty;
      length limits match the database checks), and the `ThoughtRepository` and
      `CategoryRepository` interfaces. Unit tests. **Done 2026-11-04:** content 10,000 (Q-1), title
      200, category name 50, counted in characters as Postgres does. `NotFoundError` and
      `ConflictError` added. 27 tests; four deliberate breakages were each caught. These rules
      now run in the browser, before encryption (D-021).
- [x] P3.3 Encryption core (D-021): a Web Crypto module that creates the data key, wraps it with
      a PBKDF2-SHA256 key (600,000 iterations, 16-byte salt) from the passphrase and from a
      recovery code, and encrypts each field with AES-GCM (a fresh 96-bit IV, additional data
      binding the owner and field). Unit tests in Vitest (Node has Web Crypto), including wrong
      passphrase, tampering and a moved ciphertext. A device key store in IndexedDB; prove in a
      browser that a non-extractable key read back still cannot be exported. **Done 2026-11-04:**
      `src/infrastructure/crypto/` (`web-crypto.ts`, `device-key-store.ts`). 10 crypto tests (37
      in total); six deliberate breakages were each caught. In Chrome, a key read back from
      IndexedDB is non-extractable, and export and wrap are both refused.
- [x] P3.4 Keys: a `user_keys` migration (salt, iterations, two wrapped keys; RLS, grants,
      pgTAP). Screens to set a passphrase (12+ characters) and show the recovery code once, to
      unlock on a new device, and to reset the passphrase with the recovery code. Sign-out clears
      the key from the device. **Done 2026-11-04:**
  - **Part 1:** the `user_keys` migration (applied locally), 13 pgTAP tests and regenerated
    types.
  - **Part 2:** the encryption use cases, ports, Server Actions that store only wrapped keys,
    the repository and the browser composition root.
  - **Part 3:** one lock screen after sign-in for the whole app (`(app)/layout.tsx`), single-use
    recovery codes, and sign-out that forgets the device key.
  - 62 unit tests, and six deliberate breakages were each caught. Tested in Chrome locally.
  - The hosted database has `user_keys`: the dry run is up to date, and RLS, the policies and
    the grants match local. PBKDF2 on a phone is measured after deploying.
- [x] P3.5 Migration: `categories` and `thoughts` storing ciphertext (format and maximum-size
      checks), indexes, composite ownership FKs, RLS, updated_at triggers, two-user pgTAP tests.
      Regenerate the types. **Done 2026-11-04:**
  - `20261104083602_create_categories_and_thoughts.sql`, applied locally. Types regenerated.
  - The ciphertext pattern was checked against 180 real Web Crypto outputs.
  - 33 new pgTAP tests (57 in total); 13 sabotages were each caught by a named test.
  - Advisors are clean apart from "unused index" on the empty tables. `db diff` finds no
    changes.
  - Pushed to the hosted database with your approval (2026-11-04). The dry run listed only this
    migration. RLS, policies, grants, constraints and indexes match local.
- [x] P3.6 Infrastructure: Supabase repositories for the encrypted records, wired into the
      container. Revise the P3.2 ports to store ciphertext, not plaintext. **Done 2026-11-04:**
  - The ports now carry `EncryptedThought` and `EncryptedCategory`. The text query filter and the
    duplicate-name `ConflictError` moved to the device.
  - `supabase-thought-repository.ts` and `supabase-category-repository.ts`.
  - Checked once against the local database as two real signed-in users (RLS applied), with
    real ciphertext. Three deliberate breakages were each caught.
  - The container wiring comes with the use cases in P3.7; nothing would use it before then.
- [x] P3.7 Application: use cases (capture; list newest first, filtered by category or status;
      get; update; delete; create, rename and delete a category; assign a category). Encryption
      and decryption happen in the browser; Server Actions receive ciphertext only. Zod schemas.
      Unit tests with in-memory fakes. **Done 2026-11-04:**
  - **Browser** (`thoughts.ts`, `categories.ts`): rules, then encrypt with the device key, then
    decrypt (`openThoughts`, `openCategories`). Duplicate names are caught on the device.
  - **Server** (`records.ts`): ciphertext only, for the session's user. Reads serve Server
    Components; writes serve the six Server Actions in `(app)/thoughts/actions.ts`, which check
    input with Zod schemas that mirror the database.
  - **Wiring:** the container and `createBrainDumpUseCases`.
  - 91 unit tests, including real Web Crypto. Seven deliberate breakages were each caught.
- [x] P3.8 Capture UI: a single text area with autofocus. Save with a button or Ctrl/Cmd+Enter.
      After saving, the field clears and keeps focus for the next thought. Show a saving state.
      A failed save keeps the text. **Done 2026-11-04:**
  - `components/thoughts/capture-box.tsx` on Brain Dump.
  - `components/thoughts/brain-dump.ts` adapts the Server Actions into the ports.
  - The shadcn `textarea` was added.
  - **In Chrome (local):** Ctrl+Enter and the button both save. The saving state shows a
    read-only field and a spinner. The field clears and keeps focus, with "Saved.".
  - One request with ciphertext only; the database holds no readable words.
  - A locked device or text over 10,000 characters keeps the text and sends nothing.
- [x] P3.9 List and detail/edit UI. Delete through an in-app confirmation dialog (shadcn
      AlertDialog), not the browser's `confirm()`. **Done 2026-11-04:**
  - **List:** `/thoughts` lists one status (Inbox by default, plus Parked and Archived) as link
    views, decrypted on the device, newest first. A capture appears at once
    (`refresh()` in `createThoughtAction`).
  - **Edit:** `/thoughts/[id]` edits the title, content and status, sending only the changes.
    Delete goes through an AlertDialog, then back to the list.
  - **Not found:** a calm screen for a bad or missing id.
  - **Components added:** shadcn `alert-dialog`, `empty` and `item`. `button.tsx` and
    `separator.tsx` were restored after the CLI overwrote them.
  - Tested in Chrome locally; the database shows encrypted edits and the deleted row gone.
- [x] P3.10 Categories UI: pick or create a category in place. Offer suggested names from spec
      §4.1 and §4.2, but create none in advance. Duplicate names (any case) are caught on the
      device, since the server only sees ciphertext. **Done 2026-11-04:**
  - **On the thought page:** `CategoryPicker` lists your categories, the nine spec suggestions you
    don't have yet, and "New category…". A choice is created at once (encrypted) and selected.
    A duplicate is refused on the device, naming the existing category.
  - **On the list:** a badge on each card, and a category filter (All, No category, or one
    category) kept in the URL alongside the status.
  - Tested in Chrome locally; the database holds only ciphertext names.
  - **Renaming and deleting** were added on 2026-11-05 as a Checkpoint A follow-up. The page is
    `/thoughts/categories`, opened from "Edit categories" on Brain Dump. It uses the P3.7 use cases.
- [x] P3.11 Search on the device: a case-insensitive match on the decrypted titles and contents.
      **Done 2026-11-05:**
  - A search box above the list looks through **every** thought, all views and categories.
    Results show a status badge and a match count.
  - The search text stays in the browser: not in the URL, and no requests.
  - `thoughtMatches` (domain) matches after NFC normalisation and lower-casing, in the title or
    the text.
  - The page now loads all thoughts and filters on the device. The repository pages past the
    1,000-row API cap (checked with 1,050 rows).
- [x] P3.12 Loading, empty and error states on every Brain Dump screen. (The locked state is the
      app-wide lock screen from P3.4.) **Done 2026-11-05.** A review of every screen found two
      gaps, now fixed:
  - **`src/app/error.tsx`:** a calm "This didn't load" page with **Try again** (`retry()`) for
    server errors in any page or the signed-in layout. It logs only the digest.
  - **Offline:** a failed save offline says so, and the text stays.
  - **Already in place:** loading skeletons, the empty states, the not-found page, and errors that
    keep the text.
  - **Checked in Chrome:** switching views keeps an unsaved draft; the offline message; and the
    error page and recovery, with PostgREST stopped locally and then started again.
- [x] P3.13 Home: "Your mind, right now" shows a few recent thoughts and how many wait in the inbox,
      with no urgency styling. **Done 2026-11-05:**
  - **What Home shows:** the 3 newest **inbox** thoughts (captured and still waiting), decrypted
    on the device, and a muted count ("4 thoughts waiting · no rush", or "Nothing is waiting.
    Your inbox is clear."). A "See all N in Brain Dump" link appears when there are more.
  - **`listNewest`** returns the newest few and the total in **one request**, so Home doesn't
    load the whole inbox.
  - The thought card is shared with Brain Dump (`thought-item.tsx`).

**Acceptance** (checked 2026-11-05):

- **Met:** capture is one field and one action. Create, edit, delete, search and categorise
  work, and failed saves keep the text (P3.8–P3.12).
- **Met:** RLS and pgTAP pass for `thoughts` and `categories` (57 tests), and the domain and
  application tests pass (95).
- **Met:** the database holds only ciphertext for titles, contents and category names (checked
  with SQL). A wrong passphrase unlocks nothing; recovery resets the passphrase and the thoughts
  still open (P3.4).
- **Deployed:** the hosted database has all three migrations; the live site updates when you
  push.

- From the capture screen, a thought is saved in a few seconds: one field, one action.
- Create, edit, delete, search and categorise all work. Text is never lost on a failed save.
- RLS tests pass for `thoughts` and `categories`. Domain and application tests pass.
- **The database holds no readable thought text** (checked with SQL: titles, contents and
  category names are ciphertext). A wrong passphrase unlocks nothing, and the recovery code
  resets the passphrase without losing thoughts.
- It is deployed so you can use it yourself.

### Checkpoint A — personal use (spec §17 step 10)

Use Brain Dump yourself before widening the scope. Record what helped and what caused friction
in the DEVLOG, then adjust Phases 4–5 if needed.

---

## Phase 4 — External Memory (spec Milestone 3, MVP Module 2)

**Goal (spec deliverable):** users can manage basic tasks and reminders.
**Needs:** D-008.

- [x] P4.1 Domain: `Task` (title, notes, due date with optional time, priority low/normal/high,
      completion) and `Reminder`. Rules: a time needs a date, and a reminder belongs to a task.
      Repository interfaces and unit tests. **Done 2026-11-05:**
  - `src/domain/tasks/`:
    - `task.ts`: the title (1–500), notes (blank → none, up to 10,000, Q-6) and priority
      (default normal);
    - the due date is the user's own calendar day (`YYYY-MM-DD`, real dates only) and the time
      is wall-clock `HH:MM`. A time needs a date, and the two always change together;
    - `reminder.ts`: a reminder needs a task and a real moment. It holds no free text, so it
      isn't encrypted.
  - **Ports:**
    - `TaskRepository`: create, findById, list by view (Today including overdue, Upcoming, No
      date, Completed since), update, delete;
    - `ReminderRepository`: create, listActive, dismiss. `EncryptedTask` keeps the title and
      notes as ciphertext.
  - **Tests:** 30 new unit tests. Deliberate breaks to the rules were each caught (see the
    DEVLOG).
- [x] P4.2 Dates and timezones: compute "today" in the profile's timezone. Add a small date library
      only if `Intl` is not enough. Test the boundaries (late at night, timezone offsets). Also
      save the device zone once while the profile is still on `UTC` (DATA_MODEL Q-5, settled
      2026-11-05). **Done 2026-11-05:**
  - `dateInTimeZone(instant, zone)` in `src/domain/shared/calendar.ts`. `Intl` was enough, so
    no library was added. Tested at local midnight both ways, across the New York
    daylight-saving change, at +5:30 and +5:45, at +14 and −11, and over the new year.
  - **Q-5:**
    - `shouldDetectTimezone` (domain): on UTC and unchanged since sign-up;
    - `saveDetectedTimezone` (use case), which checks the rule again on the server;
    - `saveDetectedTimezoneAction`;
    - `TimezoneDetector`, rendered by the app layout only while the rule holds, saves the
      device zone once and shows a toast.
    - Settings pre-fills the device zone under the same rule, so a UTC you saved shows as
      saved.
- [x] P4.3 Migration: `tasks` and `reminders`, with indexes, ownership FKs and RLS. pgTAP tests,
      including a cross-user FK attempt that must be rejected. Regenerate the types. The task
      title and notes are ciphertext (D-021, DATA_MODEL.md), encrypted and decrypted in the
      browser as in P3.7. **Done 2026-11-05 (local):**
  - `20261105080758_create_tasks_and_reminders.sql`, applied with `migration up --local`. Types
    were regenerated, with only `tasks` and `reminders` added.
  - **Tests:** `tasks_rls_test.sql` (22) and `reminders_rls_test.sql` (12). Cross-user links (a
    task to B's thought, a reminder to B's task) are rejected, by insert and by update.
  - **Ten deliberate breaks** (each policy, both ownership FKs, the time rule, a delete grant on
    reminders) were all caught.
  - Advisors: no issues. No unindexed foreign keys.
  - **Hosted:** pushed on 2026-11-05 with your approval, after a dry run that listed only this
    migration. It matches local.
- [x] P4.4 Infrastructure repositories, wired into the composition root. **Done 2026-11-05:**
  - **The repositories:**
    - `supabase-task-repository.ts`: views as documented on `TaskRepository.list`; `due_time`
      comes back as `HH:MM`; `23503` becomes "That thought no longer exists.";
    - `supabase-reminder-repository.ts`: `listActive` soonest first; `23503` becomes "That task
      no longer exists.";
    - a shared `fetch-all-rows.ts` pages past the 1,000-row limit.
  - **The container wiring comes with the P4.5 use cases**, as in P3.6 and P3.7, so there's no
    unused wiring.
  - **Checks:**
    - a one-off integration run against the local stack with two throwaway users (RLS on, real
      ciphertext): 9/9 pass;
    - seven deliberate breaks were all caught;
    - the users and rows are gone afterwards.
- [x] P4.5 Use cases: create, edit, complete, reopen and delete a task; set due date and priority;
      add and dismiss a reminder; list Today (overdue plus today), Upcoming, No date and recently
      Completed. Unit tests. **Done 2026-11-05:**
  - **Browser** (`application/tasks/tasks.ts`, D-021): `openTasks`, `createTask`, `updateTask`
    (title, notes, due date and time together, priority) and `deleteTask`. The title and notes
    are encrypted for their own fields.
  - **Server** (`records.ts`, `reminders.ts`):
    - `listTaskRecords(view)`, with "today" from the profile's zone (UTC if none) and Completed
      covering the last **7 days** (`RECENTLY_COMPLETED_DAYS`, a default you can change);
    - create and edit re-check the readable date and time with the domain rules;
    - `completeTask` and `dismissReminder` use the server's clock; `reopenTask`;
      `addReminder` (domain-checked); `listActiveReminders` (renamed `listReminderRecords` in
      P4.8).
  - **Schemas** (`schemas.ts`): ciphertext shapes and sizes as the database checks them; the
    date and time are sent together; completion and user ids are dropped.
  - **Wiring:** the server use cases in `container.ts` and `createTaskUseCases` in
    `browser.ts`. The Server Actions and screens come in P4.6.
  - **Tests:** 23 unit tests. Eleven deliberate breaks were all caught (see the DEVLOG).
- [x] P4.6 Tasks UI: quick add (only the title is required), an edit sheet with due date/time and
      priority pickers, and complete with undo. **Done 2026-11-05** (local; layout details in
      DESIGN.md §6):
  - `/tasks` with Today, Upcoming, No date and Completed (`?view=`).
  - Quick add dated by the view.
  - A checkbox to complete, with an Undo toast, or to reopen.
  - An edit sheet with title, notes, date and time, priority, and delete.
  - Server Actions: create, update, delete, complete, reopen.
  - The shared `lib/action-result.ts` and `lib/action-errors.ts`; Brain Dump now uses them too.
  - `getToday` for the date labels.
- [x] P4.7 Convert a thought into a task from Brain Dump: the title is pre-filled and linked through
      `source_thought_id`. What happens to the thought is settled in DATA_MODEL.md, Q-2.
      **Done 2026-11-05:**
  - **"Make it a task"** on the thought page opens a sheet.
    - The title is the thought's own, or its first line (cut to 500); the notes hold the whole
      text (`taskDraftFromThought`).
    - The date, time and priority are optional.
  - **Create task:**
    - makes the linked task, then archives the thought (Q-2, your choice);
    - reports honestly if archiving fails;
    - takes you to the view where the task landed.
  - **Disabled while the thought has unsaved edits.**
  - **Shared fields:** `TaskFields` is shared with the edit sheet.
- [x] P4.8 In-app reminders (D-008): due reminders appear on Home ("Upcoming reminders") and on
      Tasks, with a dismiss action. No push. **Done 2026-11-05:**
  - **Setting a reminder:** in the task's edit sheet, through "Remind me at" (a native
    `datetime-local` picker in the device's time zone). Add and Dismiss save at once.
  - **Home:** "Upcoming reminders" lists the active ones, soonest first, with due ones marked
    **Now**, up to 5. The card is hidden when there are none.
  - **Tasks:** a "Reminders" card shows only the due ones.
  - **Live:** the lists re-check the time every 30 s (`useNow`), so a reminder appears when it
    is due, without a reload.
  - **Completed tasks:** their reminders are hidden, and reopening brings them back
    (`listReminderRecords`).
  - **Domain:** `isReminderDue`.
- [x] P4.9 Home: a summary of today's tasks and upcoming reminders. Overdue items look neutral, with
      no red alarms. **Done 2026-11-06:**
  - **Home order:** a **Today** card, then **Upcoming reminders** (P4.8), then "Your mind,
    right now".
  - **The Today card:** up to 5 open tasks due today or earlier, with "N tasks for today",
    "See all N in Tasks" when there are more, and a calm empty state ("Nothing for today. Enjoy
    the space…").
  - **Neutral:** earlier tasks read "Waiting since …" in the same muted text as the rest.
  - **Rows** link to Tasks; `TaskItem` now takes `href` or `onOpen`.
- [x] P4.10 Validation, empty and error states. **Done 2026-11-06:**
  - **Validation as you type:** quick add, the edit sheet and "Make it a task" show the domain's
    own messages under the field: a missing title, a title over 500 characters, notes over
    10,000. Save, Add or Create task stays disabled until it's fixed (`taskDraftErrors`, which
    calls `toTaskTitle` and `toTaskNotes`). A blank quick add only keeps Add disabled.
  - **Reminders:** a time that has already passed is allowed, and the hint says it will show
    straight away.
  - **Already in place (reviewed):**
    - loading skeletons, an empty state per view, and the Today card's empty state;
    - decryption errors shown in place, and failed actions as toasts that keep what you typed;
    - server errors on the root error page (P3.12).
  - **Checked in Chrome:** each message and disabled button at 500/501 characters and
    10,000/10,001, and the past-time hint.

**Acceptance** (checked 2026-11-06):

- **Met:** with the profile switched to Pacific/Pago_Pago (still Nov 5 there), the five tasks
  due Nov 6 moved from Today to Upcoming as "Tomorrow", and Home showed "1 task for today".
  Switching back to Asia/Kuala_Lumpur restored them. Tasks without a date stay in No date
  (unit and integration tests, P4.2–P4.5).
- **Met:** "Make it a task" creates a task linked through `source_thought_id` and archives the
  thought (P4.7, checked in Chrome).
- **Met:** pgTAP passes (93, including 22 for `tasks` and 12 for `reminders`), and so do the 174
  domain and application tests.
- **Met:** task titles and notes are only ciphertext in the database (checked with SQL).

- Tasks, with or without due dates, land in the right view for the user's timezone.
- Converting a thought creates a linked task.
- RLS tests pass for `tasks` and `reminders`.

---

## Phase 5 — Mind Clarity (spec Milestone 5, MVP Module 3)

**Goal (spec deliverable):** users can reflect and choose a manageable priority.

- [x] P5.1 Domain: `DailyCheckIn` (one per user per local date; every prompt optional), its
      repository interface, and tests. **Done 2026-11-06:**
  - **`DailyCheckIn`** (`src/domain/check-ins/`):
    - the five prompts of spec §4.6 in order (`CHECK_IN_PROMPTS`);
    - every answer is optional, and blank means skipped;
    - the user's local date must be a real calendar date.
  - **Limits (Q-7, your choice):** answers up to 2,000 characters; a written priority up to 500,
    like a task title.
  - **Priority:** an existing task or written words, never both. A change always sets both, so
    switching clears the other.
  - **The repository port:** `create` (ConflictError if that date already has a check-in),
    `findByDate`, `list` (newest first) and `update`. There is no delete, because nothing in
    Phase 5 needs one.
  - **Shared:** `isCalendarDate` moved from `task.ts` to `shared/calendar.ts`, so tasks and
    check-ins use one rule.
  - **Tests:** 24 new (17 check-in, 7 calendar). A mutation check broke each rule on purpose,
    and all 7 breaks were caught.
- [x] P5.2 Migration: `daily_checkins`, with an ownership FK to tasks and RLS. pgTAP tests.
      Regenerate the types. Every answer is ciphertext (D-021, DATA_MODEL.md). **Done
      2026-11-06:**
  - **`20261106040822_create_daily_checkins.sql`:**
    - five answer columns and a written priority, ciphertext only (up to 10,708 and 2,708);
    - one check-in per user per day;
    - the priority is a task or text, never both;
    - a composite FK to the user's own task, and deleting the task clears only the link;
    - `select, insert, update` for `authenticated`, with no delete;
    - three own-row policies.
  - **Applied locally** with `migration up --local`, which kept your data. `pnpm db:types` added
    only the new table.
  - **Tests:** `daily_checkins_rls_test.sql` has 28 checks (121 pgTAP in total). 18 deliberate
    breaks were each caught by a named test, and the advisors report no issues.
  - **Hosted:** pushed on 2026-11-06 with your approval, after a clean dry run. The hosted table
    matches local.
- [x] P5.3 Use cases: start or resume today's check-in, save answers, set the priority (an existing
      task or free text), and list past check-ins. **Done 2026-11-06:**
  - **The repository** (`supabase-daily-check-in-repository.ts`). Phase 5 has no separate
    repository task, so it comes here, where P4.4 did it for tasks.
    - a second check-in for a day becomes `ConflictError`;
    - someone else's or a deleted task becomes "That task no longer exists.";
    - the list is newest first and pages past 1,000 rows.
  - **Browser** (`application/check-ins/check-ins.ts`, D-021):
    - `openCheckIns`;
    - `startCheckIn`, which needs an unlocked device, so a locked one starts nothing;
    - `updateCheckIn`, which saves answers and sets the priority. Each answer and the written
      priority are encrypted for their own column.
  - **Server** (`records.ts`):
    - today's check-in uses the user's own date from the profile's time zone, and the browser
      never sends a date;
    - start or resume: when two devices start at once, the database refuses the second and
      that check-in is resumed;
    - update and list.
  - **`checkInEditsSchema`:** ciphertext within the database's sizes, and the priority's task
    and text sent together, never both. Unknown keys are dropped.
  - **Wired** into `container.ts` and `browser.ts`. The Server Actions come with the screens
    (P5.4), as in Phase 4.
  - **Checks:**
    - 23 unit tests, and 10 deliberate breaks, all caught;
    - a one-off end-to-end run on the local stack (8/8): two throwaway users, RLS on, real Web
      Crypto, through the Server Action's schema. 7 deliberate repository breaks were all
      caught, including the two-device race. The users and rows are gone afterwards.
- [x] P5.4 Check-in flow UI: one prompt per step (spec §4.6). Every step can be skipped and the
      flow can end early. Separates "act on now" from "can wait". **Done 2026-11-06** (your
      choices: the priority is the last step, each step saves as you go, and the end is a
      grouped recap):
  - **The Mind Clarity page:**
    - "Start check-in" when today has none;
    - five question steps and then "the one thing" (one of today's tasks, or a few words);
    - Back, Skip for now, Finish for now and Next on every step;
    - the recap groups the answers into on your mind, within your control (act on now), can
      wait, and today's one thing, with **Edit answers**.
  - **Saving:** each move saves only a changed answer (encrypted, D-021), so stopping halfway
    keeps it. Skip leaves the saved answer alone, and a failed save keeps the text.
  - **New:** the Server Actions (start, update), `check-in-use-cases.ts`, and the components in
    `src/components/clarity/`.
  - **Shared:** `validationMessage` moved to `form-parts.tsx`, and `formatDay` is exported from
    `task-views.ts`.
  - **Checked in Chrome** (the probe confirmed MYS231):
    - start, Next, Skip, Back (which saves), Finish for now, the recap and Edit answers;
    - a task and words replace each other as the priority;
    - the 2,000 and 500 limits disable the buttons;
    - a reload shows the same recap, decrypted from the server;
    - the database holds only ciphertext, plus the linked task;
    - no console errors;
    - Tasks still shows its validation.
  - **Visual check:** Chrome's screenshots timed out (rendering paused), so the layout still
    needs your look.
- [x] P5.5 One Thing at a Time: today's priority is prominent on Home, and every other task is
      still one tap away (spec §4.7). **Done 2026-11-06:**
  - **"Today's one thing"** is the first card on Home, under the Brain Dump button
    (`one-thing.tsx`).
    - a task shows as its task row, linking to Tasks, and shows "Completed …" once done;
    - written words show in larger text;
    - with nothing chosen, it says "Nothing chosen yet." and links to Mind Clarity, with no
      nagging.
  - **The Today card stays right below**, so every other task is one tap away.
  - **Data:** Home reads today's check-in. The priority task comes from today's list, or on
    its own when it was done or moved to another day. Decrypted on the device.
  - **Checked in Chrome:**
    - the card order;
    - a task (linking to `/tasks`), the same task completed, and then reopened;
    - written words;
    - nothing chosen;
    - no console errors.
- [x] P5.6 Thought review flow: go through inbox thoughts one at a time and choose park, convert to
      task, archive or delete. **Done 2026-11-06** (your choices: start from Brain Dump and Mind
      Clarity; oldest first):
  - **`/thoughts/review`:** one inbox thought at a time, with Park, Make it a task, Archive,
    Delete (confirmed), Skip for now and Stop for now. Park and Archive offer Undo. The end says
    how many skipped thoughts still wait.
  - **Ways in:** "Review one by one" on the Brain Dump inbox, and a "Your inbox" card on Mind
    Clarity (hidden when the inbox is empty).
  - **No new data code:** it reuses the thought status change, delete and "Make it a task".
    - **The sheet:** `MakeTaskSheet` takes `onCreated`, so it can stay in the review.
    - **Tracking:** Brain Dump's update and delete don't refresh the page, so the review keeps
      its own track of what was handled.
    - **Shared:** `waitingLabel` moved to `thought-status.ts`, for Home and Mind Clarity.
  - **Checked in Chrome** (the probe confirmed MYS231):
    - both ways in; oldest first;
    - your two thoughts skipped, so unchanged;
    - Park, then Undo, then Park; Make it a task stayed in the review; Delete with the dialog;
      Archive; the end message;
    - the database matched each choice;
    - "Make it a task" on the thought page still opens Tasks.
- [x] P5.7 Past reflections: a simple list by date. No scores, streaks or "insights". **Done
      2026-11-06:**
  - **`/clarity/past`**, from a "Past reflections" link on Mind Clarity:
    - each earlier day as a card with the date and the recap's grouping (shared as
      `CheckInSummary`);
    - newest first;
    - check-ins with nothing written, and missing days, are simply left out.
  - **`listPastCheckInRecords`** (server) replaces the unused `listCheckInRecords`. It returns
    the check-ins before the user's today, with something written, and the tasks chosen as
    their one thing (one read per distinct task, as for reminders).
  - **Tests:** 2 new unit tests (past only, newest first, blanks left out; each task read once,
    missing ones dropped).
  - **Checked in Chrome:**
    - the empty state;
    - a check-in written as Nov 5 (profile briefly on Pacific/Pago_Pago, then back to
      Asia/Kuala_Lumpur) appears as "Thu, Nov 5" with its groups and one thing, and today's
      doesn't;
    - no console errors.
- [ ] P5.8 (Stretch) Slow Down Mode: a short breathing exercise and the prompt "What is actually
      bothering you right now?", with an optional save as a thought. Respects
      `prefers-reduced-motion`. No medical claims. **Deferred 2026-11-06 (your choice):**
      outside the spec's MVP core (§5) and not needed for the acceptance. Moved to the post-MVP
      backlog, to build if your own use shows the need.

**Acceptance** (checked 2026-11-06):

- **Met: a check-in takes a couple of minutes, and every step can be skipped.**
  - It's six short steps, each with one field.
  - A save took about 0.4–0.6 s on the dev server, after 1.8–2.3 s for the first two while it
    compiled.
  - Skipping all six steps reaches the recap and saves nothing.
  - Each answer lands under its own question.
- **Met: nothing guilt-trips about missed days.**
  - A scan of the app's wording found no streak, missed, overdue or score wording.
  - Past reflections leaves out days without a check-in, with no counts or gaps.
- **Met:** Home shows today's one thing first, and the Today card still lists every task ("6
  tasks for today").
- **Met:** pgTAP passes (121, including 28 for `daily_checkins`), and so do the 223 domain and
  application tests.
- **Met:** check-in answers are stored only as ciphertext (SQL), and the table is on the
  hosted database.

- A check-in takes a couple of minutes. Every step can be skipped, and nothing guilt-trips the
  user about missed days.
- Home shows one priority without hiding other tasks.
- RLS tests pass for `daily_checkins`.

---

## Phase 6 — PWA, privacy and beta readiness (spec Milestone 6, §10, §14)

**Goal:** an installable app that has passed a privacy review, ready for 30 days of personal use
and then the private beta.

- [x] P6.1 Web app manifest through `app/manifest.ts` (name, short name, start URL, `standalone`,
      theme and background colours), plus icons (192, 512 and maskable). Uses the name from D-001.
      **Brought forward on 2026-11-03 (D-014)** to fix the screen edges on the home-screen app.
      The icon is your "Sleeping Brain House" artwork, made full-bleed (DESIGN.md §7a).
- [x] P6.2 Service worker: cache the app shell and static assets, add an offline fallback page and
      a connection-status indicator. Choose between a hand-written worker (Next.js PWA guide) and a
      library such as Serwist after checking compatibility with the installed Next.js version.
      Do not cache user data yet. **Done 2026-11-10 (D-023):**
  - **Hand-written worker** (your choice over Serwist), served at `/sw.js` by a static Route
    Handler with the deploy's `VERCEL_DEPLOYMENT_ID` built in.
    - It stores only `/offline` and the styles, fonts, scripts and logo that page links to, in
      one cache per deploy.
    - Pages, page data, Server Actions and Supabase calls always go to the network.
    - A page that can't load offline shows `/offline` ("You're offline", Try again). This
      includes tapping a link, because Next.js then falls back to a full page load.
  - **Connection status** (your choice): a notice that stays while you're offline on a
    signed-in page, closed when the connection returns, then "You're back online."
  - **Updates:**
    - Each deploy is a new worker, which replaces the old one at once and deletes its cache.
    - The app looks for a deploy when it comes back to the foreground. A page older than the
      live deploy gets "A new version is ready" with **Refresh**. Nothing reloads by itself.
    - **Version skew:** Next.js already reloads on the next navigation after a deploy (build ID
      check, read in the 16.4.5 source).
    - Vercel's Skew Protection, which keeps old pages' saves working, is Pro and Enterprise
      only, and the project is on Hobby (D-009). So a save from an outdated page now says
      "Mindspace has just been updated. Copy your text, refresh the page, then save it again."
  - **Checked** on two local production builds:
    - the worker installs, and its cache holds the offline page and its 17 assets, all 200;
    - with the server stopped, `/home` shows the styled offline page;
    - after a rebuild, the old page offered Refresh and didn't reload by itself, and the old
      cache was gone;
    - a fresh page shows no prompt.
  - **Still to check:** the offline notice needs a real connection drop on a signed-in page
    (P6.3 on your phone).
  - **Updates (added 2026-11-06, your request):** a new deploy must reach the installed app
    without reinstalling.
    - The worker must never pin an old version.
    - Each deploy makes a new worker version, checked when the app returns to the foreground.
      A calm "A new version is ready" prompt offers Refresh and never reloads while you type.
    - An app left open reloads on its next navigation after a deploy, instead of failing a save.
      This is Next.js version-skew handling, `deploymentId`. Check first whether Vercel sets it
      already.
- [ ] P6.3 Test installation and browser behaviour on Chrome and Edge desktop, Android Chrome, and
      iOS Safari (Add to Home Screen). Record the results in the DEVLOG.
- [x] P6.4 Accessibility review: keyboard navigation, visible focus, WCAG AA contrast, labels,
      reduced motion, and readable text at 200% zoom. **Done 2026-11-10 (D-024):**
  - **Contrast** (computed from `globals.css`, alpha tints blended; method checked against
    21:1 and 4.74:1). Fixed, with your choices:
    - field outlines 1.3–2.3:1 → a new `input-border` token at 3.0:1 or more;
    - the focus ring's 50% halo 2.0–2.8:1 → solid, 4.3:1 or more;
    - the dark Delete button 3.5–3.8:1 → 4.77:1 or more.
    - All other text and control pairs already passed. Details are in DESIGN.md §3.
  - **Reduced motion:** a `prefers-reduced-motion` rule in `globals.css` stops the slides,
    fades and pulses. The animation library had none.
  - **Labels, headings, landmarks** (an automated check on all 9 signed-in pages and
    `/offline`):
    - each page has its own title, one `h1`, no skipped heading levels, one `main`, and
      labelled navs;
    - every field and button has a name;
    - no duplicate IDs and no positive `tabindex`.
    - The only hits were Base UI's hidden checkbox inputs (`aria-hidden`, `tabindex=-1`).
  - **Zoom and reflow** (each page in a 320px and full-width frame; 320px equals 400% zoom):
    - Settings scrolled sideways at 320px because of the three theme buttons. They now wrap.
    - The task sheet fits.
    - No other page scrolls sideways.
  - **Keyboard** (real Tab presses on Home):
    - every stop shows the solid ring, in a logical order (sidebar, then the page);
    - the Delete dialog focuses "Keep it", Escape closes it, and focus returns to Delete.
  - **Not covered:** a screen-reader pass (VoiceOver or TalkBack, on your devices with P6.3),
    and the sign-in pages, which redirect when signed in and share the same components.
- [x] P6.5 Data controls (spec §14): export my data (a JSON download of all the user's rows), and
      delete my account (server-side only; removes the auth user and cascades their data).
      **Done 2026-11-10 (D-025):**
  - **Export my data** (Settings → Your data):
    - the server sends every row the user owns, still ciphertext;
    - the browser decrypts it and downloads `mindspace-export-<date>.json`.
    - It includes archived thoughts, every task (done or not) and dismissed reminders, through
      the new `TaskRepository.listAll` and `ReminderRepository.listAll`.
    - `user_keys` is left out: it is wrapped key material, not something you wrote.
    - The file isn't encrypted, and the card says so.
  - **Delete my account:**
    - a dialog where you type "delete" (your choice), checked in the dialog and again on the
      server;
    - the server deletes the user with Supabase's admin API (your choice), using
      `SUPABASE_SECRET_KEY`, read only at that moment;
    - then the server signs out, and the browser forgets its device key and goes to sign-in.
  - **Tests:**
    - 7 new unit tests;
    - a pgTAP test (7 checks, 128 in total) that every user table cascades;
    - a one-off integration test on the local stack: the export had every row, deleting through
      the app's adapter left 0 rows in all 7 tables, and the old access token could no longer
      write.
  - **Checked in Chrome** (the download was caught in the page, so nothing was saved):
    - the export had 4 categories, 7 thoughts, 10 tasks, 3 reminders and 2 check-ins, matching
      the database, with no ciphertext left;
    - the dialog keeps its button disabled until "delete" is typed, and resets when closed.
    - Your local account was not deleted.
  - **Your step:** add the hosted secret key to Vercel (see the DEVLOG). Until then, deleting
    on the live site fails with a calm error and changes nothing.
  - **Known limit:** categories are read in one request (up to 1,000), the same as the
    Categories page.
- [x] P6.6 Security review: re-run every RLS test, confirm no secret keys are in the client bundle,
      add security headers, audit dependencies, and consider rate limiting on auth.
      **Done 2026-11-10 (D-026):**
  - **RLS:**
    - all 8 local pgTAP files pass (128 checks);
    - the hosted migrations match local (5 of 5);
    - a read-only hosted query showed RLS on all 7 tables, the expected policies and grants,
      nothing for `anon` or `service_role`, every table cascading with its user, and no
      `security definer` functions in `public`;
    - the hosted advisors show only the known "Leaked Password Protection Disabled" (P6.10).
  - **No secrets in the browser:** a production build with a canary `SUPABASE_SECRET_KEY` had
    none of the following in any of the 48 client files:
    - the canary, the variable's name or any `sb_secret_`;
    - `service_role`, a JWT or the Google client secret.
    - The key isn't in the server build either, because it is read at run time. Git history
      (87 commits) has no keys and no env files.
  - **Headers:**
    - **A strict Content Security Policy (your choice):** a nonce per request, set in
      `src/proxy.ts` and built by `src/lib/content-security-policy.ts`.
      - Scripts need the nonce, with `'strict-dynamic'`. Styles may be inline.
      - Images, fonts, workers and connections are same-origin only, with no framing.
      - `form-action` also allows Supabase and Google for sign-in.
      - The root layout passes the nonce to next-themes. Pages are now all rendered per
        request; `/sw.js`, the manifest and the icons stay static.
    - **`next.config.ts`:** `X-Content-Type-Options`, `X-Frame-Options: DENY`,
      `Referrer-Policy` and a `Permissions-Policy` (no camera, microphone, location or
      Topics). Vercel already sends HSTS.
  - **Checked:**
    - **Dev:** every script tag carries the nonce, and it differs per request. A script parsed
      without the nonce and an inline handler were both blocked. Moving through Home, Brain
      Dump, Tasks, Mind Clarity and Settings, the theme switch and the delete dialog raised no
      violations.
    - **Production build:** the same holds. The service worker and the offline page work under
      the policy, including the cached copy, and `upgrade-insecure-requests` didn't break
      `http://localhost`.
  - **Dependencies:** `pnpm audit --prod` found nothing. Two dev-only tool advisories are
    accepted and logged in D-026: `minimatch` (moderate, under ESLint) and `deepmerge` (low,
    under the shadcn CLI).
  - **Rate limiting (your choice):** rely on Supabase Auth's per-IP limits and Vercel's DDoS
    protection. Before the public launch, revisit Vercel's one free WAF rate-limit rule.
- [ ] P6.7 Reliability: check Supabase backup options on the chosen tier, decide on error
      monitoring (optional), and sort out auth email delivery (custom SMTP if needed; check the
      current Supabase limits).
- [ ] P6.8 Privacy policy, terms of use, and a contact / report-a-problem link. A PDPA (Malaysia)
      review is your task (legal); Claude can draft.
- [ ] P6.9 Production deployment on the chosen host. Review the hosting terms (D-009) before the
      beta.
- [ ] P6.10 Email on the live site (D-020): buy a domain and verify it in Mailtrap (DNS). In
      Supabase, set Mailtrap as custom SMTP, turn Confirm email on, make the Confirm signup and
      Reset password templates show `{{ .Token }}`, and set the email code length to 6 and the
      minimum password length to 8. Turn the hosted Email provider back on, and set
      `emailSignInEnabled = true` in `src/lib/features.ts`. Then test email sign-up and password
      reset on the live site. Use the shadcn **InputOTP** for the 6-digit code in
      `email-code-form.tsx` (deferred from the 2026-11-05 shadcn audit). Also review the hosted
      security advisor "Leaked password protection
      disabled" (an Auth setting; it only matters once passwords are used).
- [ ] P6.11 Speed check (added 2026-11-06, your request).
  - **Measure first:** time Home, Tasks and Brain Dump on the live site, not the dev server,
    which builds each page on first visit.
  - **Then fix what is actually slow.** One candidate is instant switching between pages from
    the client cache (`staleTimes`, an experimental setting). Confirm that your own saves still
    show at once.
  - **Measure again**, and record both sets of times in the DEVLOG.
  - **Not in scope:**
    - server-side caching of user data;
    - keeping data on the device for offline reading (spec offline strategy steps 3–5, which
      need sync design under D-021).

**Acceptance**

- The app installs on supported browsers, and offline shows the app's fallback page rather than
  a browser error.
- A new deploy reaches the installed app without reinstalling it.
- Export returns all of the user's data, and account deletion leaves no rows for that user
  (checked).
- The security and accessibility checklists are done, with findings fixed or logged.

---

## Validation stages (spec §15)

1. **Stage 1: personal use for 30 days.** Log observations in the DEVLOG using the spec §15
   questions.
2. **Stage 2: private beta with 5–10 people.** Starts after Stage 1 and P6.8.
3. **Stage 3: public launch.** Landing page, policies, and a feedback loop.

---

## Post-MVP backlog (unscheduled; prioritise from real usage)

- **Voice Capture (spec Milestone 4), the Phase 7 candidate:** microphone permission handling,
  recording where supported, server-side speech-to-text (provider to be decided), review and edit
  of the transcript, saving it as a thought, and a text fallback. Also a consent flow, an audio
  retention policy, and a `voice_recordings` table plus a Storage bucket with RLS.
- Offline draft capture with a sync queue and explicit conflict handling (spec §10 steps 3–5).
- Conversation Mode (spec §4.4).
- AI categorisation: opt-in, server-side, disclosed (spec §4.1, §14).
- Push notifications and a morning review (spec §4.5).
- Reflection pattern review, in non-medical language (spec §4.6).
- Slow Down Mode (spec §4.3; deferred P5.8): a short breathing exercise and "What is actually
  bothering you right now?", with an optional save as a thought. Respect
  `prefers-reduced-motion`, and make no medical claims.
- Sign in with Apple (D-019): needs an Apple Developer account and a secret rotated every 6
  months.
- Guest or local-only mode (D-003).
- Dark theme, if it is not delivered in P1.6.
