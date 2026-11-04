begin;
select plan(11);

-- User A is 1111…, user B is 2222…; 3333… belongs to nobody.
insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'a@example.test'),
  ('22222222-2222-2222-2222-222222222222', 'b@example.test');

select results_eq(
  $$ select id, timezone from public.profiles
     where id in ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222')
     order by id $$,
  $$ values ('11111111-1111-1111-1111-111111111111'::uuid, 'UTC'),
            ('22222222-2222-2222-2222-222222222222'::uuid, 'UTC') $$,
  'Signing up creates a profile with the default timezone'
);

-- Act as user A.
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);

select results_eq(
  $$ select id from public.profiles $$,
  $$ values ('11111111-1111-1111-1111-111111111111'::uuid) $$,
  'A sees only their own profile'
);

select results_eq(
  $$ update public.profiles set display_name = 'Alex'
     where id = '11111111-1111-1111-1111-111111111111' returning id $$,
  $$ values ('11111111-1111-1111-1111-111111111111'::uuid) $$,
  'A can update their own profile'
);

select is_empty(
  $$ update public.profiles set display_name = 'Taken over'
     where id = '22222222-2222-2222-2222-222222222222' returning id $$,
  'A cannot update B''s profile'
);

select throws_ok(
  $$ update public.profiles set id = '33333333-3333-3333-3333-333333333333'
     where id = '11111111-1111-1111-1111-111111111111' $$,
  '42501',
  'new row violates row-level security policy for table "profiles"',
  'A cannot change the id of their profile'
);

select throws_ok(
  $$ insert into public.profiles (id) values ('33333333-3333-3333-3333-333333333333') $$,
  '42501',
  'permission denied for table profiles',
  'A cannot insert a profile'
);

select throws_ok(
  $$ delete from public.profiles where id = '11111111-1111-1111-1111-111111111111' $$,
  '42501',
  'permission denied for table profiles',
  'A cannot delete a profile'
);

-- Act as user B.
select set_config('request.jwt.claims', '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}', true);

select results_eq(
  $$ select id, display_name from public.profiles $$,
  $$ values ('22222222-2222-2222-2222-222222222222'::uuid, null::text) $$,
  'B sees only their own profile, unchanged by A'
);

-- Act as a signed-out visitor.
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);

select throws_ok(
  $$ select id from public.profiles $$,
  '42501',
  'permission denied for table profiles',
  'A signed-out visitor cannot read profiles'
);

reset role;

-- now() is fixed for the whole transaction, so the trigger must replace the old value with it.
update public.profiles set updated_at = '2000-01-01'
where id = '11111111-1111-1111-1111-111111111111';

select is(
  (select updated_at from public.profiles where id = '11111111-1111-1111-1111-111111111111'),
  now(),
  'Updating a profile refreshes updated_at'
);

delete from auth.users where id = '22222222-2222-2222-2222-222222222222';

select is_empty(
  $$ select 1 from public.profiles where id = '22222222-2222-2222-2222-222222222222' $$,
  'Deleting a user deletes their profile'
);

select * from finish();
rollback;
