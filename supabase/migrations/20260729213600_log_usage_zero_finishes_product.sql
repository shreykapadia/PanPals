-- Migration: log_usage opens unopened products to in_rotation, and at 0% finishes product, unpins from focus pot, and creates empties record.
--
-- 1. When usage is logged on any product:
--    - set products.opened_at = coalesce(opened_at, now())
--    - if status = 'unopened' and percent > 0, set status = 'in_rotation'
-- 2. When a product is logged to 0% remaining:
--    - set products.percent_remaining = 0
--    - set products.status = 'finished'
--    - set products.is_priority = false (remove from Focus Pot)
--    - insert into public.empties (if not already existing)

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
  months_elapsed int;
begin
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
  set percent_remaining = percent,
      opened_at = coalesce(opened_at, now()),
      status = case
        when percent = 0 then 'finished'::product_status
        when status = 'unopened' then 'in_rotation'::product_status
        else status
      end,
      is_priority = case when percent = 0 then false else is_priority end
  where id = product_id
  returning * into updated_product;

  if updated_product is null then
    raise exception 'Product not found or not owned by the caller.';
  end if;

  if percent = 0 then
    months_elapsed := case
      when updated_product.opened_at is null then null
      else greatest(
        0,
        (extract(year from age(current_date, updated_product.opened_at)) * 12
          + extract(month from age(current_date, updated_product.opened_at)))::int
      )
    end;

    insert into public.empties (user_id, product_id, review_text, repurchase, months_in_use, photo_url)
    select caller_id, product_id, note, 'maybe'::repurchase_verdict, months_elapsed, photo_url
    where not exists (select 1 from public.empties e where e.product_id = log_usage.product_id);
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

create or replace function public.finish_product(product_id uuid, review text, repurchase text, photo_url text)
returns public.empties
language plpgsql
security invoker
set search_path = public
as $$
declare
  updated_product public.products;
  new_empty public.empties;
  existing_empty_id uuid;
  months_elapsed int;
begin
  update public.products
  set status = 'finished',
      is_priority = false,
      percent_remaining = 0,
      opened_at = coalesce(opened_at, now())
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

  select id into existing_empty_id
  from public.empties
  where product_id = finish_product.product_id and user_id = auth.uid();

  if existing_empty_id is not null then
    update public.empties
    set review_text = coalesce(review, review_text),
        repurchase = repurchase::repurchase_verdict,
        months_in_use = coalesce(months_elapsed, months_in_use),
        photo_url = coalesce(finish_product.photo_url, empties.photo_url)
    where id = existing_empty_id
    returning * into new_empty;
  else
    insert into public.empties (user_id, product_id, review_text, repurchase, months_in_use, photo_url)
    values (auth.uid(), product_id, review, repurchase::repurchase_verdict, months_elapsed, photo_url)
    returning * into new_empty;
  end if;

  return new_empty;
end;
$$;
