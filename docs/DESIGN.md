# Mindspace — Design

The visual and verbal design system. Sources: spec §3 (principles) and §6 (UX and visual
direction), D-002 (minimalist, calm, modern; follow system light/dark), D-012 (shadcn/ui with Base
UI and the Maia style), and the palette you chose on 2026-11-03.

The tokens live in `src/app/globals.css` (`:root` for light, `.dark` for dark). This file explains
them. **Change values there, then update this file and re-check contrast.**

## 1. Palette

| Name            | Hex       | Character                                      |
| --------------- | --------- | ---------------------------------------------- |
| Ash Grey        | `#cad2c5` | Earthy green-grey; subtle, understated         |
| Muted Teal      | `#84a98c` | Soft blue-green; quiet freshness               |
| Deep Teal       | `#52796f` | Calm ocean and forest blend; the main accent   |
| Dark Slate Grey | `#354f52` | Dark, cool; mature                             |
| Charcoal Blue   | `#2f3e46` | Deep navy-steel; text in light, canvas in dark |

The hex values are used as given (the shadcn skill's rule: keep hex when hex is given).

## 2. Token mapping

**Derived** means the palette has no colour for that role, so the value was mixed in sRGB
(like CSS `color-mix(in srgb, …)`) from palette colours, white or black.

| Token                          | Light                                                    | Dark                                             |
| ------------------------------ | -------------------------------------------------------- | ------------------------------------------------ |
| `background`                   | `#f9faf8` derived: 12% Ash Grey + white                  | `#2f3e46` Charcoal Blue                          |
| `foreground`                   | `#2f3e46` Charcoal Blue                                  | `#e6ece3` derived: Ash Grey lightened (raised)   |
| `card`, `popover`              | `#ffffff`                                                | `#354f52` Dark Slate Grey                        |
| `card-` / `popover-foreground` | `#2f3e46` Charcoal Blue                                  | `#e6ece3` (as `foreground`)                      |
| `primary`                      | `#52796f` Deep Teal                                      | `#8eb095` derived: Muted Teal + 8% white         |
| `primary-foreground`           | `#ffffff`                                                | `#1c252a` derived: 60% Charcoal Blue + black     |
| `secondary`                    | `#cad2c5` Ash Grey                                       | `#354f52` Dark Slate Grey                        |
| `secondary-foreground`         | `#2f3e46` Charcoal Blue                                  | `#e6ece3` (as `foreground`)                      |
| `muted`                        | `#ecefeb` derived: 35% Ash Grey + white                  | `#32474c` derived: Slate/Charcoal 50/50          |
| `muted-foreground`             | `#354f52` Dark Slate Grey                                | `#c3d1c3` derived: light sage (raised)           |
| `accent`                       | `#e0eae2` derived: 25% Muted Teal + white                | `#354f52` Dark Slate Grey                        |
| `accent-foreground`            | `#2f3e46` Charcoal Blue                                  | `#e6ece3` (as `foreground`)                      |
| `destructive`                  | `#a8463a` **added** soft terracotta (not in the palette) | `#eaaea5` **added**: `#e08a7c` coral + 31% white |
| `border`                       | `#cad2c5` Ash Grey                                       | `#465459` derived: 15% Ash Grey + Charcoal Blue  |
| `input`                        | `#cad2c5` Ash Grey                                       | `#4e5c5f` derived: 20% Ash Grey + Charcoal Blue  |
| `ring` (focus)                 | `#52796f` Deep Teal                                      | `#84a98c` Muted Teal                             |
| `sidebar`                      | `#f2f4f1` derived: 25% Ash Grey + white                  | `#28353c` derived: 85% Charcoal Blue + black     |
| `sidebar-*` (others)           | as the matching main token                               | as the matching main token                       |
| `chart-1…5`                    | the five palette colours                                 | the palette colours that read on Charcoal Blue   |

- `destructive` is the only colour outside the palette. It is used **only** for deleting, never
  for overdue or "missed" items. Those stay neutral (spec §3: no guilt-based productivity).
- The dark `primary` was lifted just enough to pass contrast as text (found by search).
- **Dark text raised on 2026-11-04** (your feedback: text looked dim). The `#cad2c5` text tokens
  are now `#e6ece3`, so body text on a card is 7.31:1 (was 5.66:1). Muted text is `#c3d1c3`,
  5.53:1 on a card (was 4.60:1, the old passing minimum). `destructive` gained 4 points of
  white to reach 4.64:1 on a card (was 4.47:1).

## 3. Contrast (WCAG 2.x)

Checked 2026-11-03 with the WCAG relative-luminance formula. The method was validated against
known values (21:1 for black on white; `#737373` on white is 4.74:1).

| Check                                      | Target | Light (lowest) | Dark (lowest) |
| ------------------------------------------ | ------ | -------------- | ------------- |
| Text pairs (14 per theme, rechecked 11-04) | 4.5:1  | 4.64:1         | 4.63:1        |
| Body text on a card                        | 4.5:1  | 10.57:1 (page) | 7.31:1        |
| Muted text on a card                       | 4.5:1  | 8.78:1         | 5.53:1        |
| Note box (tinted Alert) text               | 4.5:1  | 9.27:1         | 5.94:1        |
| Error box (tinted Alert) text              | 4.5:1  | 9.60:1         | 6.21:1        |
| Alert border against the card              | —      | 1.84:1         | 1.90:1        |
| Focus ring on background                   | 3:1    | 4.64:1         | 4.23:1        |
| Border / input on background               | 3:1    | 1.48:1         | 1.41 / 1.59:1 |

**Alerts (2026-11-04):** an Alert used to share the card's colour (1.00:1), so it was
invisible. Its variants now tint the box: `bg-primary/14 border-primary/45` for notes, and
`bg-destructive/10 border-destructive/45` for errors. Text uses `card-foreground` in both. In
dark mode, red text on the red tint is only 3.8:1, so the colour comes from the box, not the
text.

**Skeletons (2026-11-04):** `Skeleton` uses `bg-foreground/10` instead of `bg-muted`. Muted
is only 1.13:1 against the dark page (1.11:1 light), so loading blocks were nearly invisible.
The tint is 1.31:1 (dark) and 1.19:1 (light). `src/app/(app)/loading.tsx` shows them while a
page that reads data loads.

**Known dark-mode gaps, not visible today:**

- Sage as text on a card is 3.68:1. This is the link-style Button, used only in the hidden email
  code step. Fix it before P6.10 brings that screen back.
- The destructive Button (text on its own 20% tint) is 3.3–4.0:1. No destructive buttons exist
  yet; fix in P6.4.

The border and input lines are decorative and below WCAG 1.4.11's 3:1, like shadcn's defaults.
**Review in P6.4:** confirm that inputs are still identifiable (Maia inputs also have a fill), or
darken `input`.

## 4. Light and dark mode

- `next-themes` 0.4.6 in `src/app/layout.tsx`: `attribute="class"`, `defaultTheme="system"`,
  `enableSystem` and `disableTransitionOnChange`. It sets `.dark` on `<html>` from the system
  setting (D-002). `<html>` carries `suppressHydrationWarning`, as the next-themes README requires.
- Tailwind's `dark:` variant is `@custom-variant dark (&:is(.dark *))`, shadcn's default.
- **Rule:** use semantic tokens (`bg-background`, `text-muted-foreground`, …). Don't add manual
  `dark:` colour overrides (shadcn skill, `rules/styling.md`).
- **Appearance setting (D-015):** Settings → Appearance offers **Light / Dark / System**
  (`src/components/theme/theme-toggle.tsx`), and System is the default. next-themes stores the
  choice in `localStorage` (`theme`), per device.
  - The control renders only after hydration, because the theme is unknown on the server. This
    uses `useSyncExternalStore`, not the README's `useEffect` + `setState`, which the
    eslint-config-next 16 hooks rules reject. A 40px placeholder prevents layout shift.
  - Verified in Chrome on 2026-11-03 (system dark): System is the default. Choosing Light switches
    `<html>` to `light` and the page to `#f9faf8`, and survives reload. Dark and System switch back
    correctly. No console errors.
  - The status and Android navigation bars are **always Charcoal Blue**, whatever the theme
    (D-016, §7a), so they need no syncing with the choice.
  - **Change animation:** the pressed **pill button morphs into a circle** centred on it, which
    grows until it covers the whole screen (450ms, `cubic-bezier(0.4, 0, 0.2, 1)`).
    - History, from your feedback: v1 was a 600ms circle from the button's centre point, "too
      slow, shape doesn't fit the button". v2 was a 400ms rounded box growing from the button,
      "stale, boxy". v3 is the pill-to-circle morph: the corner radius grows with the size, so it
      stays round and fluid.
    - It uses the View Transitions API: `document.startViewTransition` snapshots the page, then
      `clip-path` animates on `::view-transition-new(root)` from
      `inset(<button box> round <its border-radius>)` to
      `inset(<circle box, negative> round <R>)`, where R is the distance from the button centre
      to the farthest viewport corner. Both are `inset()`, so they interpolate smoothly.
      `globals.css` turns off the default cross-fade for the root snapshots.
    - `setTheme` runs inside `flushSync`, because next-themes applies the class in a `useEffect`.
      Without it, the "after" snapshot would still be the old theme.
    - Verified in Chrome: `CSS.supports` accepts negative `inset()` with `round`. The class flips
      inside the transition callback. The start shape equals the Light button's measured box and
      26px radius. The end shape is a true circle (diameter = 2R) centred on the button, with all
      four viewport corners inside it. The animation `playState` is `running`.
    - **No animation (instant switch)** when the browser has no View Transitions, the user has
      `prefers-reduced-motion: reduce`, or the visible theme doesn't change (e.g. Dark → System
      while the system is dark).

