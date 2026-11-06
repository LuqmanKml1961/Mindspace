# Mindspace — Data Model

> Status: **Draft.** Each table is finalised when its migration is written (phase noted). After
> a migration, update the table's status here and regenerate the TypeScript types with
> `pnpm db:types`. The migrations in `supabase/migrations/` are the source of truth once they
> exist.

## 1. Tables

| Table              | Phase | Status                                                                         | Purpose                                       |
| ------------------ | ----- | ------------------------------------------------------------------------------ | --------------------------------------------- |
| `profiles`         | 2     | **Migrated** (`20261104020325_create_profiles.sql`)                            | Per-user preferences (timezone, display name) |
| `user_keys`        | 3     | **Migrated** (`20261104065744_create_user_keys.sql`)                           | Wrapped encryption keys (D-021)               |
| `categories`       | 3     | **Migrated** (`20261104083602_create_categories_and_thoughts.sql`; hosted too) | User-owned thought categories (encrypted)     |
| `thoughts`         | 3     | **Migrated** (same migration)                                                  | Brain dumps and parked thoughts (encrypted)   |
| `tasks`            | 4     | Draft                                                                          | Tasks with due date and priority (encrypted)  |
| `reminders`        | 4     | Draft                                                                          | In-app reminders attached to tasks (D-008)    |
| `daily_checkins`   | 5     | Draft                                                                          | Daily Mind Clarity reflections (encrypted)    |
| `voice_recordings` | 7+    | Deferred                                                                       | Recording metadata and transcripts (post-MVP) |

"(encrypted)" means the table's free-text columns are encrypted (D-021). Its ids, dates, statuses
and other non-text columns stay readable. Deferred voice transcripts are free text too, so they
will be encrypted when that phase is planned.

Common rules:

- Every user-owned row has `user_id uuid not null references auth.users(id) on delete cascade`.
  Deleting the account removes the data.
- Timestamps are `timestamptz` (UTC). "Today" is computed in `profiles.timezone`.
- Tables that have `updated_at` use a shared `set_updated_at()` BEFORE UPDATE trigger.
- **Free text a person writes is encrypted on the device (D-021)** and stored as
  `*_ciphertext` columns. Its character limits are enforced by the domain rules in the browser,
  and the database checks the ciphertext format and maximum size. Lengths count characters
  (code points), as Postgres `char_length` does: `"😀"` is 1, so the domain uses
  `characterCount()`, not `.length`. The domain trims text before encrypting.
- Plaintext columns that are not personal writing (for example `profiles.timezone`) keep plain
  `check` constraints.
- Parents that other user-owned tables point at get `unique (id, user_id)`, so children can use
  composite ownership FKs (ARCHITECTURE.md §7).

### profiles (Phase 2)

