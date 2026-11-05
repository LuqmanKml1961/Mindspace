begin;
select plan(22);

-- User A is 1111…, user B is 2222…. Ciphertext is 'v1.' || 16-char IV || '.' || base64; the
-- shortest real one (1 byte of text plus the 16-byte tag) is 'v1.' || IV || '.' || 24 chars.
-- An UPDATE or DELETE whose WHERE or RETURNING reads columns also applies the SELECT policy, so
-- the tests that guard B's rows run without them: only the UPDATE or DELETE policy decides.
insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'a@example.test'),
  ('22222222-2222-2222-2222-222222222222', 'b@example.test');

insert into public.thoughts (id, user_id, content_ciphertext) values
  ('aaaaaaaa-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
   'v1.' || repeat('A', 16) || '.' || repeat('A', 24)),
  ('bbbbbbbb-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222',
   'v1.' || repeat('B', 16) || '.' || repeat('B', 24));

insert into public.tasks (id, user_id, title_ciphertext) values
  ('bbbbbbbb-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222',
   'v1.' || repeat('B', 16) || '.' || repeat('B', 24));

-- Act as user A.
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);

select lives_ok(
  $$ insert into public.tasks (id, user_id, title_ciphertext, source_thought_id)
     values ('aaaaaaaa-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111',
             'v1.' || repeat('A', 16) || '.' || repeat('A', 24), 'aaaaaaaa-0000-0000-0000-000000000001') $$,
  'A can create a task from their own thought'
);

select results_eq(
  $$ select id, priority, due_date, completed_at from public.tasks $$,
  $$ values ('aaaaaaaa-0000-0000-0000-000000000002'::uuid, 'normal', null::date, null::timestamptz) $$,
  'A sees only their own tasks, and a new task is open, normal priority and undated'
);

select throws_ok(
  $$ insert into public.tasks (user_id, title_ciphertext)
     values ('22222222-2222-2222-2222-222222222222', 'v1.' || repeat('A', 16) || '.' || repeat('A', 24)) $$,
  '42501',
  'new row violates row-level security policy for table "tasks"',
  'A cannot create a task for B'
);

select throws_ok(
  $$ insert into public.tasks (user_id, title_ciphertext, source_thought_id)
     values ('11111111-1111-1111-1111-111111111111', 'v1.' || repeat('A', 16) || '.' || repeat('A', 24),
             'bbbbbbbb-0000-0000-0000-000000000001') $$,
  '23503',
  null,
  'A cannot link a task to B''s thought (composite ownership FK)'
);

select throws_ok(
  $$ update public.tasks set source_thought_id = 'bbbbbbbb-0000-0000-0000-000000000001'
     where id = 'aaaaaaaa-0000-0000-0000-000000000002' $$,
  '23503',
  null,
  'A cannot point their task at B''s thought'
);

select results_eq(
  $$ update public.tasks set due_date = '2026-11-06', due_time = '09:30', priority = 'high'
     where id = 'aaaaaaaa-0000-0000-0000-000000000002' returning due_date, due_time, priority $$,
  $$ values ('2026-11-06'::date, '09:30'::time, 'high') $$,
  'A can date, time and prioritise their own task'
);

select throws_ok(
  $$ update public.tasks set due_date = null
     where id = 'aaaaaaaa-0000-0000-0000-000000000002' $$,
  '23514',
  null,
  'A time without a date is rejected'
);

select throws_ok(
  $$ update public.tasks set priority = 'urgent'
     where id = 'aaaaaaaa-0000-0000-0000-000000000002' $$,
  '23514',
  null,
  'An unknown priority is rejected'
);

select throws_ok(
  $$ update public.tasks set title_ciphertext = 'call the bank'
     where id = 'aaaaaaaa-0000-0000-0000-000000000002' $$,
  '23514',
  null,
  'A plaintext title is rejected'
);

select throws_ok(
  $$ update public.tasks set notes_ciphertext = 'my private notes'
     where id = 'aaaaaaaa-0000-0000-0000-000000000002' $$,
  '23514',
  null,
  'Plaintext notes are rejected'
);

select lives_ok(
  $$ update public.tasks
     set title_ciphertext = 'v1.' || repeat('A', 16) || '.' || repeat('A', 2688),
         notes_ciphertext = 'v1.' || repeat('A', 16) || '.' || repeat('A', 53356)
     where id = 'aaaaaaaa-0000-0000-0000-000000000002' $$,
  'The largest title (2,708) and notes (53,376) ciphertexts are accepted'
);

select throws_ok(
  $$ update public.tasks set title_ciphertext = 'v1.' || repeat('A', 16) || '.' || repeat('A', 2692)
     where id = 'aaaaaaaa-0000-0000-0000-000000000002' $$,
  '23514',
  null,
  'Title ciphertext over 2,708 characters is rejected'
);

select throws_ok(
  $$ update public.tasks set notes_ciphertext = 'v1.' || repeat('A', 16) || '.' || repeat('A', 53360)
     where id = 'aaaaaaaa-0000-0000-0000-000000000002' $$,
  '23514',
  null,
  'Notes ciphertext over 53,376 characters is rejected'
);

select results_eq(
  $$ update public.tasks set completed_at = now()
     where id = 'aaaaaaaa-0000-0000-0000-000000000002' returning completed_at is not null $$,
  $$ values (true) $$,
  'A can complete their own task'
);

select throws_ok(
  $$ update public.tasks set source_thought_id = null, user_id = '22222222-2222-2222-2222-222222222222' $$,
  '42501',
  'new row violates row-level security policy for table "tasks"',
  'A cannot hand their task to B'
);

delete from public.thoughts where id = 'aaaaaaaa-0000-0000-0000-000000000001';

select results_eq(
  $$ select source_thought_id, user_id from public.tasks where id = 'aaaaaaaa-0000-0000-0000-000000000002' $$,
  $$ values (null::uuid, '11111111-1111-1111-1111-111111111111'::uuid) $$,
  'Deleting a thought keeps tasks made from it and clears only source_thought_id'
);

select lives_ok(
  $$ update public.tasks set priority = 'low' $$,
  'A''s unfiltered update reaches only A''s own tasks'
);
delete from public.tasks;

reset role;

select results_eq(
  $$ select priority from public.tasks where id = 'bbbbbbbb-0000-0000-0000-000000000002' $$,
  $$ values ('normal') $$,
  'A''s unfiltered update leaves B''s task unchanged'
);

select results_eq(
  $$ select user_id from public.tasks
     where user_id in ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222') $$,
  $$ values ('22222222-2222-2222-2222-222222222222'::uuid) $$,
  'A''s unfiltered delete removes only A''s own tasks'
);

-- Act as a signed-out visitor.
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);

select throws_ok(
  $$ select id from public.tasks $$,
  '42501',
  'permission denied for table tasks',
  'A signed-out visitor cannot read tasks'
);

reset role;

-- now() is fixed for the whole transaction, so the trigger must replace the old value with it.
update public.tasks set updated_at = '2000-01-01'
where id = 'bbbbbbbb-0000-0000-0000-000000000002';

select is(
  (select updated_at from public.tasks where id = 'bbbbbbbb-0000-0000-0000-000000000002'),
  now(),
  'Updating a task refreshes updated_at'
);

delete from auth.users where id = '22222222-2222-2222-2222-222222222222';

select is_empty(
  $$ select 1 from public.tasks where user_id = '22222222-2222-2222-2222-222222222222' $$,
  'Deleting a user deletes their tasks'
);

select * from finish();
rollback;
