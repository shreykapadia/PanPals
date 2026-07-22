-- Phase B3: the five RPCs. All run SECURITY INVOKER — every query stays
-- scoped to the caller's own rows via the RLS policies from B2 (the caller's
-- privileges/row-visibility apply throughout; no SECURITY DEFINER anywhere in
-- this migration). Signatures and return shapes match docs/DATA-MODEL.md §RPCs
-- and mocks/types.ts's DashboardData exactly, so lib/api hooks need zero
-- client-side reshaping when Phase 2 swaps mocks for these calls.

-- ============================================================================
-- log_usage — insert a usage log, update percent_remaining, bump the
-- streak only on the first log of the calendar day.
-- ============================================================================

create function public.log_usage(product_id uuid, percent int, note text, photo_url text)
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
begin
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

-- ============================================================================
-- finish_product — mark finished, clear priority, archive to the PRIVATE
-- empties table with months_in_use computed from opened_at. No badges/points.
-- ============================================================================

create function public.finish_product(product_id uuid, review text, repurchase text, photo_url text)
returns public.empties
language plpgsql
security invoker
set search_path = public
as $$
declare
  updated_product public.products;
  new_empty public.empties;
  months_elapsed int;
begin
  update public.products
  set status = 'finished', is_priority = false
  where id = product_id
  returning * into updated_product;

  if updated_product is null then
    raise exception 'Product not found or not owned by the caller.';
  end if;

  months_elapsed := case
    when updated_product.opened_at is null then null
    else greatest(
      0,
      (extract(year from age(current_date, updated_product.opened_at)) * 12
        + extract(month from age(current_date, updated_product.opened_at)))::int
    )
  end;

  insert into public.empties (user_id, product_id, review_text, repurchase, months_in_use, photo_url)
  values (auth.uid(), product_id, review, repurchase::repurchase_verdict, months_elapsed, photo_url)
  returning * into new_empty;

  return new_empty;
end;
$$;

-- ============================================================================
-- get_dashboard — one round-trip: profile, focus products, status counts
-- (all statuses, zero-filled), streak, category counts (all categories,
-- active-only, zero-filled), and ready-for-reconsideration wishlist items.
-- Matches mocks/types.ts DashboardData exactly.
-- ============================================================================

create function public.get_dashboard()
returns jsonb
language plpgsql
security invoker
stable
set search_path = public
as $$
declare
  result jsonb;
begin
  select jsonb_build_object(
    'profile', to_jsonb(pr),
    'focus_products', coalesce((
      select jsonb_agg(to_jsonb(p) order by p.created_at)
      from public.products p
      where p.user_id = auth.uid() and p.is_priority = true and p.status != 'finished'
    ), '[]'::jsonb),
    'status_counts', (
      select jsonb_object_agg(s.status, coalesce(c.cnt, 0))
      from unnest(enum_range(null::product_status)) as s (status)
      left join (
        select status, count(*) as cnt
        from public.products
        where user_id = auth.uid()
        group by status
      ) c on c.status = s.status
    ),
    'streak', jsonb_build_object(
      'current_streak', pr.current_streak,
      'longest_streak', pr.longest_streak,
      'last_log_date', pr.last_log_date
    ),
    'category_counts', (
      select jsonb_object_agg(cat.category, coalesce(c.cnt, 0))
      from unnest(enum_range(null::product_category)) as cat (category)
      left join (
        select category, count(*) as cnt
        from public.products
        where user_id = auth.uid() and status != 'finished'
        group by category
      ) c on c.category = cat.category
    ),
    'ready_wishlist_items', coalesce((
      select jsonb_agg(to_jsonb(w) order by w.cooling_off_ends_at)
      from public.wishlist_items w
      where w.user_id = auth.uid() and w.status = 'ready'
    ), '[]'::jsonb)
  )
  into result
  from public.profiles pr
  where pr.id = auth.uid();

  return result;
end;
$$;

-- ============================================================================
-- search_catalog — case-insensitive PREFIX match on brand/name, optional
-- category filter, active only. Powers F1/F5 pre-fill.
-- ============================================================================

create function public.search_catalog(q text, category text default null, "limit" int default 20)
returns table (
  id uuid,
  brand text,
  name text,
  category product_category,
  shade_or_variant text,
  image_url text
)
language sql
security invoker
stable
set search_path = public
as $$
  select cp.id, cp.brand, cp.name, cp.category, cp.shade_or_variant, cp.image_url
  from public.catalog_products cp
  where cp.active_flag = true
    and (lower(cp.brand) like lower(q) || '%' or lower(cp.name) like lower(q) || '%')
    and (
      search_catalog.category is null
      or cp.category::text = search_catalog.category
    )
  order by cp.brand, cp.name
  limit "limit";
$$;

-- ============================================================================
-- find_similar_owned — count + list of the caller's active (non-finished)
-- owned products in a category, excluding one product. Powers the F5
-- duplicate intercept.
-- ============================================================================

create function public.find_similar_owned(category text, exclude_product_id uuid default null)
returns jsonb
language sql
security invoker
stable
set search_path = public
as $$
  select jsonb_build_object(
    'count', count(*),
    'products', coalesce(jsonb_agg(to_jsonb(p)), '[]'::jsonb)
  )
  from public.products p
  where p.user_id = auth.uid()
    and p.category::text = find_similar_owned.category
    and p.status != 'finished'
    and (exclude_product_id is null or p.id != exclude_product_id);
$$;

-- ============================================================================
-- Grants
-- ============================================================================

grant execute on function public.log_usage (uuid, int, text, text) to authenticated;
grant execute on function public.finish_product (uuid, text, text, text) to authenticated;
grant execute on function public.get_dashboard () to authenticated;
grant execute on function public.search_catalog (text, text, int) to authenticated;
grant execute on function public.find_similar_owned (text, uuid) to authenticated;
