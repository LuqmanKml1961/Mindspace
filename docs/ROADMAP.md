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
      `addReminder` (domain-checked); `listActiveReminders`.
  - **Schemas** (`schemas.ts`): ciphertext shapes and sizes as the database checks them; the
    date and time are sent together; completion and user ids are dropped.
  - **Wiring:** the server use cases in `container.ts` and `createTaskUseCases` in
    `browser.ts`. The Server Actions and screens come in P4.6.
  - **Tests:** 23 unit tests. Eleven deliberate breaks were all caught (see the DEVLOG).
- [ ] P4.6 Tasks UI: quick add (only the title is required), an edit sheet with due date/time and
      priority pickers, and complete with undo.
- [ ] P4.7 Convert a thought into a task from Brain Dump: the title is pre-filled and linked through
      `source_thought_id`. What happens to the thought is settled in DATA_MODEL.md, Q-2.
- [ ] P4.8 In-app reminders (D-008): due reminders appear on Home ("Upcoming reminders") and on
      Tasks, with a dismiss action. No push.
- [ ] P4.9 Home: a summary of today's tasks and upcoming reminders. Overdue items look neutral, with
      no red alarms.
- [ ] P4.10 Validation, empty and error states.

**Acceptance**

- Tasks, with or without due dates, land in the right view for the user's timezone.
- Converting a thought creates a linked task.
- RLS tests pass for `tasks` and `reminders`.

---

## Phase 5 — Mind Clarity (spec Milestone 5, MVP Module 3)

**Goal (spec deliverable):** users can reflect and choose a manageable priority.

- [ ] P5.1 Domain: `DailyCheckIn` (one per user per local date; every prompt optional), its
      repository interface, and tests.
- [ ] P5.2 Migration: `daily_checkins`, with an ownership FK to tasks and RLS. pgTAP tests.
      Regenerate the types. Every answer is ciphertext (D-021, DATA_MODEL.md).
- [ ] P5.3 Use cases: start or resume today's check-in, save answers, set the priority (an existing
      task or free text), and list past check-ins.
- [ ] P5.4 Check-in flow UI: one prompt per step (spec §4.6). Every step can be skipped and the
      flow can end early. Separates "act on now" from "can wait".
- [ ] P5.5 One Thing at a Time: today's priority is prominent on Home, and every other task is
      still one tap away (spec §4.7).
- [ ] P5.6 Thought review flow: go through inbox thoughts one at a time and choose park, convert to
      task, archive or delete.
- [ ] P5.7 Past reflections: a simple list by date. No scores, streaks or "insights".
- [ ] P5.8 (Stretch) Slow Down Mode: a short breathing exercise and the prompt "What is actually
      bothering you right now?", with an optional save as a thought. Respects
      `prefers-reduced-motion`. No medical claims.

**Acceptance**

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
- [ ] P6.2 Service worker: cache the app shell and static assets, add an offline fallback page and
      a connection-status indicator. Choose between a hand-written worker (Next.js PWA guide) and a
      library such as Serwist after checking compatibility with the installed Next.js version.
      Do not cache user data yet.
- [ ] P6.3 Test installation and browser behaviour on Chrome and Edge desktop, Android Chrome, and
      iOS Safari (Add to Home Screen). Record the results in the DEVLOG.
- [ ] P6.4 Accessibility review: keyboard navigation, visible focus, WCAG AA contrast, labels,
      reduced motion, and readable text at 200% zoom.
- [ ] P6.5 Data controls (spec §14): export my data (a JSON download of all the user's rows), and
      delete my account (server-side only; removes the auth user and cascades their data).
- [ ] P6.6 Security review: re-run every RLS test, confirm no secret keys are in the client bundle,
      add security headers, audit dependencies, and consider rate limiting on auth.
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

**Acceptance**

- The app installs on supported browsers, and offline shows the app's fallback page rather than
  a browser error.
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
- Sign in with Apple (D-019): needs an Apple Developer account and a secret rotated every 6
  months.
- Guest or local-only mode (D-003).
- Dark theme, if it is not delivered in P1.6.
