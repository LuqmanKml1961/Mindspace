# Mindspace — Decisions

Decisions that shape the build. Product intent comes from the spec:
[`mindspace_product_and_development_plan.md`](../mindspace_product_and_development_plan.md).

**Status values:** `Proposed` (recommended default, waiting for your confirmation) ·
`Accepted` · `Superseded`.

**To confirm a decision:** set Status to `Accepted`, fill in **Decision** and **Date**,
then add a line to the current session in [`DEVLOG.md`](DEVLOG.md).

## Summary

| ID    | Topic                             | Status              | Needed before                                    |
| ----- | --------------------------------- | ------------------- | ------------------------------------------------ |
| D-001 | Product name                      | Accepted            | P6.1 (manifest). Working name is fine until then |
| D-002 | Visual direction                  | Accepted            | P1.6 (design tokens)                             |
| D-003 | Accounts                          | Accepted            | Phase 2                                          |
| D-004 | Scope and build order             | Accepted            | Phase 1                                          |
| D-005 | Technology stack                  | Accepted            | P1.1 (scaffold)                                  |
| D-006 | Onion Architecture                | Accepted            | —                                                |
| D-007 | Sign-in method                    | Superseded by D-019 | P2.6                                             |
| D-008 | Reminders in the MVP              | Accepted            | Phase 4                                          |
| D-009 | Hosting                           | Accepted            | P1.10 (deployment previews)                      |
| D-010 | Package manager                   | Accepted            | P1.1                                             |
| D-011 | Local database and tests          | Accepted            | Phase 2                                          |
| D-012 | shadcn/ui library and preset      | Accepted            | Before more components are added                 |
| D-013 | Colour palette and control height | Accepted            | P1.6                                             |
| D-014 | Installable app and screen edges  | Accepted            | —                                                |
| D-015 | Appearance setting (theme toggle) | Accepted            | —                                                |
| D-016 | System bars always dark           | Accepted            | —                                                |
| D-017 | Supabase access path and tooling  | Accepted            | Phase 2                                          |
| D-018 | Database privileges convention    | Accepted            | Every migration                                  |
| D-019 | Sign-in methods                   | Accepted            | P2.6                                             |
| D-020 | Email on the live site            | Accepted            | P6.10 (before the private beta)                  |
| D-021 | End-to-end encryption             | Accepted            | P3.3 (before any thought is stored)              |
| D-022 | Palette retune                    | Accepted            | —                                                |
| D-023 | Service worker and updates        | Accepted            | P6.2                                             |
| D-024 | Accessibility fixes               | Accepted            | P6.4                                             |
| D-025 | Data export and account deletion  | Accepted            | P6.5                                             |

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
- **Status:** Superseded by D-019
- **Decision:** Accepted: email one-time code.
- **Date:** 2026-11-03
- **Superseded 2026-11-04 by D-019:** a code at every sign-in uses too many emails for the
  free SMTP tiers you would use.

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
- **Region (2026-11-04):** functions run in **`sin1` (Singapore)**, set with `vercel.json`
  `"regions": ["sin1"]`. That's next to Supabase in `ap-southeast-1`. Vercel's default was
  `iad1` (Washington DC), so every Settings load crossed the Pacific to reach the database.
  Vercel's docs: "Functions should be executed in the same region as your database", and Hobby
  allows a single region.

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
  are all the dark page colour (`systemBarColor` in `src/lib/theme-colors.ts`): Charcoal Blue
  `#2f3e46` at first, `#25353b` since the D-022 retune. This supersedes
  the per-scheme `theme-color`, `color_scheme_dark` (D-014 follow-up) and `ThemeColorSync`
  (D-015), which were removed. Not yet tested on iOS.
- **Date:** 2026-11-03

## D-017 — Supabase access path and tooling

- **Context:** Supabase's Connect dialog offered four setups: supabase-js with `@supabase/ssr`, a
  direct Postgres connection string, Prisma, and the MCP server. You also pasted the project URL
  and publishable key.
