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
**Needs:** D-003, D-007, D-011.

- [ ] P2.1 Add the Supabase CLI as a dev dependency and run `supabase init`. The local stack runs on
      Docker (`supabase start`). You create a hosted free-tier project for preview and production.
- [ ] P2.2 Environment config: put the Supabase URL and public key in `.env.local` and the host
      settings. Create `.env.example` listing the variable names with no values (moved from P1.9;
      `.gitignore` already allows it). Add a typed, validated env module in `src/infrastructure/config/`. Take the variable
      names from the current Supabase Next.js guide, since Supabase's key naming has changed
      (anon → publishable). Verify before using.
- [ ] P2.3 Create the Supabase clients with `@supabase/ssr` in `src/infrastructure/supabase/`: a
      server client that reads cookies, and a browser client only if needed. Add session refresh
      in Next.js middleware/proxy, following the current Supabase SSR guide for the installed
      Next.js version. Server-only modules import `server-only`.
- [ ] P2.4 Migration: the `set_updated_at()` trigger function, the `profiles` table and its RLS,
      and the `handle_new_user()` trigger (DATA_MODEL.md).
- [ ] P2.5 Generate the database types into `src/infrastructure/supabase/database.types.ts`. Add a
      `db:types` script.
- [ ] P2.6 Build the auth flow for D-007: a `(auth)/sign-in` page, server actions for sign-in and
      sign-out, an `auth/callback` route if the method needs one, and friendly error states.
- [ ] P2.7 Protect routes: the `(app)` layout requires a session (checked on the server), and a
      signed-in user who visits sign-in is sent to `/home`.
- [ ] P2.8 Set up the pgTAP harness in `supabase/tests/`. First test: user A cannot read or update
      user B's profile. Add a `db:test` script.
- [ ] P2.9 Settings page: the signed-in email, a timezone setting (pre-filled from the browser,
      editable), and sign-out.

**Acceptance**

- Sign-in and sign-out work locally and on the preview deployment.
- Visiting any `(app)` route while signed out redirects to sign-in.
- `supabase test db` passes, and the profiles RLS is proven with two users.
- No secret or service-role key appears in a client component or a `NEXT_PUBLIC_` variable
  (checked with grep).

---

## Phase 3 — Brain Dump (spec Milestone 2, MVP Module 1)

**Goal (spec deliverable):** users can capture and manage their thoughts securely.

- [ ] P3.1 Set up Vitest for `src/domain` and `src/application`, with a `test` script.
- [ ] P3.2 Domain: `Thought` and `Category`, their rules (trimmed content must not be empty;
      length limits match the database checks), and the `ThoughtRepository` and
      `CategoryRepository` interfaces. Unit tests.
- [ ] P3.3 Migration: `categories` and `thoughts`, with indexes, composite ownership FKs, RLS and
      updated_at triggers. Two-user pgTAP tests for both tables. Regenerate the types.
- [ ] P3.4 Infrastructure: the Supabase repositories and row ↔ domain mappers, wired into the
      composition root.
- [ ] P3.5 Application use cases: capture; list (newest first, filter by category or status); get;
      update; delete; search; create, rename and delete a category; assign a category. Zod input
      schemas. Unit tests with in-memory fakes.
- [ ] P3.6 Capture UI: a single text area with autofocus. Save with a button or Ctrl/Cmd+Enter.
      After saving, the field clears and keeps focus for the next thought. Show a saving state.
      A failed save keeps the text.
- [ ] P3.7 List and detail/edit UI. Delete through an in-app confirmation dialog (shadcn
      AlertDialog), not the browser's `confirm()`.
- [ ] P3.8 Categories UI: pick or create a category in place. Offer suggested names from spec
      §4.1 and §4.2, but create none in advance.
- [ ] P3.9 Search: a case-insensitive match on title and content, escaping `%` and `_`. Add
      full-text search later only if needed.
- [ ] P3.10 Loading, empty and error states on every Brain Dump screen.
- [ ] P3.11 Home: "Your mind, right now" shows a few recent thoughts and how many wait in the inbox,
      with no urgency styling.

**Acceptance**

- From the capture screen, a thought is saved in a few seconds: one field, one action.
- Create, edit, delete, search and categorise all work. Text is never lost on a failed save.
- RLS tests pass for `thoughts` and `categories`. Domain and application tests pass.
- It is deployed so you can use it yourself.

### Checkpoint A — personal use (spec §17 step 10)

Use Brain Dump yourself before widening the scope. Record what helped and what caused friction
in the DEVLOG, then adjust Phases 4–5 if needed.

---

## Phase 4 — External Memory (spec Milestone 3, MVP Module 2)

**Goal (spec deliverable):** users can manage basic tasks and reminders.
**Needs:** D-008.

- [ ] P4.1 Domain: `Task` (title, notes, due date with optional time, priority low/normal/high,
      completion) and `Reminder`. Rules: a time needs a date, and a reminder belongs to a task.
      Repository interfaces and unit tests.
- [ ] P4.2 Dates and timezones: compute "today" in the profile's timezone. Add a small date library
      only if `Intl` is not enough. Test the boundaries (late at night, timezone offsets).
- [ ] P4.3 Migration: `tasks` and `reminders`, with indexes, ownership FKs and RLS. pgTAP tests,
      including a cross-user FK attempt that must be rejected. Regenerate the types.
- [ ] P4.4 Infrastructure repositories, wired into the composition root.
- [ ] P4.5 Use cases: create, edit, complete, reopen and delete a task; set due date and priority;
      add and dismiss a reminder; list Today (overdue plus today), Upcoming, No date and recently
      Completed. Unit tests.
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
      Regenerate the types.
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
      The icons are placeholders until a real logo exists (DESIGN.md §7a).
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
- Guest or local-only mode (D-003).
- Dark theme, if it is not delivered in P1.6.
