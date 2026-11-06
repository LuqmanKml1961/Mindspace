# Mindspace — Architecture

> Status: **Planned.** Nothing is implemented yet. Update this file when the code differs from
> it. Based on spec §7, §8 and §14, plus decisions D-005 and D-006.

## 1. Overview

```text
User devices (desktop / Android / iPhone)
        │  HTTPS
        ▼
Mindspace PWA — Next.js (App Router) + TypeScript, Tailwind CSS + shadcn/ui
        │  Server Components (reads) · Server Actions (writes)
        ▼
Application use cases  ──►  Domain (entities, rules, repository interfaces)
        │
        ▼  repository implementations (infrastructure)
Supabase: PostgreSQL (RLS) · Auth · Storage (later) · Edge Functions (later, if needed)
        │
        ▼  only when there is a clear product need
External services: speech-to-text · AI categorisation · notifications
```

Principles, from spec §8:

- Keep the first version simple, and add external services only when there is a clear need.
- Secrets and privileged operations run on the server only. Service-role and secret keys never
  reach browser code.
- **Row Level Security** enforces per-user access in the database. Hiding something in the UI is
  never a security measure.
- Validate on the server as well as in the UI.
- Future AI calls go behind protected server-side code.

## 2. Onion layers

```text
┌────────────────────────────────────────────────────────────────┐
│ Outer ring                                                     │
│   Presentation: src/app, src/components                        │
│   Infrastructure: src/infrastructure (Supabase, config,        │
│                   composition root)                            │
│   ┌────────────────────────────────────────────────────────┐   │
│   │ Application: src/application                           │   │
│   │   use cases, input schemas (zod)                       │   │
│   │   ┌────────────────────────────────────────────────┐   │   │
│   │   │ Domain: src/domain                             │   │   │
│   │   │   entities, value rules, domain errors,        │   │   │
│   │   │   repository interfaces (ports)                │   │   │
│   │   └────────────────────────────────────────────────┘   │   │
│   └────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
Dependencies always point inward.
```

| Layer          | Responsibility                                                               | Examples                                                                                          |
| -------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Domain         | Business concepts and rules. Pure TypeScript.                                | `Thought` type and `createThought()` validation, `ThoughtRepository` interface, `ValidationError` |
| Application    | Use cases that orchestrate domain objects through the repository interfaces. | `makeCaptureThought()`, `makeConvertThoughtToTask()`, `captureThoughtSchema`                      |
| Infrastructure | Implements the ports with Supabase. Reads config. Wires everything together. | `createSupabaseThoughtRepository()`, `env.ts`, `container.ts`                                     |
| Presentation   | Routes, pages, server actions, UI components.                                | `app/(app)/thoughts/page.tsx`, `actions.ts`, `components/thoughts/capture-box.tsx`                |

## 3. Folder structure (target; create folders only when the first file needs them)

