-- Fix: log_usage() accepted a usage log for an already-finished product.
--
-- The RPC inserted the usage_logs row and overwrote products.percent_remaining
-- without ever looking at products.status, so a finished product could read
-- back at 90% remaining with a usage log dated ten seconds AFTER its empties
-- archive row. That happened in the hosted project: product
-- f8e585c7-3c77-40bd-b981-10923d6ba94c was finished at 03:16:50 and then took a
-- usage log at 03:17:00.
--
-- The guard lives inside the RPC rather than in a trigger on usage_logs,
-- unlike enforce_focus_pot_max / enforce_focus_pot_not_finished. Those two
-- guard a column (products.is_priority) that the client writes with a plain
-- UPDATE, so only a trigger can cover every writer. Here the invariant is
-- narrower: a usage_logs row whose logged_at predates the finish is legitimate
-- history and an import or backfill should still be able to write one. What is
-- never legitimate is recording a NEW use of a product you have already
-- finished — and log_usage() is the only path the app uses to do that
-- (lib/api/useProducts.ts useLogUsage()).
--
-- Signature and return type are unchanged, so types/database.ts does not need
-- regenerating.

create or replace function public.log_usage(product_id uuid, percent int, note text, photo_url text)
returns public.products
language plpgsql
security invoker
set search_path = public
as $$
declare
  updated_product public.products;
  caller_id uuid := auth.uid();
  today date := current_date;
  profile_row public.profiles;
  target_status product_status;
begin
  -- Runs before the insert so a rejected call leaves no usage_logs row behind.
  -- SELECT is RLS-scoped, so a product the caller does not own reads as missing
  -- and reports the same message the UPDATE below would have.
  select status into target_status
  from public.products
  where id = product_id;

  if not found then
    raise exception 'Product not found or not owned by the caller.';
  end if;

  if target_status = 'finished' then
    raise exception 'This product is already finished, so it cannot take a new usage log.';
  end if;

  insert into public.usage_logs (product_id, percent_after, note, photo_url)
  values (product_id, percent, note, photo_url);

  update public.products
  set percent_remaining = percent
  where id = product_id
  returning * into updated_product;

  if updated_product is null then
    raise exception 'Product not found or not owned by the caller.';
  end if;

  select * into profile_row from public.profiles where id = caller_id;

  if profile_row.last_log_date is distinct from today then
    update public.profiles
    set current_streak = current_streak + 1,
        longest_streak = greatest(longest_streak, current_streak + 1),
        last_log_date = today
    where id = caller_id;
  end if;

  return updated_product;
end;
$$;

-- No data reconciliation here on purpose. The one bad row lives only in the
-- hosted project, and both plausible repairs — deleting the stray usage log, or
-- rewriting percent_remaining — would guess at history if this migration ran
-- anywhere else. finish_product() deliberately leaves percent_remaining alone,
-- so "finished at 90%" is not by itself a corrupt state; it is only wrong here
-- because of where the 90 came from. That single row is fixed as a one-off
-- against the hosted project, not by every environment replaying this file.
