# TESTING.md — PanPals (no-CI edition)

There is no CI server. Every gate runs on your machine. If you skip
verification, you are shipping unverified AI-generated code to four teammates.

## The verify command

Shrey wires this into `package.json` during scaffold (Phase 0):

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint": "eslint . --max-warnings 0",
    "format:check": "prettier --check .",
    "test": "jest",
    "verify": "npm run typecheck && npm run lint && npm run format:check && npm run test"
  }
}
```

`npm run verify` must pass before every PR. No exceptions, including Shrey.

## Unit / component tests (Jest + React Native Testing Library)

- Every feature module owns `features/<module>/__tests__/`.
- Minimum per module: core logic paths tested (e.g. wishlist: banner appears
  at ≥3 same-category items, cooling-off date = +14 days; home: ring math,
  Focus Pot cap of 5; inventory: filter results, PAO label).
- Mock the `lib/api/` hooks — never hit real Supabase in unit tests.

## End-to-end flows (Maestro, local)

Maestro CLI is free and runs on a local simulator/emulator.
Flows live in `.maestro/`, one per feature:

| Flow file | Asserts |
|---|---|
| `log-product.yaml` | open modal → fill fields → save → item in inventory |
| `focus-and-ring.yaml` | pin product → Home shows ring → slider updates % |
| `wishlist-intercept.yaml` | add 4th same-category item → banner shows owned items → cooling-off CTA |
| `catalog-search.yaml` | type a brand → type-ahead result → select → fields pre-fill |
| `finish-and-archive.yaml` | finish product → celebration → item in **private** empties archive + repurchase verdict saved |

*(The old `finish-and-feed` flow is retired — the Community feed is deferred, D13.)*

Run your module's flow before every PR; Shrey runs the full set before merging
to `main` each evening (this replaces nightly CI).

## RLS security tests (Shrey — owns the backend, D20)

SQL script per DATA-MODEL.md: two test users, assert cross-user reads/writes
**fail** for all owned tables (`products`, `wishlist_items`, `usage_logs`,
`empties`, `profiles`) — empties are now **private** (D13) — and assert all
users **can** read `catalog_products`. Output pasted into the migration PR.

## User testing (Phase 4 — this is the class deliverable)

Moderated sessions, 5–8 MBA-cohort testers (screener per persona doc).
Measure PRD success metrics: ≤15s median log time; intercept changes ≥1
purchase decision; finish moment described as "motivating." Record timings
and quotes — they're design-fair exhibits.
