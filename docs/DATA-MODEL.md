# DATA-MODEL.md — PanPals

**Status: ACTIVE — Supabase is provisioned (D14).** **Shrey owns the entire
backend (D20):** the initial migration (`supabase/migrations/`), RLS policies,
seed data, the RPCs, and the generated `types/database.ts`. Until
`types/database.ts` is committed, `mocks/types.ts` mirrors this document and is
the import source for all front-end code (mock-first rule, AI-CONTEXT §2). The
four feature owners consume these fields **only** through `lib/api` hooks — they
never write SQL or edit `supabase/*`.

**Change control:** any edit to this file requires a PR that also updates
`AI-CONTEXT.md` §4 and adds a DECISIONS.md entry. After Phase 1 day 2, the schema
is frozen except by Shrey-approved exception.

**7/21 changes:** added `catalog_products` (Kaggle seed) and `analytics_events`;
added catalog/priority/reflection/reminder/conversion fields; `empties` is now a
**private** archive (owner-only RLS); `empty_likes` and `badges` are **deferred**
(see bottom). Streak fields remain for **display only** — no reward logic.

## Entities

### profiles
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | = auth.uid() |
| username | text unique | |
| avatar_url | text null | |
| age_range | text null | optional, from onboarding goal capture |
| location | text null | optional |
| selected_goals | text[] | ≥1 goal chosen at sign-up (matrix 1) |
| current_streak | int default 0 | **display only** |
| longest_streak | int default 0 | **display only** |
| last_log_date | date null | streak display logic |
| created_at | timestamptz | |

### catalog_products  *(read-only, seeded — Kaggle MIT dataset, D17)*
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| brand | text | indexed for type-ahead |
| name | text | indexed for type-ahead |
| category | enum (same as products.category) | |
| shade_or_variant | text null | drives shade pre-fill |
| image_url | text null | |
| source | text | dataset provenance (license compliance) |
| active_flag | bool default true | |

RLS: **read = all authenticated users**; no user writes (seed/admin only). This
is the ONLY globally-readable table.

### products
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK → profiles | RLS: owner only |
| catalog_product_id | uuid FK → catalog_products null | set when chosen from catalog; null if manual |
| brand | text | |
| name | text | |
| shade | text null | user copy; may override catalog |
| category | enum: lip, face, eye, skincare, fragrance, hair, other | beauty-only in UI; enum extensible |
| format | enum: full, mini, sample | matches log-modal.png toggles |
| status | enum: unopened, in_rotation, finished | |
| percent_remaining | int 0–100 | honor-system, 5% steps |
| photo_url | text null | Supabase Storage |
| pao_months | int null (6 or 12) | PAO; expiration optional by design |
| opened_at | date null | |
| is_priority | bool default false | Focus Pot — **trigger enforces max 5 true per user** |
| source_wishlist_item_id | uuid FK → wishlist_items null | set when created via wishlist→inventory conversion |
| created_at | timestamptz | |

### usage_logs
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| product_id | uuid FK → products | |
| percent_after | int 0–100 | |
| note | text null | optional |
| photo_url | text null | optional progress photo |
| logged_at | timestamptz | each log is its own row; never overwrite history |

### wishlist_items
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK | RLS: owner only |
| catalog_product_id | uuid FK → catalog_products null | pre-fill source |
| brand, name | text | |
| shade | text null | |
| category | enum (same as products) | drives duplicate-intercept query |
| price | numeric null | display only — no checkout |
| product_url | text null | pasted retailer link (metadata only) |
| photo_url | text null | |
| priority | enum: high, medium, low default medium | matrix 3 |
| rank_position | int null | manual ordering |
| reflection_response | text null | "would you still want this in 30 days?" (matrix 3) |
| cooling_off_ends_at | timestamptz | default now() + interval '14 days' (D3) |
| reminder_at | timestamptz null | opt-in in-app reminder (matrix 19; no push — D19) |
| status | enum: cooling, ready, removed, purchased | |
| last_reviewed_at | timestamptz null | |
| created_at | timestamptz | |

### empties  *(PRIVATE finish archive — D13)*
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK | owner |
| product_id | uuid FK → products | |
| review_text | text null | 1-liner |
| repurchase | enum: yes, maybe, no | verdict (matrix 12) |
| months_in_use | int null | computed from opened_at |
| photo_url | text null | |
| created_at | timestamptz | |

RLS: **read = owner only; write = owner only.** No public feed (deferred — D13).

### analytics_events  *(product learning — matrix 24)*
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK null | pseudonymous ok |
| event_name | text | from the event dictionary below |
| entity_id | uuid null | |
| source_view | text null | |
| properties | jsonb null | never store raw review text |
| created_at | timestamptz | |

**Event dictionary (fire via `lib/api` `track()`):** `account_completed`,
`inventory_item_added`, `wishlist_item_added`, `focus_product_set`,
`usage_logged`, `duplicate_warning_shown`, `warning_decision`,
`product_finished`, `wishlist_item_removed`, `wishlist_item_purchased`.

## RPCs (the only custom endpoints)

| RPC | Signature | Behavior |
|---|---|---|
| log_usage | (product_id uuid, percent int, note text, photo_url text) | insert usage_log, update product.percent_remaining, bump streak if first log today |
| finish_product | (product_id uuid, review text, repurchase text, photo_url text) | set status=finished, is_priority=false, create empties row, compute months_in_use from opened_at. **No badge/points logic** |
| get_dashboard | () | one round-trip: focus products, status counts for donut, streak, category count, wishlist items ready for reconsideration |
| search_catalog | (q text, category text null, limit int) | type-ahead over catalog_products (brand/name prefix), for F1/F5 pre-fill |
| find_similar_owned | (category text, exclude_product_id uuid null) | count + list of active owned products in the same category — powers the F5 intercept and confidence-tiered language |

## RLS verification (Shrey, with every migration)

SQL test script asserting: user A cannot select/update/delete user B's
`products`, `wishlist_items`, `usage_logs`, `empties`, or `profiles`; **empties
are NOT readable across users** (private archive — changed 7/21); all users can
read `catalog_products`. Run manually until CI exists; attach output to the
migration PR.

---

## DEFERRED — do NOT create these (post-class, D13/D15)

- **`empty_likes`** — social likes on empties. Requires the public feed, which is deferred.
- **`badges`** (first_empty, streak_7, pan_master) — reward economy, deferred.
- **Public/global read RLS on `empties`** — the feed is deferred; empties stay private.

Streak columns on `profiles` remain **only** to display Maya's streak (journey 1.9);
they must not drive any reward, badge, or unlock.
