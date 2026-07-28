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
| **Talbia**       | `TALBIA-PLAN.md` | `app/(tabs)/empties.tsx` (was `progress.tsx` — D23), `features/empties/*` — finish/celebration, repurchase review, private empties archive, Empties tab.                                                                                                                                       |

Enforced by `.github/CODEOWNERS` and `AI-CONTEXT.md §3`. If you need a change outside
your lane, **stop and post a `CROSS-LANE REQUEST`** — each plan has pre-written ones.

## Where everyone actually is (2026-07-28, `main` @ `bbf7605`)

Each plan now opens with a **§0 STATUS** block — read it before pasting anything, because
several phases are already done and a few instructions further down are now wrong.
Cross-lane detail, blockers, and the real `lib/api` contract:
**[`PLAN-AUDIT.md`](./PLAN-AUDIT.md)**.

| Lane       | Done                                                 | Next up                                                                                     |
| ---------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| **Shrey**  | 0-A→0-E, B1→B7, Phase 2, Phase 3                     | The footer PR — **queued behind Talbia's Phase 5**                                          |
| **Aaron**  | Phases 1, 2, 3, **5** (#29), **usage history** (#30) | **Nothing open** — Phase 4 (not code) + a 1-line CTA follow-up queued behind Matt           |
| **Matt**   | 1a, half of 1b, part of 3                            | Barcode copy fix, rest of Phase 3, then 1b. **Phase 5 not yet — step 4 of 5**               |
| **Talbia** | 1, 2, most of 3                                      | **Phase 3b — wire the finish seam** 🔴, then **Phase 5 — the whole chain is waiting on it** |
| **Joon**   | 1a, 1b, **1c** (PRs #28, #31)                        | Phase 3 polish / `.maestro/wishlist-intercept.yaml`                                         |

`npm run verify` is green on `main` at `bbf7605` — 27 suites / 139 tests.

**Two project-wide corrections the plans were written before:**

1. **There is no mock phase.** `lib/api` has hit real Supabase since PR #14, so everyone's
   "Phase 2 — wire real hooks" is already done for them. You need a **signed-in session**
   to see or create anything.
2. **`track()` fires from inside the hooks.** Do not call it yourself for
   `inventory_item_added`, `usage_logged`, `focus_product_set`, `product_finished`,
   `wishlist_item_added`, `wishlist_item_removed`, or `wishlist_item_purchased` — you'll
   double-count.

**🔴 Known broken:** F6 doesn't work end to end. Matt's "Mark as Finished" navigates with a
`finishProductId` param that Talbia's screen doesn't read yet, so her whole finish flow is
`__DEV__`-only. Talbia's Phase 3b fixes it in ~10 lines.

## In flight: the bottom-nav change (D23, 7/27)

The footer becomes **`Home │ Inventory │ ⊕ Log │ Wishlist │ Empties`**, with **You**
moving to a profile button in the Home top app bar. Rationale and the full build spec
are in [`GEMINI-FOOTER-PLAN.md`](./GEMINI-FOOTER-PLAN.md) (Shrey's lane).

**It touches three lanes, and merge order matters. Status as of 2026-07-28:**

1. ✅ **Aaron** — profile button in the Home header, "Log item" pill dropped.
   **Merged 2026-07-27 (PR #29).**
2. 🟡 **Talbia** — Phase 5 in her plan: rename the tab screen to `empties.tsx` behind a
   one-line shim, drop the streak and status badges that duplicate Home.
   **← the chain is stalled here; three lanes are waiting on it.**
3. ⬜ **Shrey** — the nav itself, the centre ⊕ button, and the doc updates.
4. ⬜ **Matt** — Phase 5 in his plan: open his existing `FastLogSheet` from the ⊕'s
   `action=log` param, and repoint the finish seam to `/(tabs)/empties`.
5. ⬜ **Talbia** — a 2-line follow-up deleting the shim. **Must come after step 4**, or
   Matt's "Mark as Finished" button navigates to a dead route.

**⚠️ Gap window, live right now:** step 1 removed the Home "Log Item" pill and step 3
hasn't added the ⊕ yet, so Home has no persistent log entry point. Logging still works
from the Inventory tab, and the empty-Focus-Pot CTA still points there, but F1's headline
"≤15s from anywhere" is not true until step 3 merges. That's the reason to keep steps 2
and 3 moving rather than batching them with other work.

Ownership does not change. Nobody edits anyone else's files.

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