## 5. Typography

- **Sans:** Figtree via `next/font` on `--font-sans` (Maia preset). **Mono:** Geist Mono on
  `--font-mono`.
- Use Tailwind's default type scale. Body text is `text-base` (16px). Avoid text below 14px
  (`text-sm`) except captions.
- When a repeated text style appears, add a `type-*` utility (`@utility`). Don't add custom
  `--text-*` keys, because `cn()` treats unknown `text-*` classes as colours (shadcn skill,
  `design-system.md`).

## 6. Spacing, radius and controls

- **Spacing:** Tailwind's 4px scale. Be generous (spec §6): a 16px page gutter on mobile (`px-4`),
  more on desktop. Lay out with `flex`/`grid` and `gap-*`, never `space-x/y-*`.
- **Radius:** Maia's `--radius: 0.625rem` (10px), with the derived `--radius-sm…4xl` steps in
  `globals.css`. Buttons are pills (`rounded-4xl`).
- **Control heights (option B, 2026-11-03):** the default control is **40px** for comfortable touch.

  | Button size        | Height    | Classes               |
  | ------------------ | --------- | --------------------- |
  | `xs`               | 24px      | `h-6`                 |
  | `sm`               | 32px      | `h-8`                 |
  | `default`          | 40px      | `h-10 px-4`           |
  | `lg`               | 44px      | `h-11 px-5`           |
  | `icon` / `icon-lg` | 40 / 44px | `size-10` / `size-11` |

  **Rule:** control heights move together. When adding Input, Select, Textarea, Toggle, Tabs and
  similar components, set their default height to 40px (`h-10`) to match. Check the generated
  classes first; the shadcn skill's `design-system.md` lists where heights live. Done so far:
  `Input` (P2.6a) and `NativeSelect` (P2.9) moved from `h-9` to `h-10`. `NativeSelect` also uses
  `text-base md:text-sm`, like `Input`, so iOS does not zoom when it gets focus.
  - **`Textarea`** (P3.8) is multi-line, so it has no fixed height. It grows with its content
    (`field-sizing-content`) and already uses `text-base md:text-sm`, unchanged from the CLI.
  - The capture box sets `min-h-32 max-h-[60svh]` for layout. Past 60% of the screen height
    it scrolls.

