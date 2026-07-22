# CATALOG-PROVENANCE.md — `catalog_products` seed data (D17)

## Dataset

- **Name:** Cosmetics datasets
- **Author:** kingabzpro
- **Platform:** Kaggle
- **URL:** https://www.kaggle.com/datasets/kingabzpro/cosmetics-datasets
- **License:** MIT
- **Retrieved:** 2026-07-22

## Why this is license-clean

The dataset is distributed by its author under an MIT license on Kaggle.
We did not scrape any retailer, brand site, or beauty database ourselves —
`catalog_products` is seeded exclusively from this one MIT-licensed CSV via
`scripts/build-catalog-seed.mjs`, and `supabase/seed.sql` is the only place
catalog rows are inserted (AI-CONTEXT §2, D17). `catalog_products.source`
records this dataset citation on every row for traceability.

## What's in the seed

The raw dataset (`brand, name, type, country, ingridients, afterUse`,
~19,050 rows) is far larger than we need for a type-ahead demo, and its
`type` column doesn't map 1:1 onto our `product_category` enum. The build
script:

1. Maps `type` → `product_category` (see the `TYPE_TO_CATEGORY` table in
   `scripts/build-catalog-seed.mjs`). Types with no analog in a "things you
   own and use up" model — `Tool`, `Makeup Applicator`, blank types — are
   **excluded**, not dumped into `other`.
2. De-dupes on `(brand, name)` (case-insensitive).
3. Caps each source `type` at 12 rows, so the seed stays a demo size (~300
   rows) instead of importing all ~19k, while still covering every category.
4. Sets `active_flag = true` and `source` to the dataset citation above on
   every row. `shade_or_variant` and `image_url` are left `null` — this
   dataset doesn't carry either.

## How to regenerate

1. Get the CSV from the Kaggle URL above and place it at
   `data/catalog_raw.csv` (gitignored — it's a build input, not a repo
   artifact).
2. Run:
   ```bash
   node scripts/build-catalog-seed.mjs
   ```
   This overwrites `supabase/seed.sql`.
3. `bash scripts/db-reset.sh` to apply it to the local stack.

## Deferred

`empty_likes`, `badges`, and any public/global read policy stay deferred
per D13/D15 — unrelated to this seed, noted here only per the standing
"do NOT create these" list in `docs/DATA-MODEL.md`.
