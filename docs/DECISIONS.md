# Mindspace — Decisions

Decisions that shape the build. Product intent comes from the spec:
[`mindspace_product_and_development_plan.md`](../mindspace_product_and_development_plan.md).

**Status values:** `Proposed` (recommended default, waiting for your confirmation) ·
`Accepted` · `Superseded`.

**To confirm a decision:** set Status to `Accepted`, fill in **Decision** and **Date**,
then add a line to the current session in [`DEVLOG.md`](DEVLOG.md).

## Summary

| ID    | Topic                             | Status   | Needed before                                    |
| ----- | --------------------------------- | -------- | ------------------------------------------------ |
| D-001 | Product name                      | Accepted | P6.1 (manifest). Working name is fine until then |
| D-002 | Visual direction                  | Accepted | P1.6 (design tokens)                             |
| D-003 | Accounts                          | Accepted | Phase 2                                          |
| D-004 | Scope and build order             | Accepted | Phase 1                                          |
| D-005 | Technology stack                  | Accepted | P1.1 (scaffold)                                  |
| D-006 | Onion Architecture                | Accepted | —                                                |
| D-007 | Sign-in method                    | Accepted | P2.6                                             |
| D-008 | Reminders in the MVP              | Accepted | Phase 4                                          |
| D-009 | Hosting                           | Accepted | P1.10 (deployment previews)                      |
| D-010 | Package manager                   | Accepted | P1.1                                             |
| D-011 | Local database and tests          | Accepted | Phase 2                                          |
| D-012 | shadcn/ui library and preset      | Accepted | Before more components are added                 |
| D-013 | Colour palette and control height | Accepted | P1.6                                             |
| D-014 | Installable app and screen edges  | Accepted | —                                                |
| D-015 | Appearance setting (theme toggle) | Accepted | —                                                |
| D-016 | System bars always dark           | Accepted | —                                                |

---

## D-001 — Product name

- **Context:** Spec §18.1. Options listed: Mindspace, Mindly, Unclutter, or another name.
- **Recommendation:** Keep **Mindspace** as the working name. Check trademarks and domain
  availability yourself before launch. Claude cannot verify trademarks.
- **Impact:** Keep the app name in one config constant, plus the manifest, so a rename stays cheap.
- **Status:** Accepted
- **Decision:** Accepted: **Mindspace** as the working name. You check trademarks and the domain
  before launch.
- **Date:** 2026-11-03

## D-002 — Visual direction

- **Context:** Spec §6 and §18.2. Options: minimalist and calm; brutalist and monochrome; soft
  and friendly; dark and technical.
- **Recommendation:** **Minimalist, calm, modern.** Soft neutral surfaces, one or two accent
  colours, generous spacing, readable type, simple icons. No streaks, gamification or dense
  dashboards.
- **Sub-question (dark mode):** The spec says dark mode can come "when useful". Racing thoughts
  often happen late at night, so following the system light/dark setting from the start is
  worth considering. With shadcn/ui tokens the extra cost is small.
  **Recommendation:** support system light/dark in P1.6.
- **Status:** Accepted
- **Decision:** Accepted: minimalist, calm and modern, following the system light/dark setting
  from P1.6.
- **Date:** 2026-11-03

## D-003 — Accounts

- **Context:** Spec §17.3 and §18.3. Options: require accounts; allow guest mode; start local-only.
- **Recommendation:** **Supabase Auth accounts from the first release.** They give multi-device
  access, server backups, and RLS-enforced privacy. Guest mode can be added later (backlog).
- **Consequence if local-only is chosen instead:** Phase 2 and the infrastructure adapters change
  to browser storage. Domain and application layers stay the same (that is a benefit of D-006).
- **Status:** Accepted
- **Decision:** Accepted: Supabase Auth accounts from the first release. Guest mode stays in the
  backlog.
- **Date:** 2026-11-03

## D-004 — Scope and build order

- **Context:** Spec §5, §11 and §18.4. Options: build the core modules progressively; Brain Dump
  only; UI first, backend later.
- **Recommendation:** **Build the core modules progressively, starting with Brain Dump**, in the
  phase order in [`ROADMAP.md`](ROADMAP.md). This includes the spec corrections G-1 to G-8
  below, most importantly **moving Voice Capture after the MVP**.