- **Decision:** Accepted (your choices, 2026-11-04):
  - **App data access:** supabase-js `2.118.0` with `@supabase/ssr` `0.12.7`, pinned exactly.
    Requests run as the signed-in user, so RLS applies. **No Prisma and no direct Postgres
    connection:** both connect as the `postgres` superuser (bypassing RLS), need the database
    password in the app, and would add a second data path.
  - **Supabase MCP server** (`.mcp.json`): project-scoped, `read_only=true`, features `docs,
database, debugging, development`, following Supabase's MCP security guidance. Schema
    changes still go through migration files.
  - **Agent skills:** `supabase` and `supabase-postgres-best-practices`, reviewed before use.
  - Session refresh runs in `src/proxy.ts` with `getClaims()`, following Supabase's SSR guide and
    the installed `@supabase/ssr` types.
- **Date:** 2026-11-04

## D-018 — Database privileges convention

- **Context:** Writing the first migration (P2.4), three things came up. Supabase's changelog
  says new `public` tables are no longer exposed to the Data API automatically (all projects
  since 2026-10-30). The local CLI still defaults to auto-expose. The best-practices skill warns
  that `SECURITY DEFINER` functions in `public` can be executed by every role.
- **Decision:** Accepted (follows the Supabase skills; applied in P2.4).
  - Every migration starts with `revoke all … from anon, authenticated, service_role`, then
    grants only what its RLS policies allow. Local `auto_expose_new_tables = false` matches
    hosted.
  - Helper functions live in an unexposed `private` schema, with `set search_path = ''` and
    `execute` revoked from all API roles. `security definer` is used only when required (the
    sign-up trigger).
  - Every migration is verified locally (structure, behaviour with two users, and
    `supabase db advisors`) before it is committed.
- **Date:** 2026-11-04

## D-019 — Sign-in methods

- **Context:** P2.6, replacing D-007. A code at every sign-in means one email per sign-in. The
  hosted project has no custom SMTP yet, and the free tiers you would use (Resend, Mailtrap)
  cap monthly volume at a few thousand. Supabase's built-in sender only delivers to project
  team members, at 2 emails an hour. Since 2026-06-03, new Free projects on it also cannot edit
  their email templates (Supabase changelog).
- **Decision:** Accepted (your answers, 2026-11-04).
  1. **Email and password**, confirmed with a typed **6-digit code**, not a link. Mobile links
     can open in the browser instead of the installed app (the D-007 reason). Email goes out
     only to confirm a new account and to reset a password, never at each sign-in. Minimum
     password length is 8.
  2. **Google** (OAuth, PKCE, via an `/auth/callback` route).
  3. **Apple later**, as a backlog item. It needs a paid Apple Developer account, Apple
     requires a new secret every 6 months, and Apple sends no name in the web flow (Supabase
     docs).
  4. The emailed one-time code for sign-in is **dropped**.
- **Hosted setup this needs (P2.10):**
  - a custom SMTP provider;
  - "Confirm email" on;
  - the Confirm signup and Reset password templates showing `{{ .Token }}` (the code);
  - an email code length of 6;
  - a minimum password length of 8;
  - the Google provider configured;
  - Site URL and redirect URLs.
- **Open:** sign-in from inside the installed PWA (OAuth redirects) is not covered by the docs.
  Test it on Android and iOS in P2.6c. **Update 2026-11-04:** you tested Google sign-in from the
  installed app on Android and reported it works. iOS is still untested.
- **Date:** 2026-11-04

## D-020 — Email on the live site

- **Context:** P2.10. You chose Mailtrap (free: 4,000 emails a month, 150 a day, one domain).
  Mailtrap's docs say you cannot send without a domain you own and verify through DNS (4 CNAME
  records and 1 TXT). `m1ndspace.vercel.app` cannot be verified. Mailtrap's demo domain only
  sends to the address the Mailtrap account was registered with. Supabase's built-in sender only
  reaches team members.
- **Decision:** Accepted (your choice, 2026-11-04): **Google only on the live site for now.**
  Email sign-up and password reset stay in the app and keep working locally through Mailpit. They
  are not used on the live site until a domain is bought and verified in Mailtrap.
