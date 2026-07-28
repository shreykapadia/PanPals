-- ============================================================================
-- profiles.reminders_enabled — the You tab's in-app reminder opt-in (row 20)
-- ============================================================================
-- The toggle shipped as component state with nothing behind it, so it reset
-- every time the user left the tab while the copy promised "you're always in
-- control." This is the column that makes that copy true.
--
-- NOT NULL DEFAULT false, deliberately:
--   * Privacy by default (matrix row 25) — the opt-in is OFF until she asks for
--     it, and existing rows backfill to off rather than being opted in by a
--     migration they never saw.
--   * Nullable would make "never decided" and "declined" indistinguishable,
--     which is exactly the ambiguity a consent flag must not carry.
--
-- No new RLS needed: profiles is already owner-only for select/insert/update/
-- delete (core_schema.sql) and those policies are row-scoped, so they cover
-- every column added later.
--
-- Scope note: this stores the PREFERENCE only. It is not push notifications —
-- those are explicitly out of scope (AI-CONTEXT §1). Nothing reads this column
-- yet beyond the toggle that writes it.

alter table public.profiles
  add column reminders_enabled boolean not null default false;

comment on column public.profiles.reminders_enabled is
  'In-app reminder opt-in for the You tab. Off by default; preference only — never push notifications (AI-CONTEXT §1).';
