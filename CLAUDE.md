# Mindspace

A calm, privacy-first PWA for capturing thoughts, managing everyday responsibilities, and
reflecting: "Your mind has enough to think about." Planned stack: Next.js (App Router) +
TypeScript + Tailwind CSS + shadcn/ui + Supabase, organised as an Onion Architecture.

## Start of every session

1. Read the **Resume here** block in [`docs/DEVLOG.md`](docs/DEVLOG.md).
2. Open the current phase in [`docs/ROADMAP.md`](docs/ROADMAP.md) and take the first unticked task.
3. Check [`docs/DECISIONS.md`](docs/DECISIONS.md) for pending decisions that affect the task.

## End of every session

Update the DEVLOG (Resume here + a new session entry), tick tasks in the ROADMAP, and record any
decisions or schema changes in DECISIONS.md and DATA_MODEL.md.

## Docs map

| File                                        | Purpose                                                       |
| ------------------------------------------- | ------------------------------------------------------------- |
| `mindspace_product_and_development_plan.md` | Product spec: the source of product intent                    |
| `docs/ROADMAP.md`                           | Phases, task IDs, acceptance points, Definition of Done       |
| `docs/DEVLOG.md`                            | Current status, phase tracker, session history                |
| `docs/DECISIONS.md`                         | Decision log and spec gaps resolved                           |
| `docs/ARCHITECTURE.md`                      | Onion layers, folder structure, dependency rules, conventions |
| `docs/DATA_MODEL.md`                        | Schema draft, RLS template, RLS test checklist                |

## Project rules

- Onion Architecture: dependencies point inward (`domain` ← `application` ← `infrastructure` /
  presentation). See ARCHITECTURE.md §4.
- Every user-owned table has RLS plus a two-user pgTAP test. No secret keys in client code.
- Small, reviewable changes. Do not overengineer, and do not add services before there is a need.
- Commit only after the user confirms, using Conventional Commits (`feat:`, `fix:`, `docs:`,
  `chore:`, `refactor:`, `test:`). Never push. No co-authored-by trailers.
- Product tone: calm and non-judgemental. No streaks, guilt, or medical claims (spec §1, §3).

## Next.js version

The installed Next.js (see the DEVLOG environment snapshot) may be newer than Claude's training
data. Check APIs against the version-matched docs in `node_modules/next/dist/docs/` (see
`AGENTS.md`, which `next dev` maintains) before writing Next.js code.

## Commands

| Command             | Purpose                                                   |
| ------------------- | --------------------------------------------------------- |
| `pnpm dev`          | Start the dev server (Turbopack) at http://localhost:3000 |
| `pnpm build`        | Production build                                          |
| `pnpm start`        | Serve the production build                                |
| `pnpm lint`         | ESLint                                                    |
| `pnpm typecheck`    | Generate Next.js route types, then `tsc --noEmit`         |
| `pnpm format`       | Format with Prettier (sorts Tailwind classes)             |
| `pnpm format:check` | Check formatting without writing                          |