- **Toggle and ToggleGroup** (`src/components/ui/toggle.tsx`, added for D-015) follow the same
  heights: default `h-10` (40px) and `lg` `h-11`. The pressed state was restyled from `bg-muted`
  (about 1.1:1 against the page, nearly invisible) to `bg-primary text-primary-foreground` (about
  4.6:1 in both themes), via `aria-pressed:`. Base UI sets `aria-pressed`/`data-pressed`, not
  Radix's `data-state`, so the `data-[state=on]` class in `toggle-group.tsx` never applies.
- **Links that look like buttons:** use `<Link className={buttonVariants({ … })}>`. Don't use
  Base UI's `<Button nativeButton={false} render={<Link />}>` for navigation. It renders
  `<a role="button">` (verified 2026-11-03), so screen readers announce a button for something
  that navigates.

## 6a. App shell and navigation (P1.7)

- `src/components/layout/app-nav.tsx`: a sidebar on desktop (`md` and up, 256px, sticky) and a
  bottom tab bar on mobile. Both use one `navItems` list and `usePathname()`.
- Active item: `aria-current="page"`, plus a visible cue that is not colour alone. The sidebar
  uses an `accent` background; the tab bar uses an `accent` pill behind the icon and `primary`
  text.
- Every nav target is at least 40px tall (sidebar `h-10`, tab bar `min-h-16`). Focus shows the
  same ring as Button (`ring-3 ring-ring/50`).