- **Status:** Accepted
- **Decision:** Accepted: progressive modules starting with Brain Dump, in the ROADMAP phase
  order, including resolutions G-1 to G-8.
- **Date:** 2026-11-03

## D-005 — Technology stack

- **Context:** Spec §7 and §18.5. Options: Next.js + TypeScript + Tailwind + shadcn/ui + Supabase;
  or Next.js + C# ASP.NET Core + SQL Server.
- **Recommendation:** **Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui + Supabase**
  (PostgreSQL, Auth, Storage later). Add a separate C# API only if a real need appears (spec §7).
  Use the latest stable versions at scaffold time and record them in the DEVLOG.
- **Status:** Accepted
- **Decision:** Accepted: Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui + Supabase.
- **Date:** 2026-11-03

## D-006 — Onion Architecture

- **Context:** Standing rule for this project (from `.claude/hooks/user-prompt-rules.cjs`).
- **Decision:** Use a layer-first Onion Architecture: `domain` → `application` → outer ring
  (`infrastructure`, presentation). This replaces the feature-folder structure suggested in spec
  §17. See [`ARCHITECTURE.md`](ARCHITECTURE.md).
- **Status:** Accepted
- **Date:** 2026-11-03

## D-007 — Sign-in method

- **Context:** Needed for Phase 2. Not covered by the spec.
- **Options:**
  1. **Email one-time code** (passwordless; the user types a 6-digit code into the app).
  2. **Email magic link** (passwordless; the user clicks a link).
  3. **Email + password.**
  4. **Google OAuth.**
- **Considerations:**
  - Options 1–3 all depend on auth emails being delivered. Supabase's built-in email sender is
    limited and meant for testing, so a custom SMTP provider is likely needed before the private
    beta. Check the current limits in the Supabase docs at P2.6.
  - Magic links on mobile can open in the browser instead of the installed PWA, so the session
    lands in the wrong place. A typed one-time code avoids that.
  - Google OAuth avoids email delivery but needs a Google Cloud OAuth setup.
- **Recommendation:** **Email one-time code** for Phase 2. Consider adding Google OAuth later.
- **Status:** Accepted
- **Decision:** Accepted: email one-time code.
- **Date:** 2026-11-03

## D-008 — Reminders in the MVP

- **Context:** Spec §5 lists "create reminders" in the MVP but defers "more sophisticated
  notification workflows". Principle 6: notifications should not create mental noise.
- **Options:** in-app only; web push (needs a service worker, push keys, a server-side scheduler,
  and platform-specific limits, e.g. iOS only for installed PWAs); email reminders.
- **Recommendation:** **In-app only for the MVP.** Each reminder belongs to a task. Due reminders
  show on Home and Tasks. Push notifications go to the post-MVP backlog.
- **Status:** Accepted
- **Decision:** Accepted: in-app reminders only, each attached to a task.
- **Date:** 2026-11-03

## D-009 — Hosting

- **Context:** Spec §7 (hosting considerations).
- **Options:** Vercel Hobby, or Cloudflare (Next.js through an adapter; check feature support
  for the Next.js version in use).
- **Recommendation:** **Vercel Hobby for development and personal use (Stage 1).** The spec notes
  Hobby is for personal, non-commercial use, so review the terms again at P6.9 before the private
  beta. You connect the GitHub repo yourself (Claude does not push).
- **Status:** Accepted
- **Decision:** Accepted: Vercel (Hobby plan) for development and personal use. Review the terms
  at P6.9 before the private beta.
- **Date:** 2026-11-03

## D-010 — Package manager

- **Context:** pnpm 11.17.0, npm 10.9.8 and yarn 4.12.0 are installed (checked 2026-11-03).
- **Recommendation:** **pnpm.**
- **Status:** Accepted
- **Decision:** Accepted: pnpm, using **stable releases only** (no canary, beta or RC) for tools
  and dependencies. Checked on npm, 2026-11-03: the latest stable Next.js is 16.4.4 and the
  latest stable pnpm is 12.16.1. The installed pnpm, 11.17.0, is a stable release, but behind.
  **Stay on pnpm 11.17.0 for now.** You will upgrade it yourself later.
- **Date:** 2026-11-03

## D-011 — Local database and testing

- **Context:** RLS must be tested with several accounts (spec §9). Docker 29.6.1 is installed.
  The Supabase CLI is not installed yet.