- **UI (your request, 2026-11-04):** email sign-in is **hidden everywhere**, behind
  `emailSignInEnabled = false` in `src/lib/features.ts`:
  - sign-in shows only "Continue with Google", the auth screens show the app icon as the logo,
    and a note explains the early stage;
  - `/sign-up` and `/forgot-password` redirect to sign-in, and `/reset-password` redirects to
    Home.
  - The UI is not the lock. The Supabase Auth API is public, so the hosted **Email provider is
    turned off** in the dashboard too.
- **Consequence:** the hosted email setup moves from P2.10 to **P6.10**, before the private beta:
  - a domain;
  - the Mailtrap sending domain and SMTP in Supabase;
  - Confirm email on;
  - the Confirm signup and Reset password templates showing `{{ .Token }}`;
  - an email code length of 6;
  - a minimum password length of 8.
- **Date:** 2026-11-04

## D-021 — End-to-end encryption

- **Context:** your requirement (2026-11-04): thoughts must stay private even from whoever runs
  the database, because people may write very personal things. RLS keeps users apart, but it
  does not stop the operator. Locally, `postgres` and `service_role` have `rolbypassrls`, and
  `supabase_admin` is a superuser, so a project owner can read every row in the dashboard. Spec
  §14: "Privacy must be part of the architecture from the beginning."
- **Decision:** Accepted (your choice, 2026-11-04): **end-to-end encryption from the start.**
  Every free-text field a person writes is encrypted in their browser before it is sent:
  thought titles and contents, category names, and later task text and reflections. The server
  stores and returns only ciphertext.
