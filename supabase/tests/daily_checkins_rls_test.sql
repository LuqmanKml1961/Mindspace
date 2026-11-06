begin;
select plan(28);

-- User A is 1111…, user B is 2222…. Each has a task; B also has a check-in with a written
-- priority. Ciphertext is 'v1.' || 16-char IV || '.' || base64. The tests that guard B's rows run
-- unfiltered, so only the UPDATE policy decides (DATA_MODEL §4).
insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'a@example.test'),
  ('22222222-2222-2222-2222-222222222222', 'b@example.test');

insert into public.tasks (id, user_id, title_ciphertext) values
  ('aaaaaaaa-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
   'v1.' || repeat('A', 16) || '.' || repeat('A', 24)),
  ('bbbbbbbb-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222',
   'v1.' || repeat('B', 16) || '.' || repeat('B', 24));

insert into public.daily_checkins (id, user_id, checkin_date, priority_text_ciphertext) values
  ('bbbbbbbb-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', '2026-11-05',
   'v1.' || repeat('B', 16) || '.' || repeat('B', 24));

-- Act as user A.
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);

select lives_ok(
  $$ insert into public.daily_checkins (id, user_id, checkin_date, priority_task_id)
     values ('aaaaaaaa-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111',
             '2026-11-06', 'aaaaaaaa-0000-0000-0000-000000000001') $$,
  'A can start a check-in with their own task as the priority'
);

select results_eq(
  $$ select id, checkin_date, priority_task_id, occupying_mind_ciphertext from public.daily_checkins $$,
  $$ values ('aaaaaaaa-0000-0000-0000-000000000002'::uuid, '2026-11-06'::date,
             'aaaaaaaa-0000-0000-0000-000000000001'::uuid, null::text) $$,
  'A sees only their own check-ins, and an answer starts skipped'
);

select throws_ok(
  $$ insert into public.daily_checkins (user_id, checkin_date)
     values ('22222222-2222-2222-2222-222222222222', '2026-11-06') $$,
  '42501',
  'new row violates row-level security policy for table "daily_checkins"',
  'A cannot create a check-in for B'
);

select throws_ok(
  $$ insert into public.daily_checkins (user_id, checkin_date)
     values ('11111111-1111-1111-1111-111111111111', '2026-11-06') $$,
  '23505',
  null,
  'A has at most one check-in per day'
);

select throws_ok(
  $$ insert into public.daily_checkins (user_id, checkin_date, priority_task_id)
     values ('11111111-1111-1111-1111-111111111111', '2026-11-07', 'bbbbbbbb-0000-0000-0000-000000000001') $$,
  '23503',
  null,
  'A cannot make B''s task their priority (composite ownership FK)'
);

select throws_ok(
  $$ update public.daily_checkins set priority_task_id = 'bbbbbbbb-0000-0000-0000-000000000001'
     where id = 'aaaaaaaa-0000-0000-0000-000000000002' $$,
  '23503',
  null,
  'A cannot point their check-in at B''s task'
);

select throws_ok(
  $$ update public.daily_checkins
     set priority_text_ciphertext = 'v1.' || repeat('A', 16) || '.' || repeat('A', 24)
     where id = 'aaaaaaaa-0000-0000-0000-000000000002' $$,
  '23514',
  null,
  'A priority cannot be both a task and written text'
);

select throws_ok(
  $$ update public.daily_checkins set occupying_mind_ciphertext = 'the move'
     where id = 'aaaaaaaa-0000-0000-0000-000000000002' $$,
  '23514', null, 'A plaintext "occupying my mind" answer is rejected'
);

select throws_ok(
  $$ update public.daily_checkins set worries_ciphertext = 'money'
     where id = 'aaaaaaaa-0000-0000-0000-000000000002' $$,
  '23514', null, 'A plaintext "worries" answer is rejected'
);

select throws_ok(
  $$ update public.daily_checkins set can_control_ciphertext = 'my reply'
     where id = 'aaaaaaaa-0000-0000-0000-000000000002' $$,
  '23514', null, 'A plaintext "can control" answer is rejected'
);

select throws_ok(
  $$ update public.daily_checkins set can_wait_ciphertext = 'the garage'
     where id = 'aaaaaaaa-0000-0000-0000-000000000002' $$,
  '23514', null, 'A plaintext "can wait" answer is rejected'
);

select throws_ok(
  $$ update public.daily_checkins set small_helpful_thing_ciphertext = 'a walk'
     where id = 'aaaaaaaa-0000-0000-0000-000000000002' $$,
  '23514', null, 'A plaintext "small helpful thing" answer is rejected'
);

select throws_ok(
  $$ update public.daily_checkins set priority_task_id = null, priority_text_ciphertext = 'call mum'
     where id = 'aaaaaaaa-0000-0000-0000-000000000002' $$,
  '23514', null, 'A plaintext written priority is rejected'
);

