-- Daily Mind Clarity check-ins (P5.2, spec §4.6 and §4.7). Every answer and the written priority
-- are encrypted in the browser (D-021), so those columns hold only ciphertext, in the same format
-- and size rule as thoughts and tasks (DATA_MODEL.md: max = 20 + 4 * ceil((4 * characters + 16)
-- / 3)). The date and the priority task stay readable, so today's check-in can be found and the
-- task linked. Every answer is optional: null means skipped.

create table public.daily_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  -- The user's own calendar day.
  checkin_date date not null,
  -- Each answer: 2,000 characters before encryption (Q-7).
  occupying_mind_ciphertext text check (
    occupying_mind_ciphertext is null
    or (
      char_length(occupying_mind_ciphertext) <= 10708
      and occupying_mind_ciphertext ~ '^v1\.[A-Za-z0-9+/]{16}\.([A-Za-z0-9+/]{4})+([A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$'
    )
  ),
  worries_ciphertext text check (
    worries_ciphertext is null
    or (
      char_length(worries_ciphertext) <= 10708
      and worries_ciphertext ~ '^v1\.[A-Za-z0-9+/]{16}\.([A-Za-z0-9+/]{4})+([A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$'
    )
  ),
  can_control_ciphertext text check (
    can_control_ciphertext is null
    or (
      char_length(can_control_ciphertext) <= 10708
      and can_control_ciphertext ~ '^v1\.[A-Za-z0-9+/]{16}\.([A-Za-z0-9+/]{4})+([A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$'
    )
  ),
  can_wait_ciphertext text check (
    can_wait_ciphertext is null
    or (
      char_length(can_wait_ciphertext) <= 10708
      and can_wait_ciphertext ~ '^v1\.[A-Za-z0-9+/]{16}\.([A-Za-z0-9+/]{4})+([A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$'
    )
  ),
  small_helpful_thing_ciphertext text check (
    small_helpful_thing_ciphertext is null
    or (
      char_length(small_helpful_thing_ciphertext) <= 10708
      and small_helpful_thing_ciphertext ~ '^v1\.[A-Za-z0-9+/]{16}\.([A-Za-z0-9+/]{4})+([A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$'
    )
  ),
  priority_task_id uuid,
  -- 500 characters before encryption, like a task title.
  priority_text_ciphertext text check (
    priority_text_ciphertext is null
    or (
      char_length(priority_text_ciphertext) <= 2708
      and priority_text_ciphertext ~ '^v1\.[A-Za-z0-9+/]{16}\.([A-Za-z0-9+/]{4})+([A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$'
    )
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- One check-in per user per day. Its index also serves "today's check-in" and the list by date.
  constraint daily_checkins_user_id_checkin_date_key unique (user_id, checkin_date),
  -- The day's priority is a task or written text, never both.
  constraint daily_checkins_one_priority check (
    num_nonnulls(priority_task_id, priority_text_ciphertext) <= 1
  ),
  -- Foreign-key checks bypass RLS, so the owner is part of the key: a check-in can only point at
  -- a task with the same user_id. Deleting the task clears only priority_task_id.
  constraint daily_checkins_priority_task_fk foreign key (priority_task_id, user_id)
    references public.tasks (id, user_id)
    on delete set null (priority_task_id)
);

-- The whole foreign key, for task deletes.
create index daily_checkins_priority_task_id_user_id_idx
  on public.daily_checkins (priority_task_id, user_id);

create trigger daily_checkins_set_updated_at
  before update on public.daily_checkins
  for each row execute function private.set_updated_at();

-- D-018: no automatic API exposure; grant only what the policies allow. No delete: no Phase 5
-- feature removes a check-in, and deleting the account removes them all.
revoke all on public.daily_checkins from anon, authenticated, service_role;
grant select, insert, update on public.daily_checkins to authenticated;

alter table public.daily_checkins enable row level security;

create policy "Users can view their own check-ins"
  on public.daily_checkins for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own check-ins"
  on public.daily_checkins for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own check-ins"
  on public.daily_checkins for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
