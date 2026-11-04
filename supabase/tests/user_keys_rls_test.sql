begin;
select plan(13);

-- User A is 1111…, user B is 2222…. A well-formed salt is 24 base64 characters, a wrapped key 56.
insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'a@example.test'),
  ('22222222-2222-2222-2222-222222222222', 'b@example.test');

insert into public.user_keys (user_id, passphrase_salt, passphrase_iterations, passphrase_wrapped_key, recovery_salt, recovery_iterations, recovery_wrapped_key)
values ('22222222-2222-2222-2222-222222222222', repeat('B', 22) || '==', 600000, repeat('B', 54) || '==', repeat('B', 22) || '==', 600000, repeat('B', 54) || '==');

-- Act as user A.
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);

select lives_ok(
  $$ insert into public.user_keys (user_id, passphrase_salt, passphrase_iterations, passphrase_wrapped_key, recovery_salt, recovery_iterations, recovery_wrapped_key)
     values ('11111111-1111-1111-1111-111111111111', repeat('A', 22) || '==', 600000, repeat('A', 54) || '==', repeat('A', 22) || '==', 600000, repeat('A', 54) || '==') $$,
  'A can store their own wrapped keys'
);

select results_eq(
  $$ select user_id from public.user_keys $$,
  $$ values ('11111111-1111-1111-1111-111111111111'::uuid) $$,
  'A sees only their own keys'
);

select throws_ok(
  $$ insert into public.user_keys (user_id, passphrase_salt, passphrase_iterations, passphrase_wrapped_key, recovery_salt, recovery_iterations, recovery_wrapped_key)
     values ('33333333-3333-3333-3333-333333333333', repeat('A', 22) || '==', 600000, repeat('A', 54) || '==', repeat('A', 22) || '==', 600000, repeat('A', 54) || '==') $$,
  '42501',
  'new row violates row-level security policy for table "user_keys"',
  'A cannot store keys for someone else'
);

select results_eq(
  $$ update public.user_keys set passphrase_wrapped_key = repeat('C', 54) || '=='
     where user_id = '11111111-1111-1111-1111-111111111111' returning user_id $$,
  $$ values ('11111111-1111-1111-1111-111111111111'::uuid) $$,
  'A can update their own keys (a passphrase change)'
);

select is_empty(
  $$ update public.user_keys set passphrase_wrapped_key = repeat('C', 54) || '=='
     where user_id = '22222222-2222-2222-2222-222222222222' returning user_id $$,
  'A cannot update B''s keys'
);

select throws_ok(
  $$ delete from public.user_keys where user_id = '11111111-1111-1111-1111-111111111111' $$,
  '42501',
  'permission denied for table user_keys',
  'Keys cannot be deleted (that would lose every encrypted thought)'
);

select throws_ok(
  $$ update public.user_keys set passphrase_iterations = 1000
     where user_id = '11111111-1111-1111-1111-111111111111' $$,
  '23514',
  null,
  'Fewer than 600,000 iterations is rejected'
);

select throws_ok(
  $$ update public.user_keys set version = 2
     where user_id = '11111111-1111-1111-1111-111111111111' $$,
  '23514',
  null,
  'An unknown scheme version is rejected'
);

select throws_ok(
  $$ update public.user_keys set passphrase_salt = 'not base64'
     where user_id = '11111111-1111-1111-1111-111111111111' $$,
  '23514',
  null,
  'A malformed salt is rejected'
);

select throws_ok(
  $$ update public.user_keys set recovery_wrapped_key = repeat('A', 40) || '=='
     where user_id = '11111111-1111-1111-1111-111111111111' $$,
  '23514',
  null,
  'A wrapped key of the wrong size is rejected'
);

-- Act as a signed-out visitor.
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);

select throws_ok(
  $$ select user_id from public.user_keys $$,
  '42501',
  'permission denied for table user_keys',
  'A signed-out visitor cannot read keys'
);

reset role;

-- now() is fixed for the whole transaction, so the trigger must replace the old value with it.
update public.user_keys set updated_at = '2000-01-01'
where user_id = '11111111-1111-1111-1111-111111111111';

select is(
  (select updated_at from public.user_keys where user_id = '11111111-1111-1111-1111-111111111111'),
  now(),
  'Updating keys refreshes updated_at'
);

delete from auth.users where id = '11111111-1111-1111-1111-111111111111';

select is_empty(
  $$ select 1 from public.user_keys where user_id = '11111111-1111-1111-1111-111111111111' $$,
  'Deleting a user deletes their keys'
);

select * from finish();
rollback;
