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

| Layer          | Responsibility | Examples |
| -------------- | -------------- | -------- |
| Domain         | Business concepts and rules. Pure TypeScript. | `Thought` type and `createThought()` validation, `ThoughtRepository` interface, `ValidationError` |
| Application    | Use cases that orchestrate domain objects through the repository interfaces. | `makeCaptureThought()`, `makeConvertThoughtToTask()`, `captureThoughtSchema` |
| Infrastructure | Implements the ports with Supabase. Reads config. Wires everything together. | `createSupabaseThoughtRepository()`, `env.ts`, `container.ts` |
| Presentation   | Routes, pages, server actions, UI components. | `app/(app)/thoughts/page.tsx`, `actions.ts`, `components/thoughts/capture-box.tsx` |

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
    │   ├── shared/             # base domain errors, shared helpers
    │   ├── thoughts/           # thought.ts, category.ts, *-repository.ts, *.test.ts
    │   ├── tasks/              # task.ts, reminder.ts, repositories
    │   └── check-ins/
    ├── application/
    │   ├── thoughts/           # capture-thought.ts, search-thoughts.ts, schemas.ts, *.test.ts
    │   ├── tasks/
    │   └── check-ins/
    ├── infrastructure/
    │   ├── config/             # env.ts (validated environment variables)
    │   ├── supabase/           # server/browser clients, session refresh, database.types.ts
    │   ├── repositories/       # supabase-*-repository.ts and row ↔ domain mappers
    │   └── container.ts        # composition root: builds use cases for the current request
    ├── app/                    # Next.js App Router (presentation)
    │   ├── (auth)/sign-in/
    │   ├── (app)/home | thoughts | tasks | clarity | settings/
    │   └── layout.tsx
    ├── components/             # presentation
    │   ├── ui/                 # shadcn/ui generated components
    │   ├── layout/             # app shell, navigation
    │   └── thoughts | tasks | clarity/   # feature UI components
    └── lib/
        └── utils.ts            # presentation helpers only (e.g. shadcn's cn())
```

Session refresh middleware/proxy sits at the `src/` root where Next.js requires it. It only calls
an infrastructure helper.

## 4. Dependency rules

| Layer (files)                     | May import                                   | Must not import |
| --------------------------------- | -------------------------------------------- | --------------- |
| `src/domain/**`                   | other domain files                           | application, infrastructure, app, components, lib; `react`, `next`, `@supabase/*`, `zod` |
| `src/application/**`              | domain, `zod`                                | infrastructure, app, components, lib; `react`, `next`, `@supabase/*` |
| `src/infrastructure/**`           | domain, application, `@supabase/*`, `server-only` | app, components |
| `src/app/**`, `src/components/**` | application, domain (types), `infrastructure/container`, lib | `@supabase/*` directly (always go through infrastructure) |

**Enforcement (P1.4):** ESLint `no-restricted-imports` overrides per layer in `eslint.config.*`.
Use `patterns` that match both alias imports and relative imports (for example
`['@/infrastructure/*', '**/infrastructure/**']`), so relative paths cannot get around a rule.
Sketch:

```js
{
  files: ['src/domain/**/*.ts'],
  rules: {
    'no-restricted-imports': ['error', {
      patterns: [{
        group: ['@/application/*', '@/infrastructure/*', '@/app/*', '@/components/*', '@/lib/*',
                '**/application/**', '**/infrastructure/**', 'react', 'next', 'next/*', '@supabase/*', 'zod'],
        message: 'Domain must stay framework-free (Onion Architecture).',
      }],
    }],
  },
}
```

## 5. Request flow example: capturing a thought

```text
CaptureBox (client component)
  └─► server action captureThoughtAction(formData)        src/app/(app)/thoughts/actions.ts
        ├─ parse input with captureThoughtSchema         src/application/thoughts/schemas.ts
        ├─ { user, useCases } = await getAppContext()    src/infrastructure/container.ts
        ├─ useCases.captureThought({ userId: user.id, content })
        │     ├─ createThought(...)  → domain rules       src/domain/thoughts/thought.ts
        │     └─ thoughts.create(thought) → port         src/domain/thoughts/thought-repository.ts
        │           └─ SupabaseThoughtRepository (insert; RLS checks auth.uid() = user_id)
        └─ revalidatePath('/thoughts') and return { ok: true } or { ok: false, error }
```

## 6. Conventions

- **Entities are plain objects and types, built by pure functions** (`createThought(props)`), not
  classes. Server Components can then pass them to Client Components without serialisation
  problems.
- **Use cases are factory functions** that take their dependencies and return an async function:
  `makeCaptureThought({ thoughts }) => (input) => Promise<Thought>`. They take `userId`
  explicitly, which keeps them testable.
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

- RLS is enabled on every user-owned table, with four owner policies (DATA_MODEL.md §2).
- **Cross-row ownership:** foreign keys between user-owned tables are composite
  (`(x_id, user_id)` → `(id, user_id)`). Otherwise a user could link their row to someone else's.
  Postgres foreign-key checks bypass RLS.
- Server-only modules import `server-only`. Secret keys never use the `NEXT_PUBLIC_` prefix.
- Auth sessions use cookie-based SSR auth through `@supabase/ssr`. Session refresh follows the
  current Supabase guide.
- Collect only the data the app needs (spec §14). Do not log user content.
- Account deletion and data export arrive in Phase 6, before anyone else uses the app.

## 8. Testing strategy

| What                         | Tool                         | When |
| ---------------------------- | ---------------------------- | ---- |
| Domain rules, use cases      | Vitest, with in-memory fake repositories | from Phase 3 |
| RLS and database constraints | pgTAP via `supabase test db`, using two users per table | from Phase 2 |
| Critical user flows          | Playwright (optional)        | Phase 6, or once flows settle |
| Layouts and devices          | Manual: 360px and desktop; Chrome, Edge, Safari, Android, iOS | every UI task; full pass in P6.3 |

## 9. PWA and offline

Planned for Phase 6 (spec §10): a manifest, icons, and a service worker that caches the app shell
and static assets, with an offline fallback. Do not cache user data or claim offline support until
draft sync exists (post-MVP).
