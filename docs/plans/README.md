# PanPals — Team Build Kickoff & Handoff

Everything each person needs to build PanPals in parallel without merge conflicts.
Read your own plan in full; skim the others' lanes so you know what you can import.

> **New to this / not technical? Start with [`GETTING-STARTED.md`](./GETTING-STARTED.md)** —
> a plain-English guide to installing the tools, getting the project, running the
> app on your phone, and using GitHub. Do that first, then open your own plan below.
>
> **Shrey (lead):** before anyone starts, work through [`SHREY-SETUP-RUNBOOK.md`](./SHREY-SETUP-RUNBOOK.md) —
> the one-time setup for the GitHub repo + branch protection, the Supabase project,
> and the Supabase/GitHub MCP servers in both Claude Code and Antigravity.

## What changed after the 7/21 sync (read once)

The **Maya Feature Matrix** is now the scope authority. Versus the earlier kit:

- **Shrey owns the entire backend and setup (D20)** — scaffold, auth, navigation, Supabase schema/RLS/RPCs/seed, generated types, shared UI, and the `lib/api` data hooks. The other four build **front-end features only** and never touch `supabase/*` or `types/database.ts`.
- **Supabase is provisioned now** (was deferred) — it's our shared data contract and our main merge-conflict defense.
- **Community feed, likes, badges, and points are deferred.** Finishing a product writes a **private** empties archive + repurchase verdict. Streak is display-only.
- Added a **product catalog** (Kaggle cosmetics dataset) powering type-ahead search/pre-fill and the category-based duplicate intercept.
- Added in-app reminders, analytics events, profile/account controls, and an accessibility/privacy baseline.

Full rationale: `docs/DECISIONS.md` (D12–D19). The contract everyone obeys: `AI-CONTEXT.md`.

## Who owns what (nobody edits anyone else's files)

| Person           | Plan             | Lane (owns & edits)                                                                                                                                                                                                                                                                            |
| ---------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Shrey** (lead) | `SHREY-PLAN.md`  | **Entire backend + platform:** scaffold, auth, navigation, `supabase/*` (schema/RLS/RPCs/Kaggle seed), `types/database.ts`, shared UI kit (`components/ui/*`), `lib/api` hooks, `theme`, `mocks`, catalog search, analytics, onboarding + You tab, docs, `.github`. Reviews & merges every PR. |
| **Aaron**        | `AARON-PLAN.md`  | `app/(tabs)/index.tsx`, `features/home/*`, `components/ProgressRing.tsx` — Home, Focus Pot, rings.                                                                                                                                                                                             |
| **Joon**         | `JOON-PLAN.md`   | `app/(tabs)/wishlist.tsx`, `features/wishlist/*` — wishlist, impulse intercept, cooling-off, conversion.                                                                                                                                                                                       |
| **Matt**         | `MATT-PLAN.md`   | `app/(tabs)/inventory.tsx`, `features/inventory/*` — inventory entry, browse/filter/edit, usage logging.                                                                                                                                                                                       |
| **Talbia**       | `TALBIA-PLAN.md` | `app/(tabs)/progress.tsx`, `features/empties/*` — finish/celebration, repurchase review, private empties archive, Progress tab.                                                                                                                                                                |

Enforced by `.github/CODEOWNERS` and `AI-CONTEXT.md §3`. If you need a change outside
your lane, **stop and post a `CROSS-LANE REQUEST`** — each plan has pre-written ones.

## Build sequence (this order prevents conflicts)

1. **Phase 0 — Shrey alone, day 1.** Scaffold + shared UI + `lib/api` hooks serving `mocks/` fixtures + auth + tab navigator + `npm run verify` + GitHub repo/branch protection. **Merged to `main` before anyone else starts.**
2. **Phase 1 — everyone in parallel.** Shrey builds the real schema/RLS/RPCs/types + Kaggle seed. Aaron/Joon/Matt/Talbia build their screens **against the mock hooks** (the app runs before the database exists — that's the point).
3. **Phase 2 — wire-up.** Once `types/database.ts` lands, swap mock hooks for real data.
4. **Phase 3 — polish.** Empty/loading/error states, accessibility labels, analytics events, Maestro flows.
5. **Phase 4 — user testing** (the graded class deliverable): 5–8 testers, targets in `docs/PRD.md`.

## The rules that keep `main` clean

- Branch every session: `git checkout main && git pull && git checkout -b feat/<you>/<module>-<slug>`. One module, one branch, one PR. Branches live ≤2 days.
- **Never** force-push, merge, or commit to `main`; never edit `supabase/*` or `types/database.ts` — that's Shrey's.
- `npm run verify` (tsc + eslint + prettier + jest) must pass **before** every PR — no exceptions.
- **Schema PRs merge first each day.** After Shrey merges a schema change, he regenerates `types/database.ts`; everyone else rebases on `main` and re-imports.
- Shrey reviews/merges at **12pm and 9pm** — plan around the windows.
- Style comes only from `docs/DESIGN-TOKENS.md` via NativeWind — never hardcode a hex, font, or radius.

## Timeline reality

Shrey is out Fri–Mon; final class is next week. Critical path: **Shrey's Phase 0 foundation + schema must land first** so the four feature owners can run flat-out against mocks over the weekend. If a task can't merge in 2 days, it's too big — shrink it.
