-- Phase B2: core schema — tables, enums, RLS, and the max-5-priority trigger.
-- Implements docs/DATA-MODEL.md exactly. Local stack only; not yet applied to
-- hosted (that happens in B6, alongside `types/database.ts` generation).

create extension if not exists pgcrypto;

-- ============================================================================
-- Enums
-- ============================================================================

create type product_category as enum ('lip', 'face', 'eye', 'skincare', 'fragrance', 'hair', 'other');
create type product_format as enum ('full', 'mini', 'sample');
create type product_status as enum ('unopened', 'in_rotation', 'finished');
create type wishlist_priority as enum ('high', 'medium', 'low');
create type wishlist_status as enum ('cooling', 'ready', 'removed', 'purchased');
create type repurchase_verdict as enum ('yes', 'maybe', 'no');

-- ============================================================================
-- Tables
-- ============================================================================
-- Creation order avoids forward references: products.source_wishlist_item_id
-- points at wishlist_items, so wishlist_items is created first.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  avatar_url text,
  age_range text,
  location text,
  selected_goals text[] not null,
  current_streak int not null default 0,
  longest_streak int not null default 0,
  last_log_date date,
  created_at timestamptz not null default now()
);

-- catalog_products: read-only, seeded from a license-clean dataset (D17, B4).
create table public.catalog_products (
  id uuid primary key default gen_random_uuid(),
  brand text not null,
  name text not null,
  category product_category not null,
  shade_or_variant text,
  image_url text,
  source text not null,
  active_flag boolean not null default true
);

create index catalog_products_brand_prefix_idx on public.catalog_products (lower(brand) text_pattern_ops);
create index catalog_products_name_prefix_idx on public.catalog_products (lower(name) text_pattern_ops);

create table public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  catalog_product_id uuid references public.catalog_products (id),
  brand text not null,
  name text not null,
  shade text,
  category product_category not null,
  price numeric,
  product_url text,
  photo_url text,
  priority wishlist_priority not null default 'medium',
  rank_position int,
  reflection_response text,
  cooling_off_ends_at timestamptz not null default (now() + interval '14 days'),
  reminder_at timestamptz,
  status wishlist_status not null default 'cooling',
  last_reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  catalog_product_id uuid references public.catalog_products (id),
  brand text not null,
  name text not null,
  shade text,
  category product_category not null,
  format product_format not null,
  status product_status not null default 'unopened',
  percent_remaining int not null default 100 check (percent_remaining between 0 and 100),
  photo_url text,
  pao_months int check (pao_months in (6, 12)),
  opened_at date,
  is_priority boolean not null default false,
  source_wishlist_item_id uuid references public.wishlist_items (id),
  created_at timestamptz not null default now()
);

create table public.usage_logs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  percent_after int not null check (percent_after between 0 and 100),
  note text,
  photo_url text,
  logged_at timestamptz not null default now()
);

-- empties: PRIVATE finish archive (D13) — owner-only read AND write, no
-- public/global policy, ever.
create table public.empties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  review_text text,
  repurchase repurchase_verdict not null,
  months_in_use int,
  photo_url text,
  created_at timestamptz not null default now()
);

create table public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  event_name text not null,
  entity_id uuid,
  source_view text,
  properties jsonb,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- Row Level Security
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.catalog_products enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.products enable row level security;
alter table public.usage_logs enable row level security;
alter table public.empties enable row level security;
alter table public.analytics_events enable row level security;

-- profiles: owner only
create policy "profiles_select_own" on public.profiles for select
  using (auth.uid () = id);
create policy "profiles_insert_own" on public.profiles for insert
  with check (auth.uid () = id);
create policy "profiles_update_own" on public.profiles for update
  using (auth.uid () = id)
  with check (auth.uid () = id);
create policy "profiles_delete_own" on public.profiles for delete
  using (auth.uid () = id);

-- catalog_products: the ONLY globally-readable table — SELECT for every
-- authenticated user, no user writes (seed/admin only, via service role).
create policy "catalog_products_select_authenticated" on public.catalog_products for select
  to authenticated
  using (true);

-- products: owner only
create policy "products_select_own" on public.products for select
  using (auth.uid () = user_id);
create policy "products_insert_own" on public.products for insert
  with check (auth.uid () = user_id);
create policy "products_update_own" on public.products for update
  using (auth.uid () = user_id)
  with check (auth.uid () = user_id);
