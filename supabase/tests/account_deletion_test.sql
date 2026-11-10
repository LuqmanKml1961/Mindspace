begin;
select plan(7);

-- P6.5: deleting a person's sign-in record (auth.admin.deleteUser removes their auth.users row)
-- removes every row they own, and nobody else's. User A is 1111…, user B is 2222…. Each owns a
-- row in every user table, linked the way the app links them. Ciphertext is
-- 'v1.' || 16-char IV || '.' || base64.
insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'a@example.test'),
  ('22222222-2222-2222-2222-222222222222', 'b@example.test');

-- The sign-up trigger has created both profiles.
insert into public.user_keys (user_id, passphrase_salt, passphrase_iterations, passphrase_wrapped_key, recovery_salt, recovery_iterations, recovery_wrapped_key)
select id, repeat('A', 22) || '==', 600000, repeat('A', 54) || '==', repeat('A', 22) || '==', 600000, repeat('A', 54) || '=='
from auth.users
where id in ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');

insert into public.categories (id, user_id, name_ciphertext) values
  ('aaaaaaaa-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'v1.' || repeat('A', 16) || '.' || repeat('A', 24)),
  ('bbbbbbbb-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'v1.' || repeat('B', 16) || '.' || repeat('B', 24));

insert into public.thoughts (id, user_id, content_ciphertext, category_id) values
  ('aaaaaaaa-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'v1.' || repeat('A', 16) || '.' || repeat('A', 24), 'aaaaaaaa-0000-0000-0000-000000000001'),
  ('bbbbbbbb-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'v1.' || repeat('B', 16) || '.' || repeat('B', 24), 'bbbbbbbb-0000-0000-0000-000000000001');

insert into public.tasks (id, user_id, title_ciphertext, source_thought_id) values
  ('aaaaaaaa-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'v1.' || repeat('A', 16) || '.' || repeat('A', 24), 'aaaaaaaa-0000-0000-0000-000000000002'),
  ('bbbbbbbb-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', 'v1.' || repeat('B', 16) || '.' || repeat('B', 24), 'bbbbbbbb-0000-0000-0000-000000000002');

insert into public.reminders (user_id, task_id, remind_at) values
  ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-0000-0000-0000-000000000003', '2026-11-11 09:00+00'),
  ('22222222-2222-2222-2222-222222222222', 'bbbbbbbb-0000-0000-0000-000000000003', '2026-11-11 09:00+00');

insert into public.daily_checkins (user_id, checkin_date, priority_task_id) values
  ('11111111-1111-1111-1111-111111111111', '2026-11-10', 'aaaaaaaa-0000-0000-0000-000000000003'),
  ('22222222-2222-2222-2222-222222222222', '2026-11-10', 'bbbbbbbb-0000-0000-0000-000000000003');

-- Guards for later tables: each one a user owns rows in must cascade, and be listed here.
select is(
  (select count(*)::int from pg_constraint
   where contype = 'f' and confrelid = 'auth.users'::regclass
     and connamespace = 'public'::regnamespace and confdeltype <> 'c'),
  0,
  'Every link from a public table to auth.users is on delete cascade'
);

select set_eq(
  $$ select relname::text from pg_constraint join pg_class on pg_class.oid = conrelid
     where contype = 'f' and confrelid = 'auth.users'::regclass
       and connamespace = 'public'::regnamespace $$,
  $$ values ('profiles'), ('user_keys'), ('categories'), ('thoughts'), ('tasks'),
            ('reminders'), ('daily_checkins') $$,
  'These are all the tables a user owns rows in (add a new one to this test)'
);

select set_eq(
  $$ select 'profiles', count(*)::int from public.profiles where id = '11111111-1111-1111-1111-111111111111'
     union all select 'user_keys', count(*)::int from public.user_keys where user_id = '11111111-1111-1111-1111-111111111111'
     union all select 'categories', count(*)::int from public.categories where user_id = '11111111-1111-1111-1111-111111111111'
     union all select 'thoughts', count(*)::int from public.thoughts where user_id = '11111111-1111-1111-1111-111111111111'
     union all select 'tasks', count(*)::int from public.tasks where user_id = '11111111-1111-1111-1111-111111111111'
     union all select 'reminders', count(*)::int from public.reminders where user_id = '11111111-1111-1111-1111-111111111111'
     union all select 'daily_checkins', count(*)::int from public.daily_checkins where user_id = '11111111-1111-1111-1111-111111111111' $$,
  $$ values ('profiles', 1), ('user_keys', 1), ('categories', 1), ('thoughts', 1),
            ('tasks', 1), ('reminders', 1), ('daily_checkins', 1) $$,
  'Before: A owns a row in every table'
);

select lives_ok(
  $$ delete from auth.users where id = '11111111-1111-1111-1111-111111111111' $$,
  'A''s sign-in record can be deleted while they still own rows'
);

select is(
  (select count(*)::int from auth.users where id = '11111111-1111-1111-1111-111111111111'),
  0,
  'A''s sign-in record is gone'
);

select set_eq(
  $$ select 'profiles', count(*)::int from public.profiles where id = '11111111-1111-1111-1111-111111111111'
     union all select 'user_keys', count(*)::int from public.user_keys where user_id = '11111111-1111-1111-1111-111111111111'
     union all select 'categories', count(*)::int from public.categories where user_id = '11111111-1111-1111-1111-111111111111'
     union all select 'thoughts', count(*)::int from public.thoughts where user_id = '11111111-1111-1111-1111-111111111111'
     union all select 'tasks', count(*)::int from public.tasks where user_id = '11111111-1111-1111-1111-111111111111'
     union all select 'reminders', count(*)::int from public.reminders where user_id = '11111111-1111-1111-1111-111111111111'
     union all select 'daily_checkins', count(*)::int from public.daily_checkins where user_id = '11111111-1111-1111-1111-111111111111' $$,
  $$ values ('profiles', 0), ('user_keys', 0), ('categories', 0), ('thoughts', 0),
            ('tasks', 0), ('reminders', 0), ('daily_checkins', 0) $$,
  'After: none of A''s rows are left, in any table'
);

select set_eq(
  $$ select 'profiles', count(*)::int from public.profiles where id = '22222222-2222-2222-2222-222222222222'
     union all select 'user_keys', count(*)::int from public.user_keys where user_id = '22222222-2222-2222-2222-222222222222'
     union all select 'categories', count(*)::int from public.categories where user_id = '22222222-2222-2222-2222-222222222222'
     union all select 'thoughts', count(*)::int from public.thoughts where user_id = '22222222-2222-2222-2222-222222222222' and category_id is not null
     union all select 'tasks', count(*)::int from public.tasks where user_id = '22222222-2222-2222-2222-222222222222' and source_thought_id is not null
     union all select 'reminders', count(*)::int from public.reminders where user_id = '22222222-2222-2222-2222-222222222222'
     union all select 'daily_checkins', count(*)::int from public.daily_checkins where user_id = '22222222-2222-2222-2222-222222222222' and priority_task_id is not null $$,
  $$ values ('profiles', 1), ('user_keys', 1), ('categories', 1), ('thoughts', 1),
            ('tasks', 1), ('reminders', 1), ('daily_checkins', 1) $$,
  'B''s rows, and the links between them, are untouched'
);

select * from finish();
rollback;
