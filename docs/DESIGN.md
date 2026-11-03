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
| `foreground`                   | `#2f3e46` Charcoal Blue                                  | `#cad2c5` Ash Grey                               |
| `card`, `popover`              | `#ffffff`                                                | `#354f52` Dark Slate Grey                        |
| `card-` / `popover-foreground` | `#2f3e46` Charcoal Blue                                  | `#cad2c5` Ash Grey                               |
| `primary`                      | `#52796f` Deep Teal                                      | `#8eb095` derived: Muted Teal + 8% white         |
| `primary-foreground`           | `#ffffff`                                                | `#1c252a` derived: 60% Charcoal Blue + black     |
| `secondary`                    | `#cad2c5` Ash Grey                                       | `#354f52` Dark Slate Grey                        |
| `secondary-foreground`         | `#2f3e46` Charcoal Blue                                  | `#cad2c5` Ash Grey                               |
| `muted`                        | `#ecefeb` derived: 35% Ash Grey + white                  | `#32474c` derived: Slate/Charcoal 50/50          |
| `muted-foreground`             | `#354f52` Dark Slate Grey                                | `#adc1ad` derived: 58% Ash Grey + Muted Teal     |
| `accent`                       | `#e0eae2` derived: 25% Muted Teal + white                | `#354f52` Dark Slate Grey                        |
| `accent-foreground`            | `#2f3e46` Charcoal Blue                                  | `#cad2c5` Ash Grey                               |
| `destructive`                  | `#a8463a` **added** soft terracotta (not in the palette) | `#e8aa9f` **added**: `#e08a7c` coral + 27% white |
| `border`                       | `#cad2c5` Ash Grey                                       | `#465459` derived: 15% Ash Grey + Charcoal Blue  |
| `input`                        | `#cad2c5` Ash Grey                                       | `#4e5c5f` derived: 20% Ash Grey + Charcoal Blue  |
| `ring` (focus)                 | `#52796f` Deep Teal                                      | `#84a98c` Muted Teal                             |
| `sidebar`                      | `#f2f4f1` derived: 25% Ash Grey + white                  | `#28353c` derived: 85% Charcoal Blue + black     |
| `sidebar-*` (others)           | as the matching main token                               | as the matching main token                       |
| `chart-1…5`                    | the five palette colours                                 | the palette colours that read on Charcoal Blue   |

- `destructive` is the only colour outside the palette. It is used **only** for deleting, never
  for overdue or "missed" items. Those stay neutral (spec §3: no guilt-based productivity).
- The dark `primary` and dark `muted-foreground` were lifted just enough to pass contrast as text.
  The minimal passing amounts were found by search rather than picked by eye.

## 3. Contrast (WCAG 2.x)

Checked 2026-11-03 with the WCAG relative-luminance formula. The method was validated against
known values (21:1 for black on white; `#737373` on white is 4.74:1).

| Check                                         | Target | Light (lowest) | Dark (lowest) |
| --------------------------------------------- | ------ | -------------- | ------------- |
| All text pairs (14 per theme)                 | 4.5:1  | 4.64:1         | 4.60:1        |
| Destructive text on its own 10% tint (Button) | 4.5:1  | 4.83:1         | 4.65:1        |
| Focus ring on background                      | 3:1    | 4.64:1         | 4.23:1        |
| Border / input on background                  | 3:1    | 1.48:1         | 1.41 / 1.59:1 |

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
- A manual light/dark/system switch in Settings is possible later with `useTheme()`. It is not
  built yet.

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
  classes first; the shadcn skill's `design-system.md` lists where heights live.

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

## 7a. Screen edges and the installed app (D-014)

This fixes the coloured strips at the top and bottom of the screen when the app runs from the home
screen. It follows the approach of the `card-share` reference repo, plus safe areas for our fixed
tab bar.

| Technique                                                     | Where                                         | Why                                                                                                       |
| ------------------------------------------------------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `theme-color` per scheme (`#f9faf8` light, `#2f3e46` dark)    | `viewport` in `src/app/layout.tsx`            | Status and browser bars match the page. **Must equal `--background`.**                                    |
| `appleWebApp` (`capable`, title, `statusBarStyle: "default"`) | `metadata` in `src/app/layout.tsx`            | An iOS home-screen launch opens as an app with a solid status bar                                         |
| Web app manifest (`display: "standalone"`, colours, icons)    | `src/app/manifest.ts`                         | The installed app has no browser bars on Android or iOS                                                   |
| `html` and `body` background (`bg-background`)                | `globals.css` base layer                      | Over-scroll and the edges show the app colour                                                             |
| `viewport-fit=cover` plus `env(safe-area-inset-*)`            | `viewport`; `(app)/layout.tsx`; `app-nav.tsx` | Edge to edge. The tab bar background runs under the iPhone home bar, and content stays clear of the notch |

- Safe-area padding uses `max(<normal spacing>, env(safe-area-inset-*))`, so it never shrinks the
  normal spacing. `main`'s bottom padding is `calc(7rem + env(safe-area-inset-bottom))`, so content
  clears the taller tab bar.
- The `theme-color` meta follows the **system** setting through its media query. If a manual
  light/dark switch is added later, the meta tag must follow it too, because next-themes doesn't
  update it.
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
