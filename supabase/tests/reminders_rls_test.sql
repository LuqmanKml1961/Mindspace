begin;
select plan(12);

-- User A is 1111…, user B is 2222…. Each has a task; B also has a reminder. The tests that guard
-- B's rows run without WHERE or RETURNING, so only the UPDATE policy decides (DATA_MODEL §4).
insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'a@example.test'),
  ('22222222-2222-2222-2222-222222222222', 'b@example.test');

insert into public.tasks (id, user_id, title_ciphertext) values
  ('aaaaaaaa-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
   'v1.' || repeat('A', 16) || '.' || repeat('A', 24)),
  ('bbbbbbbb-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222',
   'v1.' || repeat('B', 16) || '.' || repeat('B', 24));

insert into public.reminders (id, user_id, task_id, remind_at) values
  ('bbbbbbbb-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222',
   'bbbbbbbb-0000-0000-0000-000000000001', '2026-11-06 01:00:00+00');

-- Act as user A.
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);

select lives_ok(
  $$ insert into public.reminders (id, user_id, task_id, remind_at)
     values ('aaaaaaaa-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111',
             'aaaaaaaa-0000-0000-0000-000000000001', '2026-11-06 01:30:00+00') $$,
  'A can set a reminder on their own task'
);

select results_eq(
  $$ select id, dismissed_at from public.reminders $$,
  $$ values ('aaaaaaaa-0000-0000-0000-000000000002'::uuid, null::timestamptz) $$,
  'A sees only their own reminders, and a new one is not dismissed'
);

select throws_ok(
  $$ insert into public.reminders (user_id, task_id, remind_at)
     values ('22222222-2222-2222-2222-222222222222', 'bbbbbbbb-0000-0000-0000-000000000001', now()) $$,
  '42501',
  'new row violates row-level security policy for table "reminders"',
  'A cannot set a reminder for B'
);

select throws_ok(
  $$ insert into public.reminders (user_id, task_id, remind_at)
     values ('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-0000-0000-0000-000000000001', now()) $$,
  '23503',
  null,
  'A cannot set a reminder on B''s task (composite ownership FK)'
);

select throws_ok(
  $$ update public.reminders set task_id = 'bbbbbbbb-0000-0000-0000-000000000001'
     where id = 'aaaaaaaa-0000-0000-0000-000000000002' $$,
  '23503',
  null,
  'A cannot move their reminder to B''s task'
);

select results_eq(
  $$ update public.reminders set dismissed_at = now()
     where id = 'aaaaaaaa-0000-0000-0000-000000000002' returning dismissed_at is not null $$,
  $$ values (true) $$,
  'A can dismiss their own reminder'
);

select throws_ok(
  $$ delete from public.reminders where id = 'aaaaaaaa-0000-0000-0000-000000000002' $$,
  '42501',
  'permission denied for table reminders',
  'Reminders are dismissed, not deleted'
);

select lives_ok(
  $$ update public.reminders set remind_at = '2026-12-01 00:00:00+00' $$,
  'A''s unfiltered update reaches only A''s own reminders'
);

reset role;

select results_eq(
  $$ select remind_at from public.reminders where id = 'bbbbbbbb-0000-0000-0000-000000000002' $$,
  $$ values ('2026-11-06 01:00:00+00'::timestamptz) $$,
  'A''s unfiltered update leaves B''s reminder unchanged'
);

-- Act as a signed-out visitor.
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);

select throws_ok(
  $$ select id from public.reminders $$,
  '42501',
  'permission denied for table reminders',
  'A signed-out visitor cannot read reminders'
);

reset role;

delete from public.tasks where id = 'aaaaaaaa-0000-0000-0000-000000000001';

select is_empty(
  $$ select 1 from public.reminders where task_id = 'aaaaaaaa-0000-0000-0000-000000000001' $$,
  'Deleting a task deletes its reminders'
);

delete from auth.users where id = '22222222-2222-2222-2222-222222222222';

select is_empty(
  $$ select 1 from public.reminders where user_id = '22222222-2222-2222-2222-222222222222' $$,
  'Deleting a user deletes their reminders'
);

select * from finish();
rollback;