select lives_ok(
  $$ update public.daily_checkins
     set occupying_mind_ciphertext = 'v1.' || repeat('A', 16) || '.' || repeat('A', 10688),
         worries_ciphertext = 'v1.' || repeat('A', 16) || '.' || repeat('A', 10688),
         can_control_ciphertext = 'v1.' || repeat('A', 16) || '.' || repeat('A', 10688),
         can_wait_ciphertext = 'v1.' || repeat('A', 16) || '.' || repeat('A', 10688),
         small_helpful_thing_ciphertext = 'v1.' || repeat('A', 16) || '.' || repeat('A', 10688),
         priority_task_id = null,
         priority_text_ciphertext = 'v1.' || repeat('A', 16) || '.' || repeat('A', 2688)
     where id = 'aaaaaaaa-0000-0000-0000-000000000002' $$,
  'The largest answers (10,708) and written priority (2,708) are accepted'
);

select throws_ok(
  $$ update public.daily_checkins
     set occupying_mind_ciphertext = 'v1.' || repeat('A', 16) || '.' || repeat('A', 10692)
     where id = 'aaaaaaaa-0000-0000-0000-000000000002' $$,
  '23514', null, 'An "occupying my mind" ciphertext over 10,708 characters is rejected'
);

select throws_ok(
  $$ update public.daily_checkins
     set worries_ciphertext = 'v1.' || repeat('A', 16) || '.' || repeat('A', 10692)
     where id = 'aaaaaaaa-0000-0000-0000-000000000002' $$,
  '23514', null, 'A "worries" ciphertext over 10,708 characters is rejected'
);

select throws_ok(
  $$ update public.daily_checkins
     set can_control_ciphertext = 'v1.' || repeat('A', 16) || '.' || repeat('A', 10692)
     where id = 'aaaaaaaa-0000-0000-0000-000000000002' $$,
  '23514', null, 'A "can control" ciphertext over 10,708 characters is rejected'
);

select throws_ok(
  $$ update public.daily_checkins
     set can_wait_ciphertext = 'v1.' || repeat('A', 16) || '.' || repeat('A', 10692)
     where id = 'aaaaaaaa-0000-0000-0000-000000000002' $$,
  '23514', null, 'A "can wait" ciphertext over 10,708 characters is rejected'
);

select throws_ok(
  $$ update public.daily_checkins
     set small_helpful_thing_ciphertext = 'v1.' || repeat('A', 16) || '.' || repeat('A', 10692)
     where id = 'aaaaaaaa-0000-0000-0000-000000000002' $$,
  '23514', null, 'A "small helpful thing" ciphertext over 10,708 characters is rejected'
);

select throws_ok(
  $$ update public.daily_checkins
     set priority_text_ciphertext = 'v1.' || repeat('A', 16) || '.' || repeat('A', 2692)
     where id = 'aaaaaaaa-0000-0000-0000-000000000002' $$,
  '23514', null, 'A written priority ciphertext over 2,708 characters is rejected'
);

select throws_ok(
  $$ update public.daily_checkins set user_id = '22222222-2222-2222-2222-222222222222' $$,
  '42501',
  'new row violates row-level security policy for table "daily_checkins"',
  'A cannot hand their check-in to B'
);

select lives_ok(
  $$ update public.daily_checkins set priority_text_ciphertext = null $$,
  'A''s unfiltered update reaches only A''s own check-ins'
);

select throws_ok(
  $$ delete from public.daily_checkins $$,
  '42501',
  'permission denied for table daily_checkins',
  'Check-ins cannot be deleted one by one'
);

update public.daily_checkins set priority_task_id = 'aaaaaaaa-0000-0000-0000-000000000001'
where id = 'aaaaaaaa-0000-0000-0000-000000000002';
delete from public.tasks where id = 'aaaaaaaa-0000-0000-0000-000000000001';

select results_eq(
  $$ select priority_task_id, user_id, checkin_date from public.daily_checkins
     where id = 'aaaaaaaa-0000-0000-0000-000000000002' $$,
  $$ values (null::uuid, '11111111-1111-1111-1111-111111111111'::uuid, '2026-11-06'::date) $$,
  'Deleting the priority task keeps the check-in and clears only priority_task_id'
);

reset role;

select results_eq(
  $$ select priority_text_ciphertext is not null from public.daily_checkins
     where id = 'bbbbbbbb-0000-0000-0000-000000000002' $$,
  $$ values (true) $$,
  'A''s unfiltered update leaves B''s check-in unchanged'
);

-- Act as a signed-out visitor.
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);

select throws_ok(
  $$ select id from public.daily_checkins $$,
  '42501',
  'permission denied for table daily_checkins',
  'A signed-out visitor cannot read check-ins'
);

reset role;

-- now() is fixed for the whole transaction, so the trigger must replace the old value with it.
update public.daily_checkins set updated_at = '2000-01-01'
where id = 'bbbbbbbb-0000-0000-0000-000000000002';

select is(
  (select updated_at from public.daily_checkins where id = 'bbbbbbbb-0000-0000-0000-000000000002'),
  now(),
  'Updating a check-in refreshes updated_at'
);

delete from auth.users where id = '22222222-2222-2222-2222-222222222222';

select is_empty(
  $$ select 1 from public.daily_checkins where user_id = '22222222-2222-2222-2222-222222222222' $$,
  'Deleting a user deletes their check-ins'
);

select * from finish();
rollback;
