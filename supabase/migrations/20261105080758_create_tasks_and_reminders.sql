-- Tasks and in-app reminders (P4.3, D-008). Task titles and notes are encrypted in the browser
-- (D-021), so those columns hold only ciphertext, in the same format and size rule as thoughts
-- (DATA_MODEL.md: max = 20 + 4 * ceil((4 * characters + 16) / 3)). Due dates, times, priority
-- and completion stay readable, so the Tasks views can be queried and sorted.

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  -- 500 characters before encryption.
  title_ciphertext text not null check (
    char_length(title_ciphertext) <= 2708
    and title_ciphertext ~ '^v1\.[A-Za-z0-9+/]{16}\.([A-Za-z0-9+/]{4})+([A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$'
  ),
  -- 10,000 characters before encryption (Q-6); blank notes are stored as null.
  notes_ciphertext text check (
    notes_ciphertext is null
    or (
      char_length(notes_ciphertext) <= 53376
      and notes_ciphertext ~ '^v1\.[A-Za-z0-9+/]{16}\.([A-Za-z0-9+/]{4})+([A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$'
    )
  ),
  -- The user's own calendar day and wall-clock time, so neither shifts with time zones.
  due_date date,
  due_time time,
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high')),
  -- null while the task is open.
  completed_at timestamptz,
  source_thought_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tasks_time_needs_date check (due_time is null or due_date is not null),
  -- Lets reminders reference a task together with its owner (composite ownership FK).
  constraint tasks_id_user_id_key unique (id, user_id),
  -- Foreign-key checks bypass RLS, so the owner is part of the key: a task can only point at a
  -- thought with the same user_id. Deleting the thought clears only source_thought_id.
  constraint tasks_source_thought_fk foreign key (source_thought_id, user_id)
    references public.thoughts (id, user_id)
    on delete set null (source_thought_id)
);

-- The views (open by due date, completed by time); and the whole foreign key, for thought deletes.
create index tasks_user_id_completed_at_due_date_idx on public.tasks (user_id, completed_at, due_date);
create index tasks_source_thought_id_user_id_idx on public.tasks (source_thought_id, user_id);

create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function private.set_updated_at();

-- A reminder always belongs to a task (Q-4) and holds no free text.
create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  task_id uuid not null,
  remind_at timestamptz not null,
  -- null until the user dismisses it.
  dismissed_at timestamptz,
  created_at timestamptz not null default now(),
  -- The same owner as its task; deleting the task deletes its reminders.
  constraint reminders_task_fk foreign key (task_id, user_id)
    references public.tasks (id, user_id)
    on delete cascade
);

-- Active reminders, soonest first; and the whole foreign key, for task deletes.
create index reminders_user_id_remind_at_idx on public.reminders (user_id, remind_at)
  where dismissed_at is null;
create index reminders_task_id_user_id_idx on public.reminders (task_id, user_id);

-- D-018: no automatic API exposure; grant only what the policies allow. Reminders are dismissed,
-- never deleted by the user; they go with their task.
revoke all on public.tasks from anon, authenticated, service_role;
grant select, insert, update, delete on public.tasks to authenticated;
revoke all on public.reminders from anon, authenticated, service_role;
grant select, insert, update on public.reminders to authenticated;

alter table public.tasks enable row level security;
alter table public.reminders enable row level security;

create policy "Users can view their own tasks"
  on public.tasks for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own tasks"
  on public.tasks for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own tasks"
  on public.tasks for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own tasks"
  on public.tasks for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can view their own reminders"
  on public.reminders for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own reminders"
  on public.reminders for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own reminders"
  on public.reminders for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
