begin;
select plan(20);

-- User A is 1111…, user B is 2222…. Ciphertext is 'v1.' || 16-char IV || '.' || base64; the
-- shortest real one (1 byte of text plus the 16-byte tag) is 'v1.' || IV || '.' || 24 chars.
-- An UPDATE or DELETE whose WHERE or RETURNING reads columns also applies the SELECT policy, so
-- the tests that guard B's rows run without them: only the UPDATE or DELETE policy decides.
insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'a@example.test'),
  ('22222222-2222-2222-2222-222222222222', 'b@example.test');

insert into public.categories (id, user_id, name_ciphertext) values
  ('aaaaaaaa-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
   'v1.' || repeat('A', 16) || '.' || repeat('A', 24)),
  ('bbbbbbbb-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222',
   'v1.' || repeat('B', 16) || '.' || repeat('B', 24));

insert into public.thoughts (id, user_id, content_ciphertext) values
  ('bbbbbbbb-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222',
   'v1.' || repeat('B', 16) || '.' || repeat('B', 24));

-- Act as user A.
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);

select lives_ok(
  $$ insert into public.thoughts (id, user_id, content_ciphertext, category_id)
     values ('aaaaaaaa-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111',
             'v1.' || repeat('A', 16) || '.' || repeat('A', 24), 'aaaaaaaa-0000-0000-0000-000000000001') $$,
  'A can capture a thought, without a title, in their own category'
);

select results_eq(
  $$ select id, status from public.thoughts $$,
  $$ values ('aaaaaaaa-0000-0000-0000-000000000002'::uuid, 'inbox') $$,
  'A sees only their own thoughts, and new thoughts start in the inbox'
);

select throws_ok(
  $$ insert into public.thoughts (user_id, content_ciphertext)
     values ('22222222-2222-2222-2222-222222222222', 'v1.' || repeat('A', 16) || '.' || repeat('A', 24)) $$,
  '42501',
  'new row violates row-level security policy for table "thoughts"',
  'A cannot capture a thought for B'
);

select throws_ok(
  $$ insert into public.thoughts (user_id, content_ciphertext, category_id)
     values ('11111111-1111-1111-1111-111111111111', 'v1.' || repeat('A', 16) || '.' || repeat('A', 24),
             'bbbbbbbb-0000-0000-0000-000000000001') $$,
  '23503',
  null,
  'A cannot file a thought under B''s category (composite ownership FK)'
);

select throws_ok(
  $$ update public.thoughts set category_id = 'bbbbbbbb-0000-0000-0000-000000000001'
     where id = 'aaaaaaaa-0000-0000-0000-000000000002' $$,
  '23503',
  null,
  'A cannot move a thought into B''s category'
);

select results_eq(
  $$ update public.thoughts set status = 'parked'
     where id = 'aaaaaaaa-0000-0000-0000-000000000002' returning status $$,
  $$ values ('parked') $$,
  'A can update their own thought'
);

select throws_ok(
  $$ update public.thoughts set category_id = null, user_id = '22222222-2222-2222-2222-222222222222' $$,
  '42501',
  'new row violates row-level security policy for table "thoughts"',
  'A cannot hand their thought to B'
);

select throws_ok(
  $$ update public.thoughts set status = 'done'
     where id = 'aaaaaaaa-0000-0000-0000-000000000002' $$,
  '23514',
  null,
  'An unknown status is rejected'
);

select throws_ok(
  $$ update public.thoughts set content_ciphertext = 'my private thought'
     where id = 'aaaaaaaa-0000-0000-0000-000000000002' $$,
  '23514',
  null,
  'Plaintext content is rejected'
);

select lives_ok(
  $$ update public.thoughts
     set content_ciphertext = 'v1.' || repeat('A', 16) || '.' || repeat('A', 53356),
         title_ciphertext = 'v1.' || repeat('A', 16) || '.' || repeat('A', 1088)
     where id = 'aaaaaaaa-0000-0000-0000-000000000002' $$,
  'The largest content (53,376) and title (1,108) ciphertexts are accepted'
);

select throws_ok(
  $$ update public.thoughts set content_ciphertext = 'v1.' || repeat('A', 16) || '.' || repeat('A', 53360)
     where id = 'aaaaaaaa-0000-0000-0000-000000000002' $$,
  '23514',
  null,
  'Content ciphertext over 53,376 characters is rejected'
);

select throws_ok(
  $$ update public.thoughts set title_ciphertext = 'v1.' || repeat('A', 16) || '.' || repeat('A', 1092)
     where id = 'aaaaaaaa-0000-0000-0000-000000000002' $$,
  '23514',
  null,
  'Title ciphertext over 1,108 characters is rejected'
);

select throws_ok(
  $$ update public.thoughts set title_ciphertext = 'a private title'
     where id = 'aaaaaaaa-0000-0000-0000-000000000002' $$,
  '23514',
  null,
  'A plaintext title is rejected'
);

delete from public.categories where id = 'aaaaaaaa-0000-0000-0000-000000000001';

select results_eq(
  $$ select category_id, user_id from public.thoughts where id = 'aaaaaaaa-0000-0000-0000-000000000002' $$,
  $$ values (null::uuid, '11111111-1111-1111-1111-111111111111'::uuid) $$,
  'Deleting a category keeps its thoughts and clears only category_id'
);

select lives_ok(
  $$ update public.thoughts set status = 'archived' $$,
  'A''s unfiltered update reaches only A''s own thoughts'
);
delete from public.thoughts;

reset role;

select results_eq(
  $$ select status from public.thoughts where id = 'bbbbbbbb-0000-0000-0000-000000000002' $$,
  $$ values ('inbox') $$,
  'A''s unfiltered update leaves B''s thought unchanged'
);

select results_eq(
  $$ select user_id from public.thoughts $$,
  $$ values ('22222222-2222-2222-2222-222222222222'::uuid) $$,
  'A''s unfiltered delete removes only A''s own thoughts'
);

-- Act as a signed-out visitor.
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);

select throws_ok(
  $$ select id from public.thoughts $$,
  '42501',
  'permission denied for table thoughts',
  'A signed-out visitor cannot read thoughts'
);

reset role;

-- now() is fixed for the whole transaction, so the trigger must replace the old value with it.
update public.thoughts set updated_at = '2000-01-01'
where id = 'bbbbbbbb-0000-0000-0000-000000000002';

select is(
  (select updated_at from public.thoughts where id = 'bbbbbbbb-0000-0000-0000-000000000002'),
  now(),
  'Updating a thought refreshes updated_at'
);

delete from auth.users where id = '22222222-2222-2222-2222-222222222222';

select is_empty(
  $$ select 1 from public.thoughts where user_id = '22222222-2222-2222-2222-222222222222' $$,
  'Deleting a user deletes their thoughts'
);

select * from finish();
rollback;
