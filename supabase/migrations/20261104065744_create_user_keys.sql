-- End-to-end encryption keys (D-021). Each person's data key, wrapped (AES-KW) by a key derived
-- from their passphrase and, separately, from their recovery code. The server never sees the
-- passphrase, the recovery code or the raw data key.

create table public.user_keys (
  user_id uuid primary key references auth.users (id) on delete cascade,
  version smallint not null default 1 check (version = 1),
  -- 16-byte salts are 24 base64 characters; a wrapped 32-byte key is 40 bytes, 56 characters.
  passphrase_salt text not null check (passphrase_salt ~ '^[A-Za-z0-9+/]{22}==$'),
  passphrase_iterations integer not null check (passphrase_iterations >= 600000),
  passphrase_wrapped_key text not null check (passphrase_wrapped_key ~ '^[A-Za-z0-9+/]{54}==$'),
  recovery_salt text not null check (recovery_salt ~ '^[A-Za-z0-9+/]{22}==$'),
  recovery_iterations integer not null check (recovery_iterations >= 600000),
  recovery_wrapped_key text not null check (recovery_wrapped_key ~ '^[A-Za-z0-9+/]{54}==$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger user_keys_set_updated_at
  before update on public.user_keys
  for each row execute function private.set_updated_at();

-- D-018: no automatic API exposure; grant only what the policies allow. No delete: losing the
-- wrapped keys would make every encrypted thought unreadable. Rows go with the account (cascade).
revoke all on public.user_keys from anon, authenticated, service_role;
grant select, insert, update on public.user_keys to authenticated;

alter table public.user_keys enable row level security;

create policy "Users can view their own keys"
  on public.user_keys for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own keys"
  on public.user_keys for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own keys"
  on public.user_keys for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
