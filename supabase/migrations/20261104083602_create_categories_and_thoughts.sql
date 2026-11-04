-- Brain Dump (P3.5). Free text is encrypted in the browser (D-021), so these columns hold only
-- ciphertext: "v1.<12-byte IV, 16 base64 chars>.<AES-GCM ciphertext and tag, base64>". The
-- database checks that format and the maximum size; the character limits themselves are
-- enforced on the device (DATA_MODEL.md: max = 20 + 4 * ceil((4 * characters + 16) / 3)).

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  -- 50 characters before encryption. Uniqueness (any case) is checked on the device.
  name_ciphertext text not null check (
    char_length(name_ciphertext) <= 308
    and name_ciphertext ~ '^v1\.[A-Za-z0-9+/]{16}\.([A-Za-z0-9+/]{4})+([A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$'
  ),
  created_at timestamptz not null default now(),
  -- Lets thoughts reference a category together with its owner (composite ownership FK).
  constraint categories_id_user_id_key unique (id, user_id)
);

create index categories_user_id_idx on public.categories (user_id);

create table public.thoughts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  -- 200 characters before encryption; a blank title is stored as null.
  title_ciphertext text check (
    title_ciphertext is null
    or (
      char_length(title_ciphertext) <= 1108
      and title_ciphertext ~ '^v1\.[A-Za-z0-9+/]{16}\.([A-Za-z0-9+/]{4})+([A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$'
    )
  ),
  -- 10,000 characters before encryption (Q-1).
  content_ciphertext text not null check (
    char_length(content_ciphertext) <= 53376
    and content_ciphertext ~ '^v1\.[A-Za-z0-9+/]{16}\.([A-Za-z0-9+/]{4})+([A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$'
  ),
  category_id uuid,
  status text not null default 'inbox' check (status in ('inbox', 'parked', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint thoughts_id_user_id_key unique (id, user_id),
  -- Foreign-key checks bypass RLS, so the owner is part of the key: a thought can only point at
  -- a category with the same user_id. Deleting the category clears only category_id.
  constraint thoughts_category_fk foreign key (category_id, user_id)
    references public.categories (id, user_id)
    on delete set null (category_id)
);

-- Newest first, overall and per status; and the whole foreign key, for category deletes.
create index thoughts_user_id_created_at_idx on public.thoughts (user_id, created_at desc);
create index thoughts_user_id_status_created_at_idx on public.thoughts (user_id, status, created_at desc);
create index thoughts_category_id_user_id_idx on public.thoughts (category_id, user_id);

create trigger thoughts_set_updated_at
  before update on public.thoughts
  for each row execute function private.set_updated_at();

-- D-018: no automatic API exposure; grant only what the policies allow.
revoke all on public.categories from anon, authenticated, service_role;
grant select, insert, update, delete on public.categories to authenticated;
revoke all on public.thoughts from anon, authenticated, service_role;
grant select, insert, update, delete on public.thoughts to authenticated;

alter table public.categories enable row level security;
alter table public.thoughts enable row level security;

create policy "Users can view their own categories"
  on public.categories for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own categories"
  on public.categories for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own categories"
  on public.categories for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own categories"
  on public.categories for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can view their own thoughts"
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
