# Mindspace

> Your mind has enough to think about.

A calm, privacy-first progressive web app for capturing thoughts, organising everyday
responsibilities and reducing mental clutter. It's built for personal use first, then a small
private beta.

**Live:** https://m1ndspace.vercel.app

## Status

Early development. Current phase, progress and next steps are in
[`docs/DEVLOG.md`](docs/DEVLOG.md) (start at **Resume here**).

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui (Base UI, Maia style)
· next-themes · Supabase (from Phase 2) · Vercel. The code follows an Onion Architecture
([`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)).

## Prerequisites

- **Node.js 20.9 or later** (Next.js 16's requirement; developed on Node 22).
- **pnpm 11.** This project uses pnpm only. The exact version is pinned in `package.json`
  (`packageManager`), so `yarn` refuses to run here.

## Getting started

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000. It redirects to `/home`.

## Scripts

| Command             | Purpose                                           |
| ------------------- | ------------------------------------------------- |
| `pnpm dev`          | Start the dev server (Turbopack)                  |
| `pnpm build`        | Production build                                  |
| `pnpm start`        | Serve the production build                        |
| `pnpm lint`         | ESLint, including the Onion layer import rules    |
| `pnpm typecheck`    | Generate Next.js route types, then `tsc --noEmit` |
| `pnpm format`       | Format with Prettier (sorts Tailwind classes)     |
| `pnpm format:check` | Check formatting without writing                  |
| `pnpm db:start`     | Start local Supabase (needs Docker Desktop)       |
| `pnpm db:stop`      | Stop local Supabase                               |

Before committing, run `pnpm lint`, `pnpm typecheck`, `pnpm format:check` and `pnpm build`.
Commit messages follow [Conventional Commits](https://www.conventionalcommits.org) (`feat:`,
`fix:`, `docs:`, `chore:` …).

## Project docs

| File                                                                                     | Contents                                            |
| ---------------------------------------------------------------------------------------- | --------------------------------------------------- |
| [`mindspace_product_and_development_plan.md`](mindspace_product_and_development_plan.md) | Product spec                                        |
| [`docs/ROADMAP.md`](docs/ROADMAP.md)                                                     | Phases, tasks, acceptance criteria                  |
| [`docs/DEVLOG.md`](docs/DEVLOG.md)                                                       | Current status and session history                  |
| [`docs/DECISIONS.md`](docs/DECISIONS.md)                                                 | Decision log                                        |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)                                           | Onion layers, folder structure, conventions         |
| [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md)                                               | Database schema draft and RLS                       |
| [`docs/DESIGN.md`](docs/DESIGN.md)                                                       | Palette, tokens, dark mode, controls, tone of voice |
| [`CLAUDE.md`](CLAUDE.md)                                                                 | Working notes for AI-assisted development           |

## Deployment

Hosted on Vercel (decision D-009), deployed from `main`.