- **Design** (sources: the OWASP Password Storage Cheat Sheet, MDN Web Crypto, the W3C
  WebCrypto spec):
  - **Data key:** a random 256-bit AES-GCM key per person, created in the browser.
  - **Passphrase key:** PBKDF2-HMAC-SHA256, **600,000 iterations** (OWASP), with a random salt
    of at least 16 bytes (MDN). It wraps the data key with AES-KW. OWASP prefers Argon2id, but
    Web Crypto does not offer it, and PBKDF2 avoids a third-party crypto library.
  - **Recovery code:** 128 random bits, shown once. It wraps a second copy of the data key. If
    the passphrase is lost, the recovery code sets a new one, and no thought needs re-encrypting.
  - **Each field:** AES-GCM with a fresh random 96-bit IV per encryption (MDN: "never reuse an
    IV with the same key"), a 128-bit tag, and additional data
    `mindspace:v1:<table>.<column>:<user id>`, so a ciphertext cannot be moved to another field
    or person. Stored as `v1.<IV base64>.<ciphertext base64>`.
  - **Stored server-side** (`user_keys`, own row, RLS): the salts, iterations, both wrapped data
    keys and a version. Never the passphrase, the recovery code or the raw key.
  - **On the device:** you chose "once per device". After unlocking, the data key is kept in
    IndexedDB as a **non-extractable** `CryptoKey` (MDN: `CryptoKey` can be stored there) until
    sign-out.
  - **Passphrase:** you chose **at least 12 characters**. A few words works well.
  - **Unlock once, for the whole app** (your call, 2026-11-04): right after sign-in, a lock
    screen asks for the passphrase (or sets one up the first time) before any page opens. It
    is not asked per module. Sign-out forgets the key on this device.
  - **Recovery codes work once** (your call, 2026-11-04): a recovery replaces both wrapped
    copies in one update, with the new passphrase and a new recovery code, which is shown once.
    The data key never changes, so nothing is re-encrypted. Replacing the data key itself would
    mean re-encrypting everything; that is only for a suspected compromise, and not planned.
  - The P3.2 domain rules run in the browser before encryption. The server checks only the
    ciphertext format and maximum size. Search runs on the device. Category-name uniqueness is
    checked on the device too, because the server can't compare ciphertexts.
- **Still visible to the operator:**
  - the account email;
  - ids, timestamps and statuses;
  - which category a thought is in, but not the category's name;
  - ciphertext sizes, which roughly reveal text length.
- **Limits, honestly:**
  - It protects against database access, the operator and leaked backups.
  - It does not protect against a compromised device, a malicious browser extension, or a
    tampered version of the app's own code. That is the limit of encryption in any web app.
  - Losing **both** the passphrase and the recovery code means those thoughts cannot be
    recovered by anyone.
  - Future AI features could only use text a person explicitly shares from their device.
- **Date:** 2026-11-04
- **Verified (P3.3, 2026-11-04):**
  - Vitest runs the real module with 600,000 iterations: round trips, unique IVs (500/500),
    and the exact maximum size (53,376 for 10,000 emoji).
  - Moved, tampered and malformed ciphertext is rejected, and so is a wrong key, passphrase or
    recovery code. Unlocked keys are non-extractable, and NFC passphrases match.
  - In Chrome on `localhost` (a secure context), a non-extractable key stored in IndexedDB reads
    back as `extractable: false`, `exportKey` and `wrapKey` are refused (`InvalidAccessError`),
    and it still decrypts. PBKDF2 at 600,000 iterations took 378 ms on the desktop; phones are
    measured on the live site after the P3.4 deploy.
- **Verified (P3.4, 2026-11-04, local, in Chrome):**
  - Unlocking and a wrong passphrase send nothing to the server.
  - A recovery sends one request with only the two wrapped keys, never the passphrase or a
    code. Afterwards the old passphrase and the old code are refused, and the new ones work.
  - The lock screen covers every signed-in page; after one unlock, navigation and reloads
    don't ask again.
  - Sign-out, from Settings or the lock screen, empties the device-key store.

## D-022 — Palette retune: one hue family per theme

- **Context:** In Checkpoint A, a thought box inside Home's card blended into the card, and you
  asked for the right shades. The inventory (a local page, `docs/colours.html`, kept out of git)
  showed four problems:
  - dark mode used `#354f52` for five surface jobs;
  - the dark layers were only 1.12–1.26:1 apart;
  - light cards were 1.05:1 against the page;
  - the hues swung from 128° to 232° (OKLCH).
- **Decision:** Accepted, your proposal made in that page on 2026-11-05. Values and
  reasons are in DESIGN.md §2.
  - Your greens stay; light `primary` is nudged to `#4e756b`.
  - Every text check passes except the Delete button inside the dark dialog (3.51:1, P6.4).
    Fixed in P6.4 (D-024).
- **System bars:** they stay always dark (D-016), now in the new dark page colour `#25353b`.
  - **Following the theme:** your notes proposed letting the status bar follow the theme, and
    fixing both bars to `#25353b` if Android's bottom bar won't follow. The 2026-11-03 test on
    Android 17 (D-014) already showed that the bottom bar takes the install-time manifest
    colour, so the fallback applies.
  - **iOS:** the notes also suggested `black-translucent` for iOS. Sources say it makes the
    status-bar text white even over a light page, so it isn't used. iOS is still untested.
- **Date:** 2026-11-05

## D-023 — Service worker and updates

- **Context:** P6.2 (spec §10): an offline page instead of a browser error, and your request on
  2026-11-06 that a new deploy reaches the installed app without reinstalling.
- **Options:**
  - **A hand-written worker** (Next.js PWA guide).
  - **Serwist (`@serwist/turbopack` 9.5.13):** it adds esbuild, `@swc/core` and a second zod,
    and its Next.js 16 example runs `serwist@preview` (10.0.0-preview). Its strength,
    precaching every built file, isn't needed while pages and data stay online-only.
- **Decision:** Accepted, the hand-written worker (your choice, 2026-11-10).
  - **Served at `/sw.js`:** a static Route Handler (`src/app/sw.js/`) prepends the version
    (`appVersion` in `src/lib/app-version.ts`: `VERCEL_DEPLOYMENT_ID`, or `"local"`). Each
    deploy is therefore a new worker. It is registered with `updateViaCache: "none"`, in
    production builds only.
  - **What it stores:** only `/offline` and the assets that page links to, in a cache named
    after the version. It never stores pages, page data or Supabase responses (D-021,
    ARCHITECTURE §9).
  - **Updates:** a new worker skips waiting, claims open pages, deletes older caches, and
    sends its version to each page.
    - A page with an older version offers Refresh. It never reloads itself.
    - Pages are always fetched from the network, so a page opened after a deploy is already
      current and gets no prompt.
  - **Version skew:** Next.js 16.4.5 already reloads on the next navigation when the build
    differs (`fetch-server-response.js`).
    - Vercel Skew Protection would also keep an outdated page's saves working. Vercel lists it
      for Pro and Enterprise only, and the project is on Hobby (D-009). So `deploymentId` is
      not set.
    - Such a save fails with Next's `UnrecognizedActionError`, which now gets a calm message
      (`errorMessage`).
  - **Connection status:** `navigator.onLine` events, not Next's experimental `useOffline`.
    That flag would hold every save until the connection returns, a change for every form.
- **Needs on Vercel:** "Automatically expose System Environment Variables" must stay on. If it
  is off, `VERCEL_DEPLOYMENT_ID` is missing, the version stays `"local"`, and updates are
  never offered. Check: the first line of the live `/sw.js` names a `dpl_…` ID.
- **Date:** 2026-11-10

## D-024 — Accessibility fixes (contrast, focus, motion)

- **Context:** the P6.4 review (WCAG 2.x AA) recomputed every token pair from `globals.css`.
  Three things you use failed:
  - **field outlines** at 1.3–2.3:1, where 1.4.11 needs 3:1 to see where a field is;
  - **the focus ring's 50% halo** at 2.0–2.8:1. On a green button it is the only focus cue;
  - **the dark Delete button** at 3.5–3.8:1, where 1.4.3 needs 4.5:1.
- **Decision:** Accepted, your choices on 2026-11-10 (the recommended option each time):
  - **Outline only:** a new `input-border` token (`#838f8e` / `#909c9a`). The field tint
    (`input`) is unchanged.
  - **A solid focus ring** in the same green, everywhere. That includes the Delete button,
    which used a faint red ring before.
  - **A paler dark coral** `#f6cbc4` with a 10% tint, 20% on hover. Light mode is unchanged.
  - **Also, with no visual choice involved:**
    - a `prefers-reduced-motion` rule;
    - the theme buttons wrap at narrow widths.
- **Known and accepted:**
  - the Delete hover tint (4.0–4.4:1, mouse only);
  - decorative card and separator lines below 3:1.
  - Avoid dark `primary` text on dialogs and sheets (4.26:1).
- **Date:** 2026-11-10

## D-025 — Data export and account deletion

- **Context:** P6.5, spec §14: "Clear account deletion and data export procedures" and "No
  service-role keys in frontend code".
- **Options for deleting:**
  - **Supabase's admin API** (`auth.admin.deleteUser`), which "Requires a `service_role`
    key" and "should only be called on a server";
  - a `security definer` database function, which Supabase doesn't document for deleting
    users.
- **Decision:** Accepted, your choices on 2026-11-10.
  - **Delete with the admin API.**
    - A new server-only `SUPABASE_SECRET_KEY` (`sb_secret_…`) is read only when an account is
      deleted (`src/infrastructure/config/secret-env.ts`). The app runs without it.
    - It is used only by `createSupabaseAdminClient` (`persistSession: false`) through the
      `AccountAdmin` port.
    - Supabase's default hard delete removes the `auth.users` row and its sessions. Every
      user table follows through `on delete cascade` (pgTAP-guarded).
    - The deleted user's access token stays valid until it expires (Supabase docs). So the
      server signs out right after: supabase-js ignores the "user not found" reply and still
      clears the cookies. The browser then forgets its device key.
  - **Confirm by typing "delete"** (any case), checked in the dialog and again in the Server
    Action.
  - **Export decrypted on the device:** the server returns ciphertext only, and the browser
    decrypts it and downloads readable JSON.
    - It has the profile, categories, thoughts, tasks, reminders and check-ins, without
      `user_keys`.
    - The file is not encrypted, and Settings says so.
- **Needs on Vercel:** `SUPABASE_SECRET_KEY`, type Secret, from Supabase → Project Settings →
  API Keys.
- **Date:** 2026-11-10

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
