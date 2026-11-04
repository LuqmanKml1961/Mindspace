begin;
select plan(13);

-- User A is 1111…, user B is 2222…. Ciphertext is 'v1.' || 16-char IV || '.' || base64; the
-- shortest real one (1 byte of text plus the 16-byte tag) is 'v1.' || IV || '.' || 24 chars.
-- An UPDATE or DELETE whose WHERE or RETURNING reads columns also applies the SELECT policy, so
-- the tests that guard B's rows run without them: only the UPDATE or DELETE policy decides.
insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'a@example.test'),
  ('22222222-2222-2222-2222-222222222222', 'b@example.test');

insert into public.categories (id, user_id, name_ciphertext) values
  ('bbbbbbbb-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222',
   'v1.' || repeat('B', 16) || '.' || repeat('B', 24));

-- Act as user A.
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);

select lives_ok(
  $$ insert into public.categories (id, user_id, name_ciphertext)
     values ('aaaaaaaa-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
             'v1.' || repeat('A', 16) || '.' || repeat('A', 24)) $$,
  'A can create their own category'
);

select results_eq(
  $$ select id from public.categories $$,
  $$ values ('aaaaaaaa-0000-0000-0000-000000000001'::uuid) $$,
  'A sees only their own categories'
);

select throws_ok(
  $$ insert into public.categories (user_id, name_ciphertext)
     values ('22222222-2222-2222-2222-222222222222', 'v1.' || repeat('A', 16) || '.' || repeat('A', 24)) $$,
  '42501',
  'new row violates row-level security policy for table "categories"',
  'A cannot create a category for B'
);

select results_eq(
  $$ update public.categories set name_ciphertext = 'v1.' || repeat('C', 16) || '.' || repeat('C', 24)
     where id = 'aaaaaaaa-0000-0000-0000-000000000001' returning id $$,
  $$ values ('aaaaaaaa-0000-0000-0000-000000000001'::uuid) $$,
  'A can rename their own category'
);

select throws_ok(
  $$ update public.categories set user_id = '22222222-2222-2222-2222-222222222222' $$,
  '42501',
  'new row violates row-level security policy for table "categories"',
  'A cannot hand their category to B'
);

select throws_ok(
  $$ update public.categories set name_ciphertext = 'Work'
     where id = 'aaaaaaaa-0000-0000-0000-000000000001' $$,
  '23514',
  null,
  'A plaintext name is rejected'
);

select lives_ok(
  $$ update public.categories set name_ciphertext = 'v1.' || repeat('A', 16) || '.' || repeat('A', 288)
     where id = 'aaaaaaaa-0000-0000-0000-000000000001' $$,
  'The largest name ciphertext (308 characters, 50 emoji) is accepted'
);

select throws_ok(
  $$ update public.categories set name_ciphertext = 'v1.' || repeat('A', 16) || '.' || repeat('A', 292)
     where id = 'aaaaaaaa-0000-0000-0000-000000000001' $$,
  '23514',
  null,
  'A name ciphertext over 308 characters is rejected'
);

select lives_ok(
  $$ update public.categories set name_ciphertext = 'v1.' || repeat('D', 16) || '.' || repeat('D', 24) $$,
  'A''s unfiltered update reaches only A''s own categories'
);
delete from public.categories;

reset role;

select results_eq(
  $$ select name_ciphertext from public.categories where id = 'bbbbbbbb-0000-0000-0000-000000000001' $$,
  $$ values ('v1.' || repeat('B', 16) || '.' || repeat('B', 24)) $$,
  'A''s unfiltered update leaves B''s category unchanged'
);

select results_eq(
  $$ select user_id from public.categories $$,
  $$ values ('22222222-2222-2222-2222-222222222222'::uuid) $$,
  'A''s unfiltered delete removes only A''s own category'
);

-- Act as a signed-out visitor.
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);

select throws_ok(
  $$ select id from public.categories $$,
  '42501',
  'permission denied for table categories',
  'A signed-out visitor cannot read categories'
);

reset role;

delete from auth.users where id = '22222222-2222-2222-2222-222222222222';

select is_empty(
  $$ select 1 from public.categories where user_id = '22222222-2222-2222-2222-222222222222' $$,
  'Deleting a user deletes their categories'
);

select * from finish();
rollback;
