# Mindspace — Data Model

> Status: **Draft.** Each table is finalised when its migration is written (phase noted). After
> a migration, update the table's status here and regenerate the TypeScript types with
> `pnpm db:types`. The migrations in `supabase/migrations/` are the source of truth once they
> exist.

## 1. Tables

| Table              | Phase | Status                                              | Purpose                                       |
| ------------------ | ----- | --------------------------------------------------- | --------------------------------------------- |
| `profiles`         | 2     | **Migrated** (`20261104020325_create_profiles.sql`) | Per-user preferences (timezone, display name) |
| `categories`       | 3     | Draft                                               | User-owned thought categories                 |
| `thoughts`         | 3     | Draft                                               | Brain dumps and parked thoughts               |
| `tasks`            | 4     | Draft                                               | Tasks with due date and priority              |
| `reminders`        | 4     | Draft                                               | In-app reminders attached to tasks (D-008)    |
| `daily_checkins`   | 5     | Draft                                               | Daily Mind Clarity reflections                |
| `voice_recordings` | 7+    | Deferred                                            | Recording metadata and transcripts (post-MVP) |

Common rules:

- Every user-owned row has `user_id uuid not null references auth.users(id) on delete cascade`.
  Deleting the account removes the data.
- Timestamps are `timestamptz` (UTC). "Today" is computed in `profiles.timezone`.
- Tables that have `updated_at` use a shared `set_updated_at()` BEFORE UPDATE trigger.
- Length limits are enforced with `check` constraints and mirrored in the domain rules.
- Parents that other user-owned tables point at get `unique (id, user_id)`, so children can use
  composite ownership FKs (ARCHITECTURE.md §7).

### profiles (Phase 2)