```text
mindspace/
├── docs/                       # planning docs and DEVLOG
├── public/                     # icons and static assets (manifest icons in Phase 6)
├── supabase/
│   ├── migrations/             # SQL migrations (Supabase CLI)
│   └── tests/                  # pgTAP RLS tests
└── src/
    ├── domain/
    │   ├── shared/             # errors.ts (Validation, NotFound, Conflict), text.ts (characterCount), calendar.ts (dateInTimeZone, addDays, isCalendarDate)
    │   ├── encryption/         # passphrase.ts, user-keys.ts, user-keys-repository.ts (D-021)
    │   ├── profiles/           # profile.ts (Profile, toTimezone), profile-repository.ts
    │   ├── thoughts/           # thought.ts, category.ts, *-repository.ts (ports), *.test.ts (P3.2)
    │   ├── tasks/              # task.ts, reminder.ts, *-repository.ts (ports), *.test.ts (P4.1)
    │   └── check-ins/          # daily-check-in.ts, daily-check-in-repository.ts (port), *.test.ts (P5.1)
    ├── application/
    │   ├── auth/               # auth-service.ts (port: sign-up and sign-in, codes, password reset), schemas.ts
    │   ├── encryption/         # ports, errors, schemas, lock-data-key; set-up, unlock, recover, device-key (browser); user-keys (server)
    │   ├── profiles/           # get-profile.ts, update-timezone.ts, schemas.ts
    │   ├── thoughts/           # thoughts.ts, categories.ts (browser: rules, encrypt, decrypt); records.ts (server: ciphertext only); ports, schemas, *.test.ts
    │   ├── tasks/              # tasks.ts (browser: rules, encrypt, decrypt); records.ts (server: views by the user's today, complete/reopen) and reminders.ts (server); ports (TaskServer, Clock), schemas, *.test.ts
    │   └── check-ins/          # check-ins.ts (browser: rules, encrypt, decrypt, start); records.ts (server: today's check-in, start or resume, update, list); ports (CheckInServer, Today), schemas, *.test.ts (P5.3)
    ├── infrastructure/
    │   ├── auth/               # supabase-auth-service.ts (implements the auth port)
    │   ├── crypto/             # web-crypto.ts, device-key-store.ts: browser-side E2E (D-021)
    │   ├── config/             # env.ts (validated environment variables)
    │   ├── supabase/           # server/browser clients, session refresh, database.types.ts, fetch-all-rows.ts (paging past max_rows)
    │   ├── repositories/       # supabase-*-repository.ts and row ↔ domain mappers (profiles, user keys, encrypted thoughts and categories, encrypted tasks, reminders, encrypted check-ins)
    │   ├── container.ts        # server composition root: builds use cases for the current request
    │   └── browser.ts          # browser composition root: encryption, Brain Dump, task and check-in use cases
    ├── app/                    # Next.js App Router (presentation)
    │   ├── (auth)/sign-in | sign-up | forgot-password | reset-password/, actions.ts
    │   ├── auth/callback/route.ts   # OAuth return: exchanges the code, then redirects
    │   ├── (app)/home | thoughts (+ [id], categories) | tasks | clarity | settings/ (each with its actions.ts), encryption/actions.ts
    │   ├── (app)/layout.tsx    # the lock screen (EncryptionGate) around the whole signed-in app
    │   └── layout.tsx
    ├── components/             # presentation
    │   ├── ui/                 # shadcn/ui generated components
    │   ├── layout/             # app shell, navigation, brand-frame.tsx (sign-in and lock screen)
    │   ├── forms/              # shared form parts (field, messages, submit button)
    │   ├── encryption/         # lock screen: set up, recovery code, unlock, recover; the KeyServer adapter
    │   ├── thoughts/           # capture-box, thought-list, thought-item, thought-editor, make-task-sheet (P4.7), category-picker, category-manager, status-nav, save-shortcut, inbox-preview (Home); brain-dump.ts (Server Actions as ports)
    │   ├── tasks/              # quick-add, task-list, task-item, task-sheet, task-fields (shared with make-task-sheet), task-reminders (in the sheet), reminder-list (Home and Tasks), today-preview (Home), task-view-nav, task-views.ts (labels, hrefs, due and reminder wording); task-use-cases.ts (Server Actions as ports)
    │   ├── clarity/            # check-in (flow and stages), check-in-step, check-in-priority, check-in-recap, check-in-prompts.ts (spec wording); check-in-use-cases.ts (Server Actions as ports)
    │   └── auth | settings/    # feature UI components
    └── lib/
        ├── utils.ts            # presentation helpers only (e.g. shadcn's cn())
        ├── action-result.ts    # ActionResult, attempt and failure, shared by every Server Action
        ├── action-errors.ts    # browser side: unwrap and errorMessage
        ├── notify.ts           # toasts, with an optional action such as Undo
        └── use-now.ts          # the time, refreshed every 30 s (null on the server), for what is due
```

Session refresh and route protection live in `src/proxy.ts` (Next.js 16 renamed `middleware` to
`proxy`; it runs on the Node.js runtime), at the `src/` root where Next.js requires it. It calls
`updateSession()` from infrastructure and owns the list of public auth pages (P2.7).

## 4. Dependency rules

| Layer (files)                                   | May import                                                                                               | Must not import                                                                                       |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `src/domain/**`                                 | other domain files                                                                                       | application, infrastructure, app, components, lib; `react`, `react-dom`, `next`, `@supabase/*`, `zod` |
| `src/application/**`                            | domain, `zod`                                                                                            | infrastructure, app, components, lib; `react`, `react-dom`, `next`, `@supabase/*`                     |
| `src/infrastructure/**`                         | domain, application, `@supabase/*`, `server-only`                                                        | app, components                                                                                       |
| `src/app/**`, `src/components/**`, `src/lib/**` | application, domain (types), `infrastructure/container` (server), `infrastructure/browser` (client), lib | `@supabase/*` directly; any other `infrastructure/*` module                                           |

**Enforcement (P1.4, done):** `no-restricted-imports` overrides per layer in `eslint.config.mjs`,
which is the source of truth for the exact patterns. They use `regex` patterns matched against the
raw import string. `^(@/|(\.\./)+)<layer>(/|$)` catches both alias (`@/infrastructure/...`) and
relative (`../../infrastructure/...`) imports. This was verified on 2026-11-03 with 31 probe
imports across all layers, including `import type` and `export … from`.

`components.json` defines a `hooks` alias (`@/hooks`). If shadcn ever creates `src/hooks/`, add
it to the presentation rule's `files` in `eslint.config.mjs`.