- **Recommendation:**
  - The Supabase CLI as a project dev dependency, with the **local Supabase stack (Docker)** for
    development and tests. A hosted free-tier project for preview and production.
  - **Vitest** for domain and application tests. **pgTAP via `supabase test db`** for RLS tests.
    **Playwright** later, only for critical flows.
- **Alternative:** develop against a hosted dev project only, with no Docker. Setup is simpler,
  but tests run remotely and can pollute data.
- **Status:** Accepted
- **Decision:** Accepted: the local Supabase stack (CLI as a dev dependency, plus Docker) for
  development and tests, and a hosted free-tier project for preview and production. Vitest,
  pgTAP, and Playwright later.
- **Date:** 2026-11-03

## D-012 — shadcn/ui component library and preset

- **Context:** Came up during P1.5. `shadcn init` (CLI 4.23.0) asks for two things the plan did
  not anticipate. The **component library** underneath the components can be `base` (Base UI),
  `radix` or `aria` (React Aria); the CLI's own prompt labels Base UI "(Recommended)". The
  **preset** sets style, font and icons; presets found in the CLI source are nova, vega, maia,
  lyra, mira, luma, sera and rhea.
- **Applied:** `--defaults`, i.e. **`base-nova`**: Base UI with Nova (Geist font, Lucide icons).
  - It is the CLI's recommended and default option, so we fight the tool least.
  - The scaffold's layout already uses Geist.
  - Lucide fits D-002's "simple icons".
  - Colours are replaced in P1.6 regardless.
- **Side effect:** shadcn 4.x installs its own **`cn`** package (repository `shadcn-ui/cn`,
  maintainer `shadcn <m@shadcn.com>`, the same as the CLI) instead of `clsx` + `tailwind-merge`.
  Checked 2026-11-03: it has no dependencies and was revived from 0.2.0 in September 2026, so it
  is young and pre-1.0. 0.5.1 is installed; pnpm's release-age guard skipped 0.5.2. Generated
  components import it directly (`import { cn } from "cn"`).
- **Alternatives:** Radix or React Aria; another preset; or swap `cn` for `clsx` +
  `tailwind-merge`, which means editing every generated component's import. Only one component
  (Button) exists, so changing course now is cheap.
- **Finding (2026-11-03, from the shadcn skill's `design-system.md` style table):** the style
  sets component geometry that tokens can't change. **Nova** is described as "reduced padding
  and margins for compact layouts (32–36px controls, 6–8px radius, hairlines over shadows)",
  which runs against spec §6 ("generous spacing") and comfortable touch targets. **Maia** is
  "soft and rounded, with generous spacing (40px+ controls, 12px+ card radius, generous padding,
  editorial pacing)", which fits D-002 better. Maia's preset defaults to Hugeicons (MIT) and the
  Figtree font.
- **Status:** Accepted
- **Decision:** Accepted: **Base UI with the Maia style (`base-maia`)**, applied with
  `shadcn apply --preset maia` (CLI 4.23.0). This brings the **Figtree** font (`--font-sans`),
  **Hugeicons** (`@hugeicons/react`, `@hugeicons/core-free-icons`; `lucide-react` removed as
  unused), and a pill-shaped Button. The shadcn `cn` package stays. Measured in the generated
  `button.tsx`: the default control height is **36px** (`h-9`), `lg` is **40px** (`h-10`), and
  Nova's default was 32px. Decide in P1.6 whether to raise control heights for touch.
- **Date:** 2026-11-03

## D-013 — Colour palette and control height

- **Context:** P1.6. My first proposal was warm neutrals with a sage accent. You replaced it with
  your own five-colour palette, and chose option B for control heights.
- **Decision:** Accepted. The palette is Ash Grey `#cad2c5`, Muted Teal `#84a98c`, Deep Teal
  `#52796f`, Dark Slate Grey `#354f52` and Charcoal Blue `#2f3e46`. It is mapped onto shadcn
  tokens, with derived tints for surfaces and an added soft terracotta for destructive actions
  only. Every text pair passes 4.5:1 in both themes (DESIGN.md §2–3). The default control height
  is 40px (`lg` 44px), and future form controls must match.
- **Date:** 2026-11-03

## D-014 — Installable app and screen edges