create policy "products_delete_own" on public.products for delete
  using (auth.uid () = user_id);

-- usage_logs: no direct user_id column — ownership is via product_id's owner.
create policy "usage_logs_select_own" on public.usage_logs for select
  using (
    exists (
      select 1 from public.products p
      where p.id = usage_logs.product_id and p.user_id = auth.uid ()
    )
  );
create policy "usage_logs_insert_own" on public.usage_logs for insert
  with check (
    exists (
      select 1 from public.products p
      where p.id = usage_logs.product_id and p.user_id = auth.uid ()
    )
  );
create policy "usage_logs_update_own" on public.usage_logs for update
  using (
    exists (
      select 1 from public.products p
      where p.id = usage_logs.product_id and p.user_id = auth.uid ()
    )
  )
  with check (
    exists (
      select 1 from public.products p
      where p.id = usage_logs.product_id and p.user_id = auth.uid ()
    )
  );
create policy "usage_logs_delete_own" on public.usage_logs for delete
  using (
    exists (
      select 1 from public.products p
      where p.id = usage_logs.product_id and p.user_id = auth.uid ()
    )
  );

-- wishlist_items: owner only
create policy "wishlist_items_select_own" on public.wishlist_items for select
  using (auth.uid () = user_id);
create policy "wishlist_items_insert_own" on public.wishlist_items for insert
  with check (auth.uid () = user_id);
create policy "wishlist_items_update_own" on public.wishlist_items for update
  using (auth.uid () = user_id)
  with check (auth.uid () = user_id);
create policy "wishlist_items_delete_own" on public.wishlist_items for delete
  using (auth.uid () = user_id);

-- empties: PRIVATE — owner-only read AND write. No cross-user or public read.
create policy "empties_select_own" on public.empties for select
  using (auth.uid () = user_id);
create policy "empties_insert_own" on public.empties for insert
  with check (auth.uid () = user_id);
create policy "empties_update_own" on public.empties for update
  using (auth.uid () = user_id)
  with check (auth.uid () = user_id);
create policy "empties_delete_own" on public.empties for delete
  using (auth.uid () = user_id);

-- analytics_events: owner only. user_id may be null (pseudonymous events);
-- those rows are only reachable via the service role, never a user session.
create policy "analytics_events_select_own" on public.analytics_events for select
  using (auth.uid () = user_id);
create policy "analytics_events_insert_own" on public.analytics_events for insert
  with check (auth.uid () = user_id or user_id is null);
create policy "analytics_events_update_own" on public.analytics_events for update
  using (auth.uid () = user_id)
  with check (auth.uid () = user_id);
create policy "analytics_events_delete_own" on public.analytics_events for delete
  using (auth.uid () = user_id);

-- ============================================================================
-- Grants
-- ============================================================================
-- RLS policies only restrict which ROWS a role can see — Postgres denies
-- access at the table-privilege layer first if these grants are missing,
-- before RLS is ever evaluated. No grants to `anon`: every screen in this
-- app requires a signed-in session (AI-CONTEXT — no anonymous browsing).

grant usage on schema public to authenticated;

grant select, insert, update, delete on public.profiles to authenticated;
grant select on public.catalog_products to authenticated;
grant select, insert, update, delete on public.wishlist_items to authenticated;
grant select, insert, update, delete on public.products to authenticated;
grant select, insert, update, delete on public.usage_logs to authenticated;
grant select, insert, update, delete on public.empties to authenticated;
grant select, insert, update, delete on public.analytics_events to authenticated;

-- ============================================================================
-- Trigger: enforce_focus_pot_max — max 5 is_priority=true products per user
-- ============================================================================

create function public.enforce_focus_pot_max ()
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
      and id <> new.id;

    if priority_count >= 5 then
      raise exception 'You can focus on up to 5 products at a time.';
    end if;
  end if;

  return new;
end;
$$;

create trigger enforce_focus_pot_max
  before insert or update on public.products
  for each row
  execute function public.enforce_focus_pot_max ();

-- Trigger functions are invoked internally by Postgres, never as a public
-- RPC. PostgREST auto-exposes every function in `public` unless EXECUTE is
-- revoked, so lock this one down (Supabase Security Advisor flags this).
revoke execute on function public.enforce_focus_pot_max () from public, anon, authenticated;