Limits of the rule (from the ESLint 9.39 source): it checks `import`, `export … from` and
`import x = require()`, but **not dynamic `import()`**. Do not use dynamic imports to cross
layers. Package restrictions cover the listed frameworks only, not every UI library.

## 5. Request flow example: capturing and reading thoughts (D-021)

Writing: the text is checked and encrypted in the browser; the Server Action stores ciphertext.

```text
CaptureBox (client component)
  └─► captureThought({ userId, content, title })      src/application/thoughts/thoughts.ts
        ├─ createThought(...) → domain rules           src/domain/thoughts/thought.ts
        ├─ requireDeviceKey(device, userId)            src/application/encryption/device-key.ts
        ├─ crypto.encrypt(key, text, field)            FieldCrypto port → infrastructure/crypto
        └─ thoughts.create(ciphertext)                 ThoughtServer port (src/application/thoughts/ports.ts)
              └─► createThoughtAction(input)           src/app/(app)/thoughts/actions.ts
                    ├─ { user, useCases } = await getAppContext()     src/infrastructure/container.ts
                    ├─ thoughtInputSchema.safeParse(input)             src/application/thoughts/schemas.ts
                    └─ useCases.createThoughtRecord(user.id, data)     src/application/thoughts/records.ts
                          └─ SupabaseThoughtRepository (insert; RLS; the DB checks the ciphertext)
```

Reading: a Server Component loads the records and the browser decrypts them.

```text
page.tsx (Server Component) → useCases.listThoughtRecords(user.id) → EncryptedThought[] (all)
  └─► ThoughtList (client) → openThoughts({ userId, records }) → Thought[] (decrypted on the device)
        └─ filter by view and category, or search everything (thoughtMatches); nothing is sent
```

Since P3.11 the Brain Dump page loads all of the user's thoughts, paging past the API's row cap
(DATA_MODEL.md). Search can then look through every view without ever sending the search text.
The view (`?status=`) and category (`?category=`) stay in the URL; the search text stays in
memory.

**After a write (P3.9):**

- `createThoughtAction` calls `refresh()` (`next/cache`), so the list under the capture box
  re-renders with the new record.
- Edits stay in the editor's own state.
- A delete navigates back to the list instead of refreshing. Refreshing would re-render the
  deleted thought's page as not-found first.
- Dynamic pages aren't kept by the client router (`staleTimes.dynamic` is 0), so returning to a
  list always fetches it fresh.

The browser use cases are wired in `src/infrastructure/browser.ts` (`createBrainDumpUseCases`).
The Server Actions are passed in as `ThoughtServer` and `CategoryServer`.

## 6. Conventions

- **Entities are plain objects and types, built by pure functions** (`createThought(props)`), not
  classes. Server Components can then pass them to Client Components without serialisation
  problems.
- **Use cases are factory functions** that take their dependencies and return an async function:
  `makeCaptureThought({ crypto, device, thoughts }) => (input) => Promise<Thought>`. They take
  `userId` explicitly, which keeps them testable.
- **Errors (P3.12):** there are three layers.
  - **Expected errors** (`ValidationError`, `ConflictError`, `NotFoundError`, a locked device,
    offline) are caught where they happen. Typed text is never lost.
    - The result of an **action** is a toast (`notify` in `src/lib/notify.ts`, with `<Toaster>` in
      the root layout, added after Checkpoint A feedback): success briefly, failures until
      closed.
    - Errors about a **field** (a duplicate name, a passphrase rule) stay next to the field.
  - **Server Actions** return `{ ok: false, error }` with a safe message instead of throwing.
  - **Anything thrown while a page or the signed-in layout renders** reaches `src/app/error.tsx`.
    It sits at the root because an `error.js` doesn't catch its own folder's layout, and
    `(app)/layout.tsx` reads the keys. Next.js 16 passes `retry()` (re-fetch and re-render) for
    recovery. In production `error.message` is generic, so the page shows calm copy and logs
    only `error.digest`.
- **Auth** (D-019) goes through the `AuthService` port in `src/application/auth/`, which
  `getAuthService()` in the container provides. There are no use-case wrappers, because they would only
  forward the call. The adapter maps Supabase error codes to the port's `AuthFailure` values, so
  presentation never sees Supabase errors.
- **Composition root:** `getAppContext()` in `src/infrastructure/container.ts` creates the
  request-scoped Supabase client, resolves the signed-in user (redirecting if there is none), and
  returns `{ user, useCases }`.
- **Errors:** the domain throws typed errors (`ValidationError`, `NotFoundError`). Server actions
  catch them at the boundary and return `{ ok: false, error }` for `useActionState`. Unexpected
  errors are logged on the server and shown as a calm, generic message.