- **Context:** On your phone, with the app added to the home screen, there were strips at the top
  and bottom of the screen. You pointed to the `card-share` repo as the reference. Its source
  showed four techniques: `theme-color`, `appleWebApp`, a standalone manifest, and an
  `html`/`body` background. It uses no safe-area handling, because it has no fixed bottom bar.
- **Decision:** Accepted (your choice: "Steps 1 + 2"). Apply all four, with per-theme
  `theme-color`, and bring the manifest and icons forward from P6.1. Mindspace has a fixed tab
  bar, so also use `viewport-fit=cover` with `env(safe-area-inset-*)` padding. Details are in
  DESIGN.md §7a. The placeholder "M" icons were replaced the same day with your "Sleeping Brain
  House" icon.
- **Follow-up (2026-11-03):** your retest on Android 17 showed the top was right, but a white bar
  at the bottom stayed white in dark mode. That means it comes from the manifest colours Android
  uses for the navigation bar, not from the page. card-share avoids it only because it is
  light-only. Added `color_scheme_dark` (`#2f3e46`), which is spec-correct but unconfirmed on
  Chrome Android, and moved the tab bar to `bottom: env(safe-area-inset-bottom)`, as Chrome's
  guide recommends. **Open:** if it is still white in dark mode after reinstalling, choose
  between a dark base colour (dark strip in light mode) and keeping the light base (white strip
  in dark mode).
- **Date:** 2026-11-03

## D-015 — Appearance setting (theme toggle)

- **Context:** You asked for a Settings toggle to choose dark or light mode. D-002 makes "follow
  the system" the default.
- **Decision:** Accepted. Settings → Appearance has **Light / Dark / System**, with System as the
  default so nothing changes for anyone who doesn't choose. The choice is stored per device in
  `localStorage` by next-themes. It is not synced to the account; that can be revisited once
  accounts exist (Phase 2). The system bars stay dark regardless (D-016). At your request, a change
  is animated: the pressed pill button morphs into a circle that fills the screen (View
  Transitions, 450ms). This is the third iteration, after your feedback on a slow circle and a
  boxy outline. It is skipped for reduced motion and in unsupported browsers.
- **Date:** 2026-11-03

## D-016 — System bars always dark

- **Context:** After testing on Android, you wanted the top and bottom bars dark in both themes,
  like card-share's always-blue bars, so neither theme shows a mismatched strip. A manifest can't
  reliably follow the theme anyway (D-014).
- **Decision:** Accepted. `theme-color` and the manifest's `theme_color` and `background_color`
  are all Charcoal Blue `#2f3e46` (`systemBarColor` in `src/lib/theme-colors.ts`). This supersedes
  the per-scheme `theme-color`, `color_scheme_dark` (D-014 follow-up) and `ThemeColorSync`
  (D-015), which were removed. Not yet tested on iOS.
- **Date:** 2026-11-03

---

## Spec gaps resolved by this plan

Found while reviewing the spec on 2026-11-03. These resolutions are part of D-004.

| ID  | Gap or conflict in the spec                                                                                      | Resolution in this plan                                                    |
| --- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| G-1 | §5 says voice transcription comes after the MVP, but §11 puts Voice Capture at Milestone 4, before Mind Clarity. | Voice Capture moves to the post-MVP backlog (Phase 7 candidate).           |
| G-2 | No milestone covers authentication (only §17 step 7), but RLS in Milestone 2 needs it.                           | New **Phase 2 — Supabase & authentication**.                               |
| G-3 | "Convert a thought into a task" is in Module 1, but it needs tasks (Module 2).                                   | Scheduled in Phase 4 (P4.7).                                               |
| G-4 | Reminders are in the MVP, but notification workflows are deferred.                                               | In-app reminders only (D-008).                                             |
| G-5 | Data export and account deletion (§14 minimum requirements) are in no milestone.                                 | Added to Phase 6 (P6.5), before anyone else uses the app.                  |
| G-6 | The `thoughts.category TEXT` example conflicts with the separate `categories` table.                             | A `categories` table plus a nullable FK on `thoughts` (see DATA_MODEL.md). |
| G-7 | §17 suggests a feature-folder structure; the project rule requires Onion Architecture.                           | Layer-first onion structure (D-006, ARCHITECTURE.md).                      |
| G-8 | §11 Milestone 6 says "public beta", while §15 stages personal use → private beta → public.                       | Phase 6 is "beta readiness"; launch follows the §15 stages.                |
