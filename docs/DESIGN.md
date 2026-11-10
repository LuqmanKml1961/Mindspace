# Mindspace — Design

The visual and verbal design system. Sources: spec §3 (principles) and §6 (UX and visual
direction), D-002 (minimalist, calm, modern; follow system light/dark), D-012 (shadcn/ui with Base
UI and the Maia style), and the palette you chose on 2026-11-03.

The tokens live in `src/app/globals.css` (`:root` for light, `.dark` for dark). This file explains
them. **Change values there, then update this file and re-check contrast.**

## 1. Palette

| Name            | Hex       | Character                                                                     |
| --------------- | --------- | ----------------------------------------------------------------------------- |
| Ash Grey        | `#cad2c5` | Earthy green-grey; subtle, understated                                        |
| Muted Teal      | `#84a98c` | Soft blue-green; quiet freshness                                              |
| Deep Teal       | `#52796f` | Calm ocean and forest blend; the main accent                                  |
| Dark Slate Grey | `#354f52` | Dark, cool; mature                                                            |
| Charcoal Blue   | `#2f3e46` | Deep navy-steel; text in light (the dark canvas is a deeper shade, `#25353b`) |

The hex values are used as given (the shadcn skill's rule: keep hex when hex is given). One
exception since 2026-11-05: light `primary` is Deep Teal nudged to `#4e756b`, which has the same
OKLCH hue (177°) and chroma, 1.4 points darker, so links pass on the tinted page.

## 2. Token mapping

**Retuned on 2026-11-05** (D-022). You made the change in a local colour page,
`docs/colours.html`, which is kept out of git. It lists every slot, what it paints, and the
contrast checks, with a live preview.

The old values swung between hues (OKLCH): the dark page was slate blue (232°), the dark card
teal (205°), and the light greys yellow-green (128–138°). Each theme now keeps one family:

- **Light:** the greys carry a faint sage tint (151–161°). Cards stay white.
- **Dark:** the surfaces drift from slate at the bottom to teal at the top:
  - navigation `#1e2c32` (226°);
  - page `#25353b` (223°);
  - card `#32494e` (213°);
  - dialog `#385053` (206°);
  - hover `#3f585a` (202°).
- The five jobs that shared `#354f52` in dark mode now each have their own shade: the card, the
  dialog, the category badge, the phone tab pill, and the current page in the navigation.

| Token                          | Light                                                    | Dark                            |
| ------------------------------ | -------------------------------------------------------- | ------------------------------- |
| `background`                   | `#f2f6f3`                                                | `#25353b`                       |
| `foreground`                   | `#2f3e46` Charcoal Blue                                  | `#e6ece3`                       |
| `card`                         | `#ffffff`                                                | `#32494e`                       |
| `popover`                      | `#ffffff`                                                | `#385053`                       |
| `card-` / `popover-foreground` | `#2f3e46` Charcoal Blue                                  | `#e6ece3` (as `foreground`)     |
| `primary`                      | `#4e756b` Deep Teal, nudged                              | `#98c0a2`                       |
| `primary-foreground`           | `#ffffff`                                                | `#1c252a`                       |
| `secondary`                    | `#d3e3d6`                                                | `#456256`                       |
| `secondary-foreground`         | `#2f3e46` Charcoal Blue                                  | `#e6ece3` (as `foreground`)     |
| `muted`                        | `#e6ede8`                                                | `#3f585a`                       |
| `muted-foreground`             | `#4d6668`                                                | `#beccc0`                       |
| `accent`                       | `#d4e9dd`                                                | `#3a5c4f`                       |
| `accent-foreground`            | `#2f3e46` Charcoal Blue                                  | `#e6ece3` (as `foreground`)     |
| `destructive`                  | `#a8463a` **added** soft terracotta (not in the palette) | `#f6cbc4` (P6.4; was `#f2b9b0`) |
| `border`                       | `#d5ddd7`                                                | `#4e5e61`                       |
| `input` (field tint)           | `#c5cfc7`                                                | `#5b6b6d`                       |
| `input-border` **added P6.4**  | `#838f8e` (field outlines, 3:1)                          | `#909c9a`                       |
| `ring` (focus)                 | `#4e756b` (as `primary`)                                 | `#98c0a2` (as `primary`)        |
| `sidebar`                      | `#eaf0ec`                                                | `#1e2c32`                       |
| `sidebar-accent`               | `#d4e9dd` (as `accent`)                                  | `#2e4b49`                       |
| `sidebar-*` (others)           | as the matching main token                               | as the matching main token      |
| `chart-1…5`                    | the five palette colours (unchanged, not used yet)       | unchanged, not used yet         |

- `destructive` is the only colour outside the palette. It is used **only** for deleting, never
  for overdue or "missed" items. Those stay neutral (spec §3: no guilt-based productivity).
- **History:** on 2026-11-04 the dark text was raised to `#e6ece3`, with muted text at `#c3d1c3`,
  after you said it looked dim. On 2026-11-05 the surfaces were retuned as above.

## 3. Contrast (WCAG 2.x)

Rechecked 2026-11-05 after the retune, with the WCAG relative-luminance formula. The method was
validated against known values (21:1 for black on white; `#737373` on white is 4.74:1). The full
list of checks, including see-through fills blended over what sits behind them, is in the local
colour page (`docs/colours.html`, not in git).

| Check                                         | Target | Light (lowest) | Dark (lowest) |
| --------------------------------------------- | ------ | -------------- | ------------- |
| Text pairs (18 per theme, on the colour page) | 4.5:1  | 4.65:1         | 4.57:1        |
| Body text on a card                           | 4.5:1  | 11.06:1        | 7.95:1        |
| Muted text on a card                          | 4.5:1  | 6.15:1         | 5.73:1        |
| Note box (tinted Alert) text                  | 4.5:1  | 9.23:1         | 6.20:1        |
| Error box (tinted Alert) text                 | 4.5:1  | 9.58:1         | 6.55:1        |
| Alert border against the card                 | —      | 1.88:1         | 2.17:1        |
| Focus ring (solid since P6.4), lowest surface | 3:1    | 4.72:1         | 4.26:1        |
| Field outline (`input-border`, P6.4)          | 3:1    | 3.06:1         | 3.04:1        |
| Delete button text (dark fixed in P6.4)       | 4.5:1  | 4.64:1         | 4.77:1        |
| Card / separator `border` (decorative)        | —      | 1.27:1         | 1.41:1        |

**Alerts (2026-11-04):** an Alert used to share the card's colour (1.00:1), so it was
invisible. Its variants now tint the box: `bg-primary/14 border-primary/45` for notes, and
`bg-destructive/10 border-destructive/45` for errors. Text uses `card-foreground` in both, so
the colour comes from the box, not the text. (Red text on the red tint was 3.8:1 in dark mode
before the retune; it is 4.62:1 now.)

**Skeletons (2026-11-04):** `Skeleton` uses `bg-foreground/10` instead of `bg-muted`. In the
old palette, muted was only 1.13:1 against the dark page, so loading blocks were nearly
invisible. The tint is 1.32:1 (dark) and 1.18:1 (light). `src/app/(app)/loading.tsx` shows them
while a page that reads data loads.

**Boxes inside a card (2026-11-05):** a box must not reuse the colour of the card it sits in.
The thought box is an outline `Item` with no fill. Inside Home's card it took the card's colour
(1.00:1). In the old dark palette its border was only 1.12:1, so it disappeared.

- **`ThoughtItem`** now takes the page colour inside a card
  (`in-data-[slot=card]:bg-background`).
  - Dark: 1.33:1 against the card.
  - Light: 1.09:1, plus a border at 1.39:1.
  - Its text stays at 5.64:1 or more.
  - On the page it is unchanged.
- **`Kbd`** uses `bg-foreground/10`, like Skeleton, instead of `bg-muted`.
  - The tint is 1.32:1 (dark) and 1.18:1 (light) against the page.
  - Its text is 5.77:1 and 4.76:1.

**Accessibility fixes (P6.4, 2026-11-10, D-024, your choices).** These were rechecked from
`globals.css` with the same formula.

- **Field outlines:** a new `input-border` token is used by fields, selects, checkboxes, input
  groups and the outline toggle: `#838f8e` light, `#909c9a` dark.
  - It reaches 3.06–3.34:1 (light) and 3.04–4.49:1 (dark) against the page, cards and sheets.
  - The `bg-input/30` tint inside fields is unchanged.
- **Focus ring:** solid `ring-ring` instead of the 50% halo: 4.72–5.15:1 (light), 4.26–6.30:1
  (dark).
  - The Delete button no longer overrides it with a faint red ring.
  - The base outline is `outline-ring`.
- **Dark Delete button:** `destructive` is `#f6cbc4` (was `#f2b9b0`), with a 10% tint (was
  20%) and a 20% hover tint (was 30%).
  - 4.77:1 in dialogs and sheets, 5.21:1 on cards, 6.78:1 on the page.
  - Error boxes keep their text at 6.38:1.
- **Still below 4.5:1, on purpose:**
  - **Delete while a mouse hovers it** (4.0–4.4:1). It's momentary, and phones have no hover.
  - **Dark `primary` text on a dialog or sheet** (4.26:1). No such text exists today; use
    `foreground` there.
- **Card, separator and plain `border` lines** stay below 3:1. They are decoration, not
  controls, so WCAG 1.4.11 doesn't apply.

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
    `<html>` to `light` and the page to the light background, and survives reload. Dark and System
    switch back correctly. No console errors.
  - The status and Android navigation bars are **always the dark page colour**, whatever the
    theme (D-016, §7a), so they need no syncing with the choice.
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
  - **The three buttons wrap** onto a second line when they can't fit (`flex-wrap`, P6.4).
    At 320px wide, the width of 400% zoom, they used to push Settings into sideways scrolling.
- **Reduced motion (P6.4):** with `prefers-reduced-motion: reduce`, a rule in `globals.css`
  cuts every animation and transition to 0.01ms. Dialogs, sheets and toasts appear in place, and
  skeletons and spinners stop moving.

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
- **Brain Dump views (P3.9):** Inbox, Parked and Archived are links. The current one uses the
  `default` (primary) button style with `aria-current="page"`, the others `ghost`. Primary
  matches the pressed toggles.
- **Thought review (P5.6):** `/thoughts/review`, with a Breadcrumb (Brain Dump › Review), "Review
  your inbox", and "One thought at a time, oldest first. Skip anything you're not ready to
  decide."
  - **Ways in:** an outline "Review one by one" button beside the views on the Inbox, and a "Your
    inbox" Card on Mind Clarity ("N thoughts waiting · no rush"), hidden when the inbox is empty.
  - **The thought:** one Card per thought. It reads "N waiting", then the heading "What would you
    like to do with this thought?" (focused after each choice). The thought sits in a bordered
    box on the page colour: title, text (scrolls past 40svh), when it was captured, and its
    category Badge.
  - **The choices:**
    - **Park**, **Make it a task** (the P4.7 sheet, which stays in the review) and **Archive**
      are all outline, so none is nudged;
    - **Delete** is destructive, with the usual confirmation;
    - **Skip for now** and **Stop for now** are ghost.
  - **Toasts:** "Parked for later." and "Archived." offer **Undo**, which puts the thought back
    in the inbox, and it comes up again.
  - **The end:** an Empty, "That's everything in your inbox for now." with how many skipped
    thoughts still wait (or "Your inbox is clear."), and **Back to Brain Dump**.
- **Lists of linked items:** a `<ul>` of `<li>`, each holding an `Item` with
  `render={<Link />}`. `ItemGroup` sets `role="list"`, but its children would be links, not list
  items, which isn't valid ARIA.
- **Delete confirmation:** `AlertDialog` with `size="sm"`. Focus starts on the safe choice
  ("Keep it"), and the confirm button is `variant="destructive"`. The copy is honest and calm:
  "It will be gone for good, on every device."
- **shadcn CLI caution:** adding `alert-dialog`, `item`, `toast` or `sheet` wants to overwrite
  `button.tsx` (dropping the 40px heights) and, for some, `separator.tsx`. Restore both from git
  after adding.
- **Feedback (toasts, after Checkpoint A):** the shadcn `toast` (Base UI 1.9.0), mounted once in
  the root layout.
  - **Success** ("Thought saved.", "Changes saved.", "Thought deleted.", "Added "Work".", "Time
    zone saved.") auto-dismisses after 5 s and is announced politely.
  - **Failed actions** stay until closed (`timeout: 0`) and are announced urgently
    (`priority: "high"`). The text is kept.
  - **Field errors** stay inline. The static "Saved." lines were removed.
  - **Notices** (`notify.notice`, the info icon, added in P6.2) stay until they are closed, by
    you or by the app, and are announced politely:
    - "You're offline. You can keep typing, and save once you're connected." It shows on
      signed-in pages, and closes itself when the connection returns, followed by "You're back
      online." (success).
    - "A new version is ready. Refresh once you've saved what you're writing." It comes with a
      **Refresh** action, after a deploy, and only on a page older than the live version.
      Nothing reloads by itself.
  - **A save from a page older than the live deploy** fails with "Mindspace has just been
    updated. Copy your text, refresh the page, then save it again." The text stays in place
    (D-023).
- **Offline page (P6.2):** `/offline` uses the sign-in pages' brand frame and one card:
  "You're offline", "Mindspace needs a connection to open this page. Everything you've saved is
  safe.", and **Try again** (reloads). The service worker shows it at the address you tried, and
  it never claims your data is available offline (spec §10).
  - **Placement:** the viewport sits above the phone tab bar, at
    `bottom-[calc(5rem+env(safe-area-inset-bottom,0px))]`, computed as 80px with a 12px gap above
    the 67px bar. From `md` up it is `bottom-4`. Checked in a 420px frame.
- **shadcn audit (after Checkpoint A, 2026-11-05).** Hand-written markup was swapped for the
  shadcn component that covers it:

  | Where                       | Component                                                                                                                         |
  | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
  | Settings                    | **Card** per section (Appearance, Time zone, Account; Sign out in the footer)                                                     |
  | Home "Your mind, right now" | **Card** (count as the description, "See all" in the footer), **Empty** when the inbox is clear                                   |
  | Tasks, Mind Clarity         | **Empty** ("Coming soon")                                                                                                         |
  | Save shortcut hint          | **Kbd** / **KbdGroup**, in a shared `save-shortcut.tsx` (capture box and editor)                                                  |
  | Search                      | **InputGroup** with a search-icon addon                                                                                           |
  | New category                | **InputGroup** with the Add button inside (`InputGroupButton`), Cancel beside it                                                  |
  | Recovery code               | **InputGroup** with a read-only **InputGroupTextarea** (so the code wraps at its dashes on a phone) and Copy inside (`block-end`) |
  | Thought page                | **Breadcrumb** (Brain Dump › This thought) instead of a back-link button                                                          |
  | Buttons                     | Icons with `data-icon`: Delete (trash), Copy (copy, then a tick), Sign out (log-out); `AlertDialogMedia` on the delete dialog     |
  - **`InputGroup` was set to `h-10`** (the CLI ships `h-9`), so it matches the 40px controls.
    Measured at 40px in Chrome.
  - **Kept on purpose:**
    - **App navigation:** shadcn `Sidebar` gives phones a slide-out sheet, and our bottom tab bar
      (6a) suits a one-handed PWA better.
    - **NativeSelect** for the category picker and filter, which uses the phone's own picker.
    - **Links** for the Brain Dump views (each has a URL; `Tabs` swap panels in place).
  - **Deferred:** **InputOTP** for the 6-digit email code, to P6.10, when email sign-in returns
    and can be tested.

- **Tasks screen (P4.6):**
  - **Views:** links for Today, Upcoming, No date and Completed, like the Brain Dump views; each
    has its own URL (`?view=`).
  - **Quick add:** an **InputGroup** with Add inside. Only the title is needed. The date follows
    the view:
    - Today: today;
    - Upcoming: tomorrow;
    - No date: none;
    - Completed: no quick add.
  - **A task:** a **Checkbox** (complete or reopen) beside an outline **Item** button that opens
    the edit sheet. The due day reads "Today", "Tomorrow" or a short date, with the time if any.
    High and Low show a **Badge**; Normal shows none.
  - **A past due date reads "Waiting since Wed, Nov 4"**, in muted text, never "overdue" in red
    (§8).
  - **Complete:** "Task completed." with an **Undo** action (`notify.success(title, action)`
    uses Base UI's `actionProps`; Undo also closes the toast).
  - **Edit sheet:** **Sheet** on the right, full width on phones. It has the title, notes, a
    native date and time pair (the time is disabled until there is a date; "Clear date" clears
    both), and **ToggleGroup** priority. Save, and Delete with the same confirmation as thoughts.
  - **Home summary (P4.9):**
    - Home reads, top to bottom: **Today's one thing** (P5.5), **Today**, **Upcoming
      reminders**, then "Your mind, right now".
    - **Today's one thing:** the priority chosen at the end of today's check-in.
      - A task shows as the usual task row, linking to Tasks, and shows "Completed …" once it is
        done.
      - Written words show in larger text (`text-xl`).
      - With nothing chosen, it reads "Nothing chosen yet." The footer link reads "Choose it in
        Mind Clarity" or, once chosen, "Change it in Mind Clarity".
      - The Today card stays right below it, so every other task is one tap away (spec §4.7).
    - The Today card lists up to 5 open tasks due today or earlier, with "N tasks for today" and
      "See all N in Tasks" when there are more.
    - Earlier tasks read "Waiting since Wed, Nov 4" in the same muted text as "Today": no red,
      no "overdue".
    - Rows are outline Items on the page colour that link to Tasks. When there's nothing:
      "Nothing for today. Enjoy the space. Tasks are there when you need them."
  - **Reminders (P4.8, D-008, in-app only):**
    - **In the edit sheet:** a "Reminders" field lists the task's reminders, each with Dismiss,
      and a "Remind me at" `datetime-local` picker with Add inside it. The hint reads "Shows on
      Home and Tasks when it's time. No notifications are sent." A time that has already
      passed is allowed, and the hint then reads "That time has passed, so it will show straight
      away." (P4.10).
    - **On Home:** an "Upcoming reminders" Card lists active reminders, soonest first; due ones
      carry a secondary **Now** badge. On Tasks, a "Reminders" Card shows only the due ones.
      Each row is an outline Item on the page colour (the boxes-in-cards rule, §3), with a ghost
      Dismiss.
    - **Times:** shown in the device's time zone ("Today, 6:00 PM", "Tomorrow, 9:00 AM").
    - **Quiet by design:** the cards don't show when empty, and a completed task's reminders
      don't show.
  - **"Make it a task" (P4.7):**
    - an outline button with the Tasks icon, beside Save on the thought page, disabled while
      there are unsaved edits;
    - it opens the same fields in a Sheet, pre-filled from the thought;
    - the sheet's description says what will happen ("…the thought moves to Archived");
    - **Create task** then shows "Task created. The thought is archived." and opens the view
      where the task landed.
  - **Validation (P4.10):** checked as you type, with the domain's own messages under the field
    (`FieldError`, the field marked invalid). Save, Add or Create task stays disabled until it's
    fixed, so nothing typed is lost.
    - **Title:** "Give the task a title." (edit sheet and "Make it a task"; a blank quick add
      only keeps Add disabled) and "Task titles can be up to 500 characters."
    - **Notes:** "Notes can be up to 10,000 characters." replaces "Optional." while it applies.

- **Mind Clarity check-in (P5.4):** each stage is one **Card** on the Mind Clarity page.
  - **Start:** "Today's check-in": "A couple of minutes to notice what's on your mind. Every
    question is optional, and you can stop at any point." and **Start check-in**.
  - **One question per step:**
    - the spec §4.6 prompt as the heading, with "N of 6" in muted text above it (no progress bar,
      no score);
    - a **Textarea** described "Optional. A word is enough.";
    - **Back** and **Finish for now** (ghost) on the left, **Skip for now** (outline) and
      **Next** (primary) on the right.
  - **Saving:**
    - Next, Back and Finish for now save the step's answer if it changed, and a blank one is
      saved as skipped;
    - Skip for now leaves the saved answer as it was;
    - a failed save stays on the step with the text kept.
  - **The last step (spec §4.7):** "What's the one thing you'd like to focus on?" ("Just one.
    Everything else stays where it is.").
    - a **NativeSelect** of today's open tasks, or "Or in your own words" (**Input**);
    - choosing one clears the other;
    - **Finish** (primary).
  - **The recap:** "Today's check-in" with the date, grouped so that what can be acted on now
    stands apart from what can wait:
    - On your mind;
    - Within your control ("What you can act on now.");
    - Can wait ("Until tomorrow, or later.");
    - Today's one thing.

    Skipped questions don't appear. **Edit answers** (or "Continue check-in" when nothing is
    written yet) starts again at question 1 with the answers filled in.

  - **Focus:** each move focuses the new heading, so a screen reader reads the question.
  - **Limits:** inline, as in Tasks: "Answers can be up to 2,000 characters." and "Your
    priority can be up to 500 characters.".

- **Past reflections (P5.7):** `/clarity/past`, from a "Past reflections" link under today's
  check-in.
  - **The page:** a Breadcrumb (Mind Clarity › Past reflections), "Your earlier check-ins,
    newest first."
  - **Each day:** one Card with the date as its heading (`formatDay`) and the same grouping as
    the recap (`CheckInSummary`), with "The one thing".
  - **What's left out:** today's check-in (it's on Mind Clarity), check-ins with nothing written,
    and days without a check-in, so there are no gaps, counts, streaks or "insights".
  - **When there are none:** an Empty, "No past check-ins yet." "Earlier check-ins appear here,
    newest first."

## 6a. App shell and navigation (P1.7)

- `src/components/layout/app-nav.tsx`: a sidebar on desktop (`md` and up, 256px, sticky) and a
  bottom tab bar on mobile. Both use one `navItems` list and `usePathname()`.
- Active item: `aria-current="page"`, plus a visible cue that is not colour alone. The sidebar
  uses an `accent` background; the tab bar uses an `accent` pill behind the icon and `primary`
  text.
- Every nav target is at least 40px tall (sidebar `h-10`, tab bar `min-h-16`). Focus shows the
  same ring as Button (`ring-3 ring-ring`, solid since P6.4).
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
| `theme-color` **`#25353b` always** (D-016)                    | `viewport` in `src/app/layout.tsx`            | The status and browser bars are the dark page colour in both themes, like card-share's always-blue bars                                                     |
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
- **System bars are always the dark page colour, `#25353b` (D-016; Charcoal Blue `#2f3e46`
  before the D-022 retune).** Android paints an installed app's
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
