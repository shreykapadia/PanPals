-- Two-user RLS verification harness (docs/DATA-MODEL.md §RLS verification,
-- docs/TESTING.md §RLS security tests). Run via scripts/rls-check.sh, which
-- is what gets pasted into every schema/* PR description (AI-CONTEXT §7).
--
-- The whole thing runs in one transaction that is ALWAYS rolled back at the
-- end (see the final `rollback;`), so re-running this is always safe and
-- leaves no test data behind, pass or fail.

begin;

-- ============================================================================
-- Helper: pg_temp means this vanishes with the session/rollback — nothing to
-- clean up manually. Results go both to RAISE NOTICE (readable when run via
-- `psql -f`, e.g. scripts/rls-check.sh against local) AND a temp table (so
-- the final SELECT below returns a proper result set when run via
-- `supabase db query --linked -f`, which does not stream NOTICE output).
-- ============================================================================

create table pg_temp.results (seq int generated always as identity, description text, passed boolean);
grant insert, select on pg_temp.results to authenticated;

create function pg_temp._assert(description text, condition boolean) returns void as $$
begin
  insert into pg_temp.results (description, passed) values (description, condition);
  if condition then
    raise notice 'PASS: %', description;
  else
    raise notice 'FAIL: %', description;
  end if;
end;
$$ language plpgsql;

-- ============================================================================
-- Setup (as postgres, bypasses RLS): two users, A (the "attacker") and B
-- (the "victim") owning one row in every user-owned table, plus 5 priority
-- products for A to set up the trigger assertion.
-- ============================================================================

set local role postgres;

insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role)
values
  ('a0000000-0000-0000-0000-00000000000a', 'rls-user-a@panpals.app', 'x', now(), now(), now(), 'authenticated', 'authenticated'),
  ('b0000000-0000-0000-0000-00000000000b', 'rls-user-b@panpals.app', 'x', now(), now(), now(), 'authenticated', 'authenticated');

insert into public.profiles (id, username, selected_goals) values
  ('a0000000-0000-0000-0000-00000000000a', 'rls_user_a', array['Finish what I own']),
  ('b0000000-0000-0000-0000-00000000000b', 'rls_user_b', array['Finish what I own']);

insert into public.products (id, user_id, brand, name, category, format, status, opened_at)
values ('b1000000-0000-0000-0000-00000000000b', 'b0000000-0000-0000-0000-00000000000b', 'Brand', 'Bs Product', 'lip', 'full', 'in_rotation', current_date - interval '1 month');

insert into public.wishlist_items (id, user_id, brand, name, category)
values ('b2000000-0000-0000-0000-00000000000b', 'b0000000-0000-0000-0000-00000000000b', 'Brand', 'Bs Wishlist Item', 'lip');

insert into public.usage_logs (id, product_id, percent_after)
values ('b3000000-0000-0000-0000-00000000000b', 'b1000000-0000-0000-0000-00000000000b', 80);

insert into public.empties (id, user_id, product_id, repurchase)
values ('b4000000-0000-0000-0000-00000000000b', 'b0000000-0000-0000-0000-00000000000b', 'b1000000-0000-0000-0000-00000000000b', 'yes');

-- 5 priority products for A, so the trigger assertion has something to
-- collide with (the 6th insert below is the actual assertion).
do $$
declare i int;
begin
  for i in 1..5 loop
    insert into public.products (user_id, brand, name, category, format, is_priority)
    values ('a0000000-0000-0000-0000-00000000000a', 'Brand', 'A Priority ' || i, 'lip', 'full', true);
  end loop;
end $$;

-- ============================================================================
-- Act as A. Every check below targets B's data or the shared catalog.
-- ============================================================================

set local role authenticated;
set local request.jwt.claims = '{"sub": "a0000000-0000-0000-0000-00000000000a", "role": "authenticated"}';

select pg_temp._assert(
  'A cannot SELECT Bs products',
  (select count(*) from public.products where user_id = 'b0000000-0000-0000-0000-00000000000b') = 0
);

select pg_temp._assert(
  'A cannot SELECT Bs wishlist_items',
  (select count(*) from public.wishlist_items where user_id = 'b0000000-0000-0000-0000-00000000000b') = 0
);

select pg_temp._assert(
  'A cannot SELECT Bs usage_logs',
  (select count(*) from public.usage_logs where product_id = 'b1000000-0000-0000-0000-00000000000b') = 0
);

select pg_temp._assert(
  'A cannot SELECT Bs empties (PRIVATE archive)',
  (select count(*) from public.empties where user_id = 'b0000000-0000-0000-0000-00000000000b') = 0
);

select pg_temp._assert(
  'A cannot SELECT Bs profile',
  (select count(*) from public.profiles where id = 'b0000000-0000-0000-0000-00000000000b') = 0
);

do $$
declare affected int;
begin
  update public.products set percent_remaining = 0 where user_id = 'b0000000-0000-0000-0000-00000000000b';
  get diagnostics affected = row_count;
  perform pg_temp._assert('A cannot UPDATE Bs products', affected = 0);
end $$;

do $$
declare affected int;
begin
  update public.wishlist_items set status = 'removed' where user_id = 'b0000000-0000-0000-0000-00000000000b';
  get diagnostics affected = row_count;
  perform pg_temp._assert('A cannot UPDATE Bs wishlist_items', affected = 0);
end $$;

do $$
declare affected int;
begin
  update public.usage_logs set percent_after = 0 where product_id = 'b1000000-0000-0000-0000-00000000000b';
  get diagnostics affected = row_count;
  perform pg_temp._assert('A cannot UPDATE Bs usage_logs', affected = 0);
end $$;

do $$
declare affected int;
begin
  update public.empties set review_text = 'tampered' where user_id = 'b0000000-0000-0000-0000-00000000000b';
  get diagnostics affected = row_count;
  perform pg_temp._assert('A cannot UPDATE Bs empties (PRIVATE archive)', affected = 0);
end $$;

do $$
declare affected int;
begin
  update public.profiles set username = 'hacked' where id = 'b0000000-0000-0000-0000-00000000000b';
  get diagnostics affected = row_count;
  perform pg_temp._assert('A cannot UPDATE Bs profile', affected = 0);
end $$;

do $$
declare affected int;
begin
  delete from public.empties where user_id = 'b0000000-0000-0000-0000-00000000000b';
  get diagnostics affected = row_count;
  perform pg_temp._assert('A cannot DELETE Bs empties (PRIVATE archive)', affected = 0);
end $$;

do $$
declare affected int;
begin
  delete from public.products where user_id = 'b0000000-0000-0000-0000-00000000000b';
  get diagnostics affected = row_count;
  perform pg_temp._assert('A cannot DELETE Bs products', affected = 0);
end $$;

select pg_temp._assert(
  'A CAN read catalog_products (globally readable)',
  (select count(*) from public.catalog_products) > 0
);

do $$
begin
  begin
    insert into public.products (user_id, brand, name, category, format, is_priority)
    values ('a0000000-0000-0000-0000-00000000000a', 'Brand', 'A Priority 6', 'lip', 'full', true);
    perform pg_temp._assert('trigger blocks a 6th is_priority product for one user', false);
  exception when others then
    perform pg_temp._assert('trigger blocks a 6th is_priority product for one user', true);
  end;
end $$;

-- ============================================================================
-- Act as B — confirm catalog_products is readable by BOTH users, not just A.
-- ============================================================================

set local request.jwt.claims = '{"sub": "b0000000-0000-0000-0000-00000000000b", "role": "authenticated"}';

select pg_temp._assert(
  'B CAN read catalog_products (globally readable)',
  (select count(*) from public.catalog_products) > 0
);

-- Final result set — this is what `supabase db query --linked -f` returns,
-- since it doesn't stream RAISE NOTICE output. scripts/rls-check.sh (local)
-- greps the RAISE NOTICE lines instead; both paths assert the same 15 checks.
set local role postgres;
select
  case when passed then 'PASS' else 'FAIL' end as result,
  description
from pg_temp.results
order by seq;

rollback;