- **Validation:** zod schemas live in the application layer. Server actions always validate.
  Forms may reuse the same schema for instant feedback.
- **Rendering:** Server Components handle reads, and Server Actions handle writes followed by
  `revalidatePath`. Client Components are used only where interaction needs them. No client-side
  data-fetching library until a need appears (for example, offline sync).
- **Database access:** only from infrastructure repositories. Database row types
  (`database.types.ts`) never leak past the mappers.
- **Naming:** files in kebab-case; repository interfaces `XRepository`; implementations
  `createSupabaseXRepository`; use cases verb-first (`capture-thought.ts`).
- **Comments:** only where the code cannot say it.

## 7. Security

- **End-to-end encryption (D-021).** Free text a person writes is encrypted **in the browser**.
  The server, the database and its operator only ever see ciphertext. This changes the data
  flow for those fields:
  - **Reads:** Server Components load the encrypted rows (RLS still applies) and pass them to
    Client Components, which decrypt them with the device key.
  - **Writes:** the browser runs the domain rules, encrypts, and sends ciphertext to a Server
    Action. The action verifies the user (`getAppContext()`) and the ciphertext format, and
    stores it.
  - **Search and uniqueness checks** on encrypted fields run on the device.
  - **Where the crypto code lives (settled in P3.3):** `src/infrastructure/crypto/`
    (`web-crypto.ts` for keys and fields, `device-key-store.ts` for IndexedDB). It is browser
    code, so it never imports `server-only`. Presentation cannot import it directly.
  - **Browser composition root (P3.4):** Client Components reach it through
    `src/infrastructure/browser.ts`, the client-side twin of `container.ts`. It wires the
    encryption use cases (`application/encryption/`) with `webKeyCrypto` and the IndexedDB
    store. The server is passed in as a `KeyServer` built from Server Actions, so infrastructure
    never imports presentation. The ESLint exception is now `container|browser`. A probe confirmed
    that `browser` and `container` are allowed and `infrastructure/crypto` is still blocked.
  - **Lock screen (P3.4):** `src/app/(app)/layout.tsx` wraps the signed-in app in
    `EncryptionGate`. After sign-in, the app opens only once this device holds the key: set
    a passphrase the first time, otherwise unlock, or recover with the code. Layouts don't
    re-render on navigation, so the device is checked once per page load. Sign-out (Settings or
    the lock screen) clears the device key first. The gate is a convenience, not a security
    boundary: without the key, the data is unreadable ciphertext anyway.
- RLS is enabled on every user-owned table, with owner policies **and explicit grants** (DATA_MODEL.md
  §2). Supabase no longer exposes new tables to the API automatically. Database helper functions
  live in the unexposed `private` schema.
- **Cross-row ownership:** foreign keys between user-owned tables are composite
  (`(x_id, user_id)` → `(id, user_id)`). Otherwise a user could link their row to someone else's.
  Postgres foreign-key checks bypass RLS.
- Server-only modules import `server-only`. Secret keys never use the `NEXT_PUBLIC_` prefix.
- Auth sessions use cookie-based SSR auth through `@supabase/ssr`. Session refresh follows the
  current Supabase guide.
- **Route protection (P2.7)** is in `src/proxy.ts`: signed-out users go to `/sign-in`, and
  signed-in users on an auth page go to `/home`. Any redirect carries the refreshed session
  cookies and cache headers. This is a convenience, not the security boundary. As the Next.js
  docs say, **every Server Action and data read verifies the user itself** through
  `getAppContext()` and RLS, never by relying on the proxy alone.
- Collect only the data the app needs (spec §14). Do not log user content.
- Account deletion and data export arrive in Phase 6, before anyone else uses the app.

## 8. Testing strategy

| What                         | Tool                                                                                          | When                             |
| ---------------------------- | --------------------------------------------------------------------------------------------- | -------------------------------- |
| Domain rules, use cases      | Vitest (`pnpm test`, `vitest.config.mts`), with in-memory fakes; `*.test.ts` next to the code | from P3.1                        |
| RLS and database constraints | pgTAP via `supabase test db`, using two users per table                                       | from Phase 2                     |
| Critical user flows          | Playwright (optional)                                                                         | Phase 6, or once flows settle    |
| Layouts and devices          | Manual: 360px and desktop; Chrome, Edge, Safari, Android, iOS                                 | every UI task; full pass in P6.3 |

## 9. PWA and offline

The manifest (`src/app/manifest.ts`), icons, `theme-color` and safe areas are **done** (brought
forward, D-014; see DESIGN.md §7a). Still planned for Phase 6 (spec §10): a service worker that
caches the app shell and static assets, with an offline fallback. Do not cache user data or claim
offline support until draft sync exists (post-MVP).
