-- Fix: a finished product could be pinned to the Focus Pot, where it then
-- became invisible.
--
-- get_dashboard().focus_products filters `status != 'finished'` (correct — a
-- finished product is done, it should not hold one of the 5 focus slots), and
-- finish_product() clears is_priority when it finishes an item. But nothing
-- stopped is_priority being set back to true AFTERWARDS: inventory item detail
-- offers "Add to Focus Pot" for finished items too, the UPDATE succeeded, the
-- row read back with is_priority = true (so inventory showed the Focus badge),
-- and Home's Focus Pot stayed empty. From the user's side the button did
-- nothing, with no error.
--
-- This makes the invariant the dashboard already assumes true at the database
-- level, in both directions: a finished product cannot become priority, and a
-- priority product cannot become finished without its pin being cleared
-- (finish_product() already clears it in the same UPDATE, so that path is
-- unaffected).

-- ============================================================================
-- Backfill: unpin any product already stuck in the finished-and-pinned state.
-- Must run BEFORE the trigger exists — afterwards, any UPDATE to such a row
-- (an edit, a usage log) would raise on the pre-existing bad value.
-- ============================================================================

update public.products
set is_priority = false
where status = 'finished' and is_priority = true;

-- ============================================================================
-- Trigger: enforce_focus_pot_not_finished — the Focus Pot holds only products
-- the user is still using. Kept separate from enforce_focus_pot_max so each
-- trigger states one rule; both are BEFORE INSERT OR UPDATE on products.
-- ============================================================================

create function public.enforce_focus_pot_not_finished ()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.is_priority and new.status = 'finished' then
    raise exception 'A finished product cannot be in the Focus Pot.';
  end if;

  return new;
end;
$$;

create trigger enforce_focus_pot_not_finished
  before insert or update on public.products
  for each row
  execute function public.enforce_focus_pot_not_finished ();

-- Same reasoning as enforce_focus_pot_max: PostgREST auto-exposes every
-- function in `public` unless EXECUTE is revoked, and a trigger function is
-- never called as an RPC.
revoke execute on function public.enforce_focus_pot_not_finished () from public, anon, authenticated;

-- ============================================================================
-- Trigger: enforce_focus_pot_max — max 5 active (non-finished) priority products
-- ============================================================================

create or replace function public.enforce_focus_pot_max ()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  priority_count int;
begin
  if new.is_priority then
    select count(*)
    into priority_count
    from public.products
    where user_id = new.user_id
      and is_priority = true
      and status != 'finished'
      and id <> new.id;

    if priority_count >= 5 then
      raise exception 'You can focus on up to 5 products at a time.';
    end if;
  end if;

  return new;
end;
$$;