- On mobile, `main` has `pb-28` so content clears the fixed tab bar. The tab bar comes after
  `main` in the DOM, so it paints on top without a manual `z-index`.
- The app name and tagline come from `src/lib/site.ts` (D-001: one place to rename).

## 7. Icons

Hugeicons (`@hugeicons/react` with `@hugeicons/core-free-icons`, MIT), from the Maia preset.
Inside a Button, mark icons with `data-icon="inline-start"` or `"inline-end"`. Don't add sizing
classes to icons inside components (shadcn skill, `rules/icons.md`).

**Logo (auth screens, 2026-11-04):** a white house with the sleeping brain on transparency,
from your `House-Shaped Brain Icon.png`. The web copy is `public/brand/mindspace-logo.png`
(192px, shown at 64px), and the master, trimmed to 355×344, is `docs/assets/mindspace-logo.png`.
On the light page a white house nearly disappears, so light mode adds
`drop-shadow-[0_2px_8px_rgb(47_62_70_/_0.3)]` (a Charcoal Blue shadow). Dark mode has none. The
**app icon** (manifest, favicon) is unchanged: still the black tile, with the icon question open.

## 7a. Screen edges and the installed app (D-014)

This fixes the coloured strips at the top and bottom of the screen when the app runs from the home
screen. It follows the approach of the `card-share` reference repo, plus safe areas for our fixed
tab bar.

