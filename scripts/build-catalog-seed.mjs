#!/usr/bin/env node
// Builds supabase/seed.sql's catalog_products INSERTs from a local CSV.
//
// Usage: node scripts/build-catalog-seed.mjs
// Input:  data/catalog_raw.csv (gitignored — see docs/CATALOG-PROVENANCE.md)
// Output: supabase/seed.sql (overwritten)
//
// Source dataset: "Cosmetics datasets" by kingabzpro on Kaggle, MIT license.
// https://www.kaggle.com/datasets/kingabzpro/cosmetics-datasets
// Full provenance: docs/CATALOG-PROVENANCE.md

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');
const INPUT_CSV = join(REPO_ROOT, 'data', 'catalog_raw.csv');
const OUTPUT_SQL = join(REPO_ROOT, 'supabase', 'seed.sql');

const DATASET_SOURCE = 'Cosmetics datasets (kingabzpro, Kaggle, MIT license)';
const PER_TYPE_CAP = 12; // keeps the seed to a "few hundred rows" demo size

// This dataset's `type` column doesn't map 1:1 onto our product_category
// enum. Types with no real analog in a "things you own and use up" model
// (tools, applicators) are dropped rather than dumped into `other`.
const TYPE_TO_CATEGORY = {
  Serum: 'skincare',
  'General Moisturizer': 'skincare',
  'Face Cleanser': 'skincare',
  Sunscreen: 'skincare',
  Toner: 'skincare',
  'Facial Treatment': 'skincare',
  'Eye Moisturizer': 'skincare',
  Exfoliator: 'skincare',
  'Makeup Remover': 'skincare',
  'Wet Mask': 'skincare',
  'Sheet Mask': 'skincare',
  'Day Moisturizer': 'skincare',
  Oil: 'skincare',
  'Night Moisturizer': 'skincare',
  Essence: 'skincare',
  'Overnight Mask': 'skincare',
  'Eye Mask': 'skincare',
  Emulsion: 'skincare',
  'Face Makeup': 'face',
  'Cheek Makeup': 'face',
  'Eye Makeup': 'eye',
  'False Eyelash': 'eye',
  'Lip Makeup': 'lip',
  'Lip Moisturizer': 'lip',
  'Lip Mask': 'lip',
  'Other Haircare': 'hair',
  Shampoo: 'hair',
  Conditioner: 'hair',
  Fragrance: 'fragrance',
  'Bath & Body': 'other',
  'Hand Care': 'other',
  'Nail Care': 'other',
  Tanning: 'other',
  Other: 'other',
  // Not a consumable/depletable beauty product in our data model — excluded:
  // Tool, Makeup Applicator, '' (blank type).
};

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\r') {
      // skip; \n (below) ends the row
    } else if (c === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function sqlString(value) {
  return `'${value.replace(/'/g, "''")}'`;
}

function main() {
  const raw = readFileSync(INPUT_CSV, 'utf-8');
  const rows = parseCsv(raw);
  const header = rows[0];
  const brandIdx = header.indexOf('brand');
  const nameIdx = header.indexOf('name');
  const typeIdx = header.indexOf('type');

  if (brandIdx === -1 || nameIdx === -1 || typeIdx === -1) {
    throw new Error(`Expected brand/name/type columns, got: ${header.join(', ')}`);
  }

  const seen = new Set();
  const perTypeCount = {};
  const catalogRows = [];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.length < header.length) continue;

    const brand = r[brandIdx]?.trim();
    const name = r[nameIdx]?.trim();
    const type = r[typeIdx]?.trim();

    if (!brand || !name || !type) continue;

    const category = TYPE_TO_CATEGORY[type];
    if (!category) continue; // excluded type (Tool, Makeup Applicator, etc.)

    const dedupeKey = `${brand.toLowerCase()}::${name.toLowerCase()}`;
    if (seen.has(dedupeKey)) continue;

    perTypeCount[type] = (perTypeCount[type] ?? 0) + 1;
    if (perTypeCount[type] > PER_TYPE_CAP) continue;

    seen.add(dedupeKey);
    catalogRows.push({ brand, name, category });
  }

  const BATCH_SIZE = 50;
  const insertBatches = [];
  for (let i = 0; i < catalogRows.length; i += BATCH_SIZE) {
    const batch = catalogRows.slice(i, i + BATCH_SIZE);
    const values = batch
      .map(
        (row) =>
          `  (${sqlString(row.brand)}, ${sqlString(row.name)}, '${row.category}', ${sqlString(DATASET_SOURCE)}, true)`,
      )
      .join(',\n');
    insertBatches.push(
      `insert into public.catalog_products (brand, name, category, source, active_flag)\nvalues\n${values};`,
    );
  }

  const header_comment = `-- PanPals local seed data.
--
-- catalog_products, seeded from a license-clean dataset (D17):
--   Dataset:   Cosmetics datasets
--   Author:    kingabzpro (Kaggle)
--   URL:       https://www.kaggle.com/datasets/kingabzpro/cosmetics-datasets
--   License:   MIT
--   Retrieved: 2026-07-22
--   Full provenance: docs/CATALOG-PROVENANCE.md
--
-- Regenerate: place the dataset CSV at data/catalog_raw.csv (gitignored,
-- not committed) and run \`node scripts/build-catalog-seed.mjs\`.
-- ${catalogRows.length} rows across ${Object.keys(perTypeCount).length} source types, capped at
-- ${PER_TYPE_CAP} rows/type for a demo-sized catalog.

`;

  writeFileSync(OUTPUT_SQL, header_comment + insertBatches.join('\n\n') + '\n');

  console.log(`Wrote ${catalogRows.length} catalog_products rows to ${OUTPUT_SQL}`);
  console.log('By category:');
  const byCategory = {};
  for (const row of catalogRows) byCategory[row.category] = (byCategory[row.category] ?? 0) + 1;
  for (const [cat, count] of Object.entries(byCategory).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cat}: ${count}`);
  }
}

main();