| Column         | Type        | Notes                                                                                                                                                                                    |
| -------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`           | uuid PK     | `references auth.users(id) on delete cascade`                                                                                                                                            |
| `display_name` | text null   | optional; `check (char_length(btrim(display_name)) between 1 and 100)`                                                                                                                   |
| `timezone`     | text        | not null, default `'UTC'`, `check (char_length(timezone) between 1 and 64)`. Set from the browser at first sign-in; editable in Settings. The IANA name is validated in the domain layer |
| `created_at`   | timestamptz | not null, default `now()`                                                                                                                                                                |
| `updated_at`   | timestamptz | not null, default `now()`; kept current by `private.set_updated_at()`                                                                                                                    |

The row is created by the `private.handle_new_user()` trigger (AFTER INSERT ON `auth.users`,
`security definer`, `set search_path = ''`). RLS allows select and update only where
`id = (select auth.uid())`. There is no insert or delete policy: rows are created by the trigger
and removed by the cascade. **Grants:** `authenticated` has `select, update`; `anon` and
`service_role` have nothing.

Verified locally on 2026-11-04 through the real Auth and REST APIs, with two users: the
sign-up trigger creates the profile; each user sees only their own row; cross-user updates
change 0 rows; reassigning `id` gives 403; anonymous access gives 401/42501; direct insert
gives 403; `updated_at` moves; deleting the auth user cascades. `supabase db advisors` reported
no issues. Permanent pgTAP tests come in P2.8.

### categories (Phase 3)

| Column       | Type        | Notes                                               |
| ------------ | ----------- | --------------------------------------------------- |
| `id`         | uuid PK     | `default gen_random_uuid()`                         |
| `user_id`    | uuid        | owner                                               |
| `name`       | text        | `check (char_length(btrim(name)) between 1 and 50)` |
| `created_at` | timestamptz | default `now()`                                     |

Unique index on `(user_id, lower(name))`; `unique (id, user_id)`. Nothing is seeded: the UI
offers suggested names (Work, Personal, Ideas, To investigate, To remember, Future plans) and
creates a category the first time it is used.

### thoughts (Phase 3)

| Column        | Type        | Notes                                                                                      |
| ------------- | ----------- | ------------------------------------------------------------------------------------------ |
| `id`          | uuid PK     | `default gen_random_uuid()`                                                                |
| `user_id`     | uuid        | owner                                                                                      |
| `title`       | text null   | optional (spec §9 example); capture does not ask for it                                    |
| `content`     | text        | `check (char_length(btrim(content)) between 1 and 10000)`; limit to confirm                |
| `category_id` | uuid null   | FK `(category_id, user_id)` → `categories(id, user_id)` `on delete set null (category_id)` |
| `status`      | text        | not null, default `'inbox'`, `check (status in ('inbox','parked','archived'))`             |
| `created_at`  | timestamptz | default `now()`                                                                            |
| `updated_at`  | timestamptz | default `now()`                                                                            |

Indexes: `(user_id, created_at desc)` and `(user_id, status)`. `unique (id, user_id)`.
Search starts as a case-insensitive match on `title` and `content`; add full-text search (a
generated `tsvector` with a GIN index) later only if needed.

### tasks (Phase 4)

| Column              | Type             | Notes                                                                                                |
| ------------------- | ---------------- | ---------------------------------------------------------------------------------------------------- |
| `id`                | uuid PK          |                                                                                                      |
| `user_id`           | uuid             | owner                                                                                                |
| `title`             | text             | `check (char_length(btrim(title)) between 1 and 500)`                                                |
| `notes`             | text null        |                                                                                                      |
| `due_date`          | date null        | the user's local date                                                                                |
| `due_time`          | time null        | `check (due_time is null or due_date is not null)`                                                   |
| `priority`          | text             | not null, default `'normal'`, `check (priority in ('low','normal','high'))`                          |
| `completed_at`      | timestamptz null | null means open                                                                                      |
| `source_thought_id` | uuid null        | FK `(source_thought_id, user_id)` → `thoughts(id, user_id)` `on delete set null (source_thought_id)` |
| `created_at`        | timestamptz      |                                                                                                      |
| `updated_at`        | timestamptz      |                                                                                                      |

Index: `(user_id, completed_at, due_date)`. `unique (id, user_id)`.

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

### daily_checkins (Phase 5)

Every prompt is optional (spec §4.6). Free-text columns are limited, e.g. to 2000 characters.

| Column                | Type        | Notes                                                                                           |
| --------------------- | ----------- | ----------------------------------------------------------------------------------------------- |
| `id`                  | uuid PK     |                                                                                                 |
| `user_id`             | uuid        | owner                                                                                           |
| `checkin_date`        | date        | the user's local date; `unique (user_id, checkin_date)`                                         |
| `occupying_mind`      | text null   | "What is occupying your mind?"                                                                  |
| `worries`             | text null   | "What are you worried about?"                                                                   |
| `can_control`         | text null   | "What can you control?"                                                                         |
| `can_wait`            | text null   | "What can wait until tomorrow?"                                                                 |
| `small_helpful_thing` | text null   | "What is one small thing that would help?"                                                      |
| `priority_task_id`    | uuid null   | FK `(priority_task_id, user_id)` → `tasks(id, user_id)` `on delete set null (priority_task_id)` |
| `priority_text`       | text null   | a free-text priority when it is not a task                                                      |
| `created_at`          | timestamptz |                                                                                                 |
| `updated_at`          | timestamptz |                                                                                                 |

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

`set null (column_list)` needs PostgreSQL 15+. Check the Supabase project's Postgres version
before the Phase 3 migration. Without the column list, Postgres would also null `user_id`, which
violates `not null`.

## 4. RLS tests (pgTAP, `supabase/tests/`)

For every table, with two test users A and B:

- A can insert, select, update and delete A's rows.
- A cannot select, update or delete B's rows (selects return zero rows; writes affect zero rows).
- A cannot insert a row with `user_id = B`.
- A cannot point a foreign key at B's row (the composite FK rejects it).
- An anonymous user sees nothing.

## 5. Open questions

| ID  | Question                                                    | Proposed answer                                                                                                     | Settle by |
| --- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | --------- |
| Q-1 | Maximum length for thought content?                         | 10,000 characters                                                                                                   | P3.2      |
| Q-2 | What happens to a thought once it is converted into a task? | It moves to `archived` and stays linked through `tasks.source_thought_id`, so it leaves the inbox but is never lost | P4.7      |
| Q-3 | Can a thought have more than one category or tag?           | One category for the MVP. Tags only if real use shows the need                                                      | P3.3      |
| Q-4 | Can a reminder exist without a task?                        | No. A standalone reminder is a task with a reminder (D-008)                                                         | P4.1      |