| Technique                                                     | Where                                         | Why                                                                                                                                                         |
| ------------------------------------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `theme-color` **`#2f3e46` always** (D-016)                    | `viewport` in `src/app/layout.tsx`            | The status and browser bars are Charcoal Blue in both themes, like card-share's always-blue bars                                                            |
| `appleWebApp` (`capable`, title, `statusBarStyle: "default"`) | `metadata` in `src/app/layout.tsx`            | An iOS home-screen launch opens as an app with a solid status bar                                                                                           |
| Web app manifest (`display: "standalone"`, colours, icons)    | `src/app/manifest.ts`                         | The installed app has no browser bars on Android or iOS                                                                                                     |
| `html` and `body` background (`bg-background`)                | `globals.css` base layer                      | Over-scroll and the edges show the app colour                                                                                                               |
| `viewport-fit=cover` plus `env(safe-area-inset-*)`            | `viewport`; `(app)/layout.tsx`; `app-nav.tsx` | Edge to edge. The tab bar sits above the iPhone home bar or Android gesture bar, the page background shows beneath it, and content stays clear of the notch |

- Content padding uses `max(<normal spacing>, env(safe-area-inset-*))`, so it never shrinks the
  normal spacing. `main`'s bottom padding is `calc(7rem + env(safe-area-inset-bottom))`, so content
  clears the tab bar.
- **The tab bar is lifted with `bottom: env(safe-area-inset-bottom, 0px)`, not padded.** Chrome's
  edge-to-edge guide says: "Don't set the `padding` to a safe-area-inset value", because it
  causes layout thrashing and stops the chin sliding away
  (developer.chrome.com/docs/css-ui/edge-to-edge).
- **System bars are always Charcoal Blue `#2f3e46` (D-016).** Android paints an installed app's
  navigation bar from the **manifest** colours, fixed at install, not from the page. It uses
  `theme_color` up to Android 14 and `background_color` behind a transparent bar from Android 15
  (as reported by other projects; Google's docs don't cover it). A manifest can't follow a
  per-theme or manual choice reliably, so both manifest colours and the `theme-color` meta are
  the same dark colour. Both bars are dark in light and dark mode, the card-share approach you
  confirmed on Android. The value lives in `src/lib/theme-colors.ts` (`systemBarColor`).
  - Superseded on 2026-11-03: per-scheme `theme-color`, the manifest's `color_scheme_dark`
    (unconfirmed on Chrome Android), and `ThemeColorSync` (deleted).
  - The light splash screen is gone too: `background_color` is now the dark colour.
  - **iOS unverified:** with `statusBarStyle: "default"`, whether iOS paints the status bar with
    `theme-color` hasn't been tested on an iPhone.
- **App icon:** your "Sleeping Brain House" (a white house with a sleeping brain, on black),
  supplied 2026-11-03. The source image had a white margin around a rounded black square. Phones
  apply their own rounded mask, so the artwork was cut out and placed on a **full-bleed square**
  filled with the image's own near-black (`rgb(6,6,6)`), at the original 53% scale and 6px upward
  offset. The house corners sit at 38% from the centre, inside the 40% maskable safe zone.
  - Master: `docs/assets/mindspace-icon-1024.png`. Regenerate the sizes from it.
  - Generated with sharp as palette PNGs with no alpha channel: `src/app/icon.png` (192, tab
    icon), `src/app/apple-icon.png` (180, iOS), `public/icons/icon-192.png` and `icon-512.png`
    (manifest, also used as maskable).
- After changing any of this on a phone, **remove the home-screen icon and add it again**. The
  home-screen app is configured when it is added.

## 8. Tone of voice

From spec §1, §3 and §6. Mindspace speaks calmly and never judges.

| Do                                                                      | Don't                                  |
| ----------------------------------------------------------------------- | -------------------------------------- |
| "Take a breath." / "You don't have to figure everything out right now." | "You're falling behind!"               |
| "3 thoughts waiting · no rush"                                          | "3 overdue items!" in red              |
| "What's the one thing you'd like to focus on?"                          | Streaks, scores, "you missed a day"    |
| "Skip for now" on every optional step                                   | Required reflection or nagging prompts |
| Neutral, plain words                                                    | Medical or diagnostic claims (spec §1) |

- Show overdue items neutrally (spec §6: avoid making every item look urgent).
- Keep notifications rare and useful (principle 6). The MVP has in-app reminders only (D-008).