| Column         | Type        | Notes                                                                                                                                                                                                                                                                 |
| -------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`           | uuid PK     | `references auth.users(id) on delete cascade`                                                                                                                                                                                                                         |
| `display_name` | text null   | optional; `check (char_length(btrim(display_name)) between 1 and 100)`                                                                                                                                                                                                |
| `timezone`     | text        | not null, default `'UTC'`, `check (char_length(timezone) between 1 and 64)`. The device zone is saved once, automatically, while the profile is unchanged since sign-up (Q-5, P4.2); Settings changes it. Validated and canonicalised by `toTimezone()` in the domain |
| `created_at`   | timestamptz | not null, default `now()`                                                                                                                                                                                                                                             |
| `updated_at`   | timestamptz | not null, default `now()`; kept current by `private.set_updated_at()`                                                                                                                                                                                                 |

The row is created by the `private.handle_new_user()` trigger (AFTER INSERT ON `auth.users`,
`security definer`, `set search_path = ''`). RLS allows select and update only where
`id = (select auth.uid())`. There is no insert or delete policy: rows are created by the trigger
and removed by the cascade. **Grants:** `authenticated` has `select, update`; `anon` and
`service_role` have nothing.

**"Unchanged since sign-up" (P4.2):** sign-up sets `created_at` and `updated_at` to the same
`now()`, and the trigger moves `updated_at` on every save. The profile repository maps
`updated_at = created_at` to `changedSinceSignUp: false`. No column is needed, and a test in
`profiles_rls_test.sql` guards the assumption.

Verified locally on 2026-11-04 through the real Auth and REST APIs, with two users: the
sign-up trigger creates the profile; each user sees only their own row; cross-user updates
change 0 rows; reassigning `id` gives 403; anonymous access gives 401/42501; direct insert
gives 403; `updated_at` moves; deleting the auth user cascades. `supabase db advisors` reported
no issues. The same behaviour is now covered permanently by
`supabase/tests/profiles_rls_test.sql` (P2.8).

### user_keys (Phase 3, D-021)

One row per person: everything needed to unlock their data key, but never the key itself.

| Column                     | Type        | Notes                                                       |
| -------------------------- | ----------- | ----------------------------------------------------------- |
| `user_id`                  | uuid PK     | `references auth.users(id) on delete cascade`               |
| `version`                  | smallint    | encryption scheme version, `1`                              |
| `passphrase_salt`          | text        | base64, 16 random bytes                                     |
| `passphrase_iterations`    | integer     | PBKDF2-SHA256 iterations, `600000` (OWASP)                  |
| `passphrase_wrapped_key`   | text        | the data key wrapped (AES-KW) by the passphrase key, base64 |
| `recovery_salt`            | text        | base64, 16 random bytes                                     |
| `recovery_iterations`      | integer     | PBKDF2-SHA256 iterations for the recovery copy, `600000`    |
| `recovery_wrapped_key`     | text        | the data key wrapped by the recovery-code key, base64       |
| `created_at`, `updated_at` | timestamptz |                                                             |

RLS: select, insert and update your own row only. There is **no delete grant**: losing the
wrapped keys would make every encrypted thought unreadable, and the row goes with the account
by cascade.

**Checks:**

- `version = 1`;
- iterations `>= 600000`;
- salts `^[A-Za-z0-9+/]{22}==$` (16 bytes);
- wrapped keys `^[A-Za-z0-9+/]{54}==$` (AES-KW of a 32-byte key is 40 bytes).

These lengths were measured with Web Crypto. A recovery rewrites only this row: both wrapped
copies are replaced in one update, with the new passphrase and a new recovery code, so each code
works once. Thoughts are never re-encrypted.

**Verified on 2026-11-04:** 13 pgTAP tests (`supabase/tests/user_keys_rls_test.sql`). A
sabotaged copy failed exactly the 7 targeted tests, and the advisors were clean.

### categories (Phase 3)

| Column            | Type        | Notes                                                                 |
| ----------------- | ----------- | --------------------------------------------------------------------- |
| `id`              | uuid PK     | `default gen_random_uuid()`                                           |
| `user_id`         | uuid        | owner                                                                 |
| `name_ciphertext` | text        | encrypted name (1–50 characters before encryption); at most 308 chars |
| `created_at`      | timestamptz | default `now()`                                                       |

`unique (id, user_id)`; index `(user_id)`. **Name uniqueness (any case) is checked on the device**, because the
server sees only ciphertext. Nothing is seeded. The UI offers the spec's names and creates a
category only when one is chosen:

- **§4.1 examples:** Work, Personal, Learning, Communication.
- **§4.2 Thought Parking:** Random thoughts, Ideas, Things to investigate, Things to remember,
  Future plans.

They live in `src/components/thoughts/category-suggestions.ts`. This list was corrected on
2026-11-04 (P3.10): the earlier draft paraphrased the spec.

### thoughts (Phase 3)

| Column               | Type        | Notes                                                                                      |
| -------------------- | ----------- | ------------------------------------------------------------------------------------------ |
| `id`                 | uuid PK     | `default gen_random_uuid()`                                                                |
| `user_id`            | uuid        | owner                                                                                      |
| `title_ciphertext`   | text null   | encrypted title (1–200 characters before encryption; blank → null); at most 1,108 chars    |
| `content_ciphertext` | text        | encrypted content (1–10,000 characters before encryption, Q-1); at most 53,376 chars       |
| `category_id`        | uuid null   | FK `(category_id, user_id)` → `categories(id, user_id)` `on delete set null (category_id)` |
| `status`             | text        | not null, default `'inbox'`, `check (status in ('inbox','parked','archived'))`             |
| `created_at`         | timestamptz | default `now()`                                                                            |
| `updated_at`         | timestamptz | default `now()`                                                                            |

Indexes: `(user_id, created_at desc)`; `(user_id, status, created_at desc)`, so a status view is
already newest first; and `(category_id, user_id)`, which covers the whole foreign key for category
deletes (the advisors flagged `(category_id)` alone). `unique (id, user_id)`.
**Search runs on the device**, over decrypted text (P3.11, `thoughtMatches`). The server cannot
search ciphertext, and the search text is never sent, not even in the URL.

**Paging past the row cap:** the Data API returns at most 1,000 rows per request (`max_rows` in
`config.toml`; the hosted limit may differ). The thought repository's `list` therefore asks
with `count: "exact"` and keeps requesting from where the last page ended until it has the total,
ordered by `created_at desc, id`.

**Verified on 2026-11-05:** 1,050 thoughts for one user, read as that user. A plain request
returns 1,000. `list` returns all 1,050, unique and newest first, and the status filter pages
too (105 / 945). Turning paging off fails the check.

**`listNewest(userId, filter, limit)`** (P3.13, Home) returns the newest `limit` rows and the
total that match, in one request (`count: "exact"` and `.range(0, limit - 1)`), with the same
filter and order as `list`. **Verified on 2026-11-05:** 5 inbox and 2 parked thoughts → 1
request, total 5, the 3 newest inbox ids in order; an empty status gives total 0. Ignoring the
filter fails the check.

**Ciphertext format and limits (D-021):** `v1.<IV base64, 16 chars>.<ciphertext base64>`. The
maximum is computed from the character limit at 4 UTF-8 bytes per character, plus the 16-byte
GCM tag: `3 + 16 + 1 + 4·⌈(4·chars + 16)/3⌉`. That gives 53,376 for content, 1,108 for a title
and 308 for a category name. The database checks the format pattern and these maximums. The
character limits themselves are enforced on the device by the P3.2 domain rules.

Each ciphertext is bound (as AES-GCM additional data) to its owner and field. The field names
are `thoughts.title`, `thoughts.content` and `categories.name`
(`src/application/thoughts/`). The browser decrypts with the signed-in user's id, so a record
moved to another field or person won't open. Category names are compared after NFC
normalisation and lower-casing (`isSameCategoryName`).

The Server Actions' Zod schemas (`src/application/thoughts/schemas.ts`) use the same pattern
and maximums, from `src/application/encryption/ciphertext.ts`.

The format check is
`^v1\.[A-Za-z0-9+/]{16}\.([A-Za-z0-9+/]{4})+([A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$`.

**Verified on 2026-11-04 (P3.5):**

- **The pattern matches real Web Crypto output.** 180 ciphertexts were tested: 1–60 characters
  of ASCII, accented letters and emoji, covering every padding case. 10,000, 200 and 50 emoji
  produce exactly 53,376, 1,108 and 308 characters. Plaintext, a wrong version, an empty body
  and a trailing newline are all rejected.
- **pgTAP:** 13 tests for categories and 20 for thoughts (57 in total).
- **Sabotage:** 13 sabotaged copies each failed a named test. They covered the composite FK, the
  content, title and name checks, every UPDATE and DELETE policy, the SELECT policy, an anon
  grant and the trigger.
- **Advisors and diff:** the advisors show only "unused index" on the new, empty tables.
  `db diff` against a fresh replay of the migrations finds no changes.

### tasks (Phase 4)

| Column              | Type             | Notes                                                                                                |
| ------------------- | ---------------- | ---------------------------------------------------------------------------------------------------- |
| `id`                | uuid PK          |                                                                                                      |
| `user_id`           | uuid             | owner                                                                                                |
| `title_ciphertext`  | text             | encrypted title (1–500 characters before encryption); at most 2,708 chars                            |
| `notes_ciphertext`  | text null        | encrypted notes (blank → null; up to 10,000 characters, Q-6 → at most 53,376 chars)                  |
| `due_date`          | date null        | the user's local date                                                                                |
| `due_time`          | time null        | `check (due_time is null or due_date is not null)`                                                   |
| `priority`          | text             | not null, default `'normal'`, `check (priority in ('low','normal','high'))`                          |
| `completed_at`      | timestamptz null | null means open                                                                                      |
| `source_thought_id` | uuid null        | FK `(source_thought_id, user_id)` → `thoughts(id, user_id)` `on delete set null (source_thought_id)` |
| `created_at`        | timestamptz      |                                                                                                      |
| `updated_at`        | timestamptz      |                                                                                                      |

Index: `(user_id, completed_at, due_date)`. `unique (id, user_id)`. The title and notes are
encrypted (D-021). The due date, time, priority and completion stay readable, so the Today,
Upcoming and Completed views (P4.5) can be queried and sorted.

**Built in P4.3** (`20261105080758_create_tasks_and_reminders.sql`):

- Named constraints: `tasks_time_needs_date`, `tasks_id_user_id_key` and
  `tasks_source_thought_fk`.
- The ciphertext checks use the thoughts format: title ≤ 2,708, notes ≤ 53,376.
- A second index, `(source_thought_id, user_id)`, serves thought deletes.
- `updated_at` is kept by `private.set_updated_at()`.
- **Grants:** `authenticated` has `select, insert, update, delete`; `anon` and `service_role` have
  nothing. There are four own-row policies.
- `supabase/tests/tasks_rls_test.sql` has 22 checks.

### reminders (Phase 4)

| Column         | Type             | Notes                                                              |
| -------------- | ---------------- | ------------------------------------------------------------------ |
| `id`           | uuid PK          |                                                                    |
| `user_id`      | uuid             | owner                                                              |
| `task_id`      | uuid             | FK `(task_id, user_id)` → `tasks(id, user_id)` `on delete cascade` |
| `remind_at`    | timestamptz      |                                                                    |
| `dismissed_at` | timestamptz null |                                                                    |
| `created_at`   | timestamptz      |                                                                    |

Partial index: `(user_id, remind_at) where dismissed_at is null`.

**Built in P4.3** (same migration):

- Constraint `reminders_task_fk`, plus an index on `(task_id, user_id)` for task deletes.
- Deleting an account removes reminders through their tasks (indexed). The direct `user_id`
  cascade finds the partial index instead, which is fine at this size.
- **Grants:** `authenticated` has `select, insert, update` and **no delete**. Reminders are
  dismissed (D-008) and go with their task. `anon` and `service_role` have nothing. There are
  three own-row policies.
- `supabase/tests/reminders_rls_test.sql` has 12 checks.

### daily_checkins (Phase 5)

Every prompt is optional (spec §4.6). Every answer is free text, so each is encrypted (D-021) and
null when skipped.

- **Limits (Q-7, settled):** each answer is up to 2,000 characters, so at most 10,708 characters
  of ciphertext. A written priority is up to 500, like a task title, so at most 2,708.
- **The priority is a task or written text, never both.** P5.2 checks this with
  `num_nonnulls(priority_task_id, priority_text_ciphertext) <= 1`. A change always sets both
  columns, so the rule never depends on what is saved.
- **The domain is built (P5.1):** `src/domain/check-ins/`.

| Column                           | Type        | Notes                                                                                           |
| -------------------------------- | ----------- | ----------------------------------------------------------------------------------------------- |
| `id`                             | uuid PK     |                                                                                                 |
| `user_id`                        | uuid        | owner                                                                                           |
| `checkin_date`                   | date        | the user's local date; `unique (user_id, checkin_date)`                                         |
| `occupying_mind_ciphertext`      | text null   | "What is occupying your mind?"                                                                  |
| `worries_ciphertext`             | text null   | "What are you worried about?"                                                                   |
| `can_control_ciphertext`         | text null   | "What can you control?"                                                                         |
| `can_wait_ciphertext`            | text null   | "What can wait until tomorrow?"                                                                 |
| `small_helpful_thing_ciphertext` | text null   | "What is one small thing that would help?"                                                      |
| `priority_task_id`               | uuid null   | FK `(priority_task_id, user_id)` → `tasks(id, user_id)` `on delete set null (priority_task_id)` |
| `priority_text_ciphertext`       | text null   | a free-text priority when it is not a task                                                      |
| `created_at`                     | timestamptz |                                                                                                 |
| `updated_at`                     | timestamptz |                                                                                                 |

## 2. RLS template (applies to every user-owned table)

**Grants first.** Since 2026-10-30, Supabase no longer exposes new `public` tables to the Data API
automatically (changelog: "Tables not exposed to Data and GraphQL API automatically"). Locally,
`auto_expose_new_tables = false` in `supabase/config.toml` matches that. Every migration states
its privileges explicitly, granting only the operations the policies allow:

```sql
revoke all on public.thoughts from anon, authenticated, service_role;
grant select, insert, update, delete on public.thoughts to authenticated;
```

**Helper functions** go in the unexposed `private` schema with `set search_path = ''`, and
`execute` revoked from `public, anon, authenticated, service_role`. Use `security definer` only
when a function must bypass RLS, and then give it an explicit `auth.uid()` check.

```sql
alter table public.thoughts enable row level security;

create policy "Users can read their own thoughts"
  on public.thoughts for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own thoughts"
  on public.thoughts for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own thoughts"
  on public.thoughts for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own thoughts"
  on public.thoughts for delete to authenticated
  using ((select auth.uid()) = user_id);
```

This is the spec §9 template. `auth.uid()` is wrapped in `(select …)` so Postgres evaluates it
once per query instead of once per row, which Supabase recommends for RLS performance.

## 3. Composite ownership FK pattern

```sql
-- parent
alter table public.thoughts add constraint thoughts_id_user_id_key unique (id, user_id);

-- child
alter table public.tasks
  add constraint tasks_source_thought_fk
  foreign key (source_thought_id, user_id)
  references public.thoughts (id, user_id)
  on delete set null (source_thought_id);
```

`set null (column_list)` needs PostgreSQL 15+. Local and hosted both run 17.11 (checked
2026-11-04). Without the column list, Postgres would also null `user_id`, which
violates `not null`.

## 4. RLS tests (pgTAP, `supabase/tests/`)

One file per table, `supabase/tests/<table>_rls_test.sql` (create it with
`pnpm supabase test new <table>_rls --template pgtap`). Run them with `pnpm db:test`. Use
`supabase/tests/profiles_rls_test.sql` as the pattern. It needs no helper packages, and each of
the following was checked against the local database on 2026-11-04:

- `supabase test db` installs pgTAP for the run and removes it afterwards, so the test files do
  not create the extension.
- The file wraps everything in `begin; select plan(n); … select * from finish(); rollback;`, so
  nothing it creates is kept.
- To create test users, `insert into auth.users (id, email)`. `id` is the only required column
  without a default. The sign-up trigger then creates their profiles.
- To act as a user, run `set local role authenticated;`, then
  `select set_config('request.jwt.claims', '{"sub":"<uuid>","role":"authenticated"}', true);`.
  `auth.uid()` reads `sub` from that setting. To act as a signed-out visitor, use
  `set local role anon` with `{"role":"anon"}`. `reset role` returns to `postgres`.

For every table, with two test users A and B:

- A can insert, select, update and delete A's rows.
- A cannot select, update or delete B's rows (selects return zero rows; writes affect zero rows).
- A cannot insert a row with `user_id = B`.
- A cannot point a foreign key at B's row (the composite FK rejects it).
- An anonymous user sees nothing.

**Test each policy on its own (learned in P3.5).**

- When an UPDATE or DELETE has a `WHERE` or `RETURNING` that reads columns, Postgres applies
  the SELECT policy too. A test like `update … where id = <B's row>` therefore passes even if
  the UPDATE policy is broken.
- To guard B's rows, run the statement as A **without** `WHERE` or `RETURNING`, then
  `reset role` and check that B's row is unchanged.
- Wrap the unfiltered UPDATE in `lives_ok`, so a policy that reaches B's row fails as a named
  test.
- All four test files use this form. `profiles` and `user_keys` were converted on 2026-11-05.
  Breaking each UPDATE policy (`using (true)`) then failed their "B unchanged" checks.
- A check that runs as `postgres` (after `reset role`) sees every row, including the real data
  of your local account. Limit it to the test users (`where user_id in (A, B)`), or it fails as
  soon as the local database has data.

## 5. Open questions

| ID  | Question                                                          | Proposed answer                                                                                                                                                                      | Settle by |
| --- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------- |
| Q-1 | Maximum length for thought content?                               | **Settled 2026-11-04: 10,000 characters** (your go). Titles: 200                                                                                                                     | P3.2      |
| Q-2 | What happens to a thought once it is converted into a task?       | **Settled 2026-11-05: archive it** (your choice). It moves to `archived` and stays linked through `tasks.source_thought_id`, so it leaves the inbox but is never lost. Built in P4.7 | P4.7      |
| Q-3 | Can a thought have more than one category or tag?                 | One category for the MVP. Tags only if real use shows the need                                                                                                                       | P3.3      |
| Q-4 | Can a reminder exist without a task?                              | **Settled 2026-11-05: no** (D-008). A standalone reminder is a task with a reminder                                                                                                  | P4.1      |
| Q-5 | Should `profiles.timezone` be set automatically at first sign-in? | **Settled 2026-11-05: yes** (your choice). Save the device zone once while the profile is still on `UTC`; Settings still changes it. Built in P4.2                                   | P4.1      |
| Q-6 | Maximum length for task notes?                                    | **Settled 2026-11-05: 10,000 characters** (your choice), the same as a thought, so a converted thought's text fits                                                                   | P4.1      |
| Q-7 | Maximum length for each check-in answer?                          | **Settled 2026-11-06: 2,000 characters** (your choice). A written priority is up to 500, the same as a task title (your choice)                                                      | P5.1      |
