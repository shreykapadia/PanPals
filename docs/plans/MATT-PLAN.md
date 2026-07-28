# Matt's Implementation Plan — Inventory & Logging

## ▶️ RESUME HERE — read this before anything else (updated 2026-07-28)

**Asking your agent "my plan was updated, where do we continue from?" — this is the answer.**

**Where you left off:** PRs #21 and #23 are merged. Phase 1a is done, Phase 1b is half done, `.maestro/log-product.yaml` is in. Phase-by-phase breakdown in §0.

**Do these two now — nothing blocks them:**

1. **A one-line copy fix.** `strings.ts` currently promises barcode scanning, which is a banned feature (§0 item 1). Two minutes.
2. **Finish Phase 3** (§6) — the accessibility sweep and the finish-button navigation test.

**Then Phase 3's leftovers and Phase 1b — the edit / delete / usage-history work below.**

**⏳ Phase 5 is NOT ready yet — you are step 4 of 5 (updated 2026-07-28).** It is revised
and much smaller than the first draft (open your existing `FastLogSheet` from a route
param; the "extract a `FastLogForm`" version is **cancelled**), but **do not start it
until Shrey tells you steps 2 and 3 have merged.** Where the chain actually stands:

- ✅ Step 1 — Aaron's Home profile button (PR #29, 2026-07-27).
- 🟡 Step 2 — Talbia creates `app/(tabs)/empties.tsx` + the `progress.tsx` shim. **Not
  merged.** Until it is, repointing `ItemDetailSheet.tsx:53` to `'/(tabs)/empties'`
  would aim your "Mark as Finished" button at a route that does not exist — it would
  break F6 rather than protect it.
- ⬜ Step 3 — Shrey's nav PR adds the centre ⊕ that sends `action=log`. Until it merges,
  your param handling has nothing to receive.
- ⬜ Step 4 — **you.** Both changes in one PR.
- ⬜ Step 5 — Talbia deletes the shim, **after** you.

**Unblocked 2026-07-27:** `useUpdateProduct()`, `useDeleteProduct()`, and `useUsageLogs()` are merged (§7-F and §7-G are answered). Phase 1b's edit, delete, usage-history, and "recently used" work is now yours to build — see the hook table in §8 for exact shapes, and read the delete-cascade note there before writing any delete copy.

> **Paste this to your agent to start the session:**
>
> ```
> Read AI-CONTEXT.md in full, then docs/plans/MATT-PLAN.md §0 (STATUS) and §5
> (the corrected hook table). My plan was re-audited on 2026-07-27 against
> main @ cdd8e1e. Several phases are already shipped and some instructions later
> in the file are now wrong — §0 overrides anything that contradicts it.
>
> Then run `git log --oneline -5` and read features/inventory/* to see what
> already exists. Do NOT rebuild anything that is already there.
>
> My next two tasks, in this order (Phase 5 is NOT one of them yet — see below):
>
> 1. In features/inventory/strings.ts, change scanPlaceholder from
>    'Tap to scan barcode or take photo' to 'Tap to add a photo'. Barcode lookup
>    is an explicit non-goal (AI-CONTEXT.md §1). Check no other string implies
>    scanning or product identification.
> 2. Phase 3 (§6): the accessibility sweep (accessibilityLabel on every
>    touchable, >=44px targets, status never conveyed by colour alone) and an RTL
>    test asserting "Mark as Finished" calls router.push with
>    { pathname: '/(tabs)/progress', params: { finishProductId: <id> } }.
>    (That pathname becomes '/(tabs)/empties' in Phase 5 — write the test so the
>    path is easy to update, and expect to change it once.)
>    Do NOT add any track() calls — the lib/api hooks already fire
>    inventory_item_added, usage_logged, and focus_product_set, and firing them
>    again double-counts.
> Do NOT start Phase 5 in this session. It is step 4 of a 5-step chain and steps
> 2 and 3 have not merged: app/(tabs)/empties.tsx does not exist yet (Talbia),
> and the centre (+) that sends action=log does not exist yet (Shrey). Repointing
> ItemDetailSheet to '/(tabs)/empties' today would aim my "Mark as Finished"
> button at a route that isn't there. When the phase does open, it is two small
> changes — (a) open the existing FastLogSheet when app/(tabs)/inventory.tsx
> receives action=log, clearing the param on close; (b) change ItemDetailSheet's
> push from '/(tabs)/progress' to '/(tabs)/empties' — and do NOT extract a
> FastLogForm or create app/log.tsx; both are cancelled.
>
> After the two tasks above, continue with Phase 1b: edit, delete, usage history,
> and the "recently used" filter.
>
> The edit, delete, and usage-history work is UNBLOCKED as of 2026-07-27 —
> useUpdateProduct, useDeleteProduct, and useUsageLogs are merged in lib/api.
>
> Confirm the plan and the exact files you'll touch before writing any code. Only
> edit files in my lane (app/(tabs)/inventory.tsx, features/inventory/*,
> .maestro/log-product.yaml); if anything else is needed, stop and output a
> CROSS-LANE REQUEST. Run `npm run verify` at the end and fix until green.
> ```

> Your mission: build the **log → track** half of the core loop — fast-log entry, inventory browse/filter/edit, and one-tap usage logging — so Maya can log a product in ≤15s and check her stash in-store in <1s. You own PRD functions **F1** (log a product), **F2** (update usage / % remaining), and **F9** (check stash in-store), plus matrix rows **4, 9, 16**.
>
> **Scope narrowed 7/21 (DECISIONS.md D20):** you NO LONGER own the finish/celebration flow, the private empties archive, or the **Progress tab** — those moved to **Talbia** (`features/empties/*`, `app/(tabs)/progress.tsx`). You keep only the **finish seam**: a "Mark as Finished" button on your item detail that _navigates_ (expo-router) to Talbia's finish route. You do NOT implement finishing.

---

## 0. STATUS — updated 2026-07-27 against `main` @ `cdd8e1e`

**You have shipped PR #21 and #23.** `npm run verify` is green. Read this before you paste anything below — several phases are partly done, and two instructions further down are now actively wrong.

| Phase                  | Status                   | What's actually on `main`                                                                                                                                                                           |
| ---------------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1a** Fast-log + list | ✅ **Done** (one gap)    | `inventory.tsx` (list, search, status + category filters, loading/empty/error/no-matches), `FastLogSheet`, `InventoryItemCard`, `strings.ts`, 10 tests. **Missing: the "recently used" filter.**    |
| **1b** Detail + usage  | 🟡 **Half done**         | ✅ `ItemDetailSheet` (ring, badges, pin/unpin, Mark as Finished), `UsageLogSheet` (5% steps + note), `useInventoryActions`. ❌ **No edit UI. No delete UI. No usage-history list.**                 |
| **2** Wire real hooks  | ⚪ **Not applicable**    | Shrey already flipped `lib/api` to real Supabase before you started. There is no mock phase to graduate from — **skip Phase 2 entirely**.                                                           |
| **3** Polish           | 🟡 **Started**           | ✅ `.maestro/log-product.yaml` (#23). ❌ a11y sweep, finish-button navigation test. ⚠️ **Do NOT fire analytics — see below.**                                                                       |
| **4** User testing     | ⬜ Not started           | —                                                                                                                                                                                                   |
| **5** Footer (new)     | ⏳ **Waiting on 2 of 5** | Inbound cross-lane request from Shrey — added at the end of §6. **You are step 4.** Aaron's step 1 landed (PR #29); Talbia's `empties.tsx` and Shrey's ⊕ have not. Don't start until Shrey says so. |

**Three corrections to the rest of this document — the world changed under it:**

1. **🔴 Fix this now, it's one line.** `features/inventory/strings.ts` says `scanPlaceholder: 'Tap to scan barcode or take photo'`. **Barcode lookup is a stated non-goal** (AI-CONTEXT §1 lists it under "do not generate code for these, even if asked casually") and §8 below says the zone must never claim to identify a product. Your _implementation_ is correct — it only toggles a flag — but the _copy_ promises a feature we deliberately don't build. Change it to `'Tap to add a photo'`.
2. **⚠️ Do NOT call `track()`.** Phase 3 below tells you to fire `inventory_item_added` and `usage_logged`. **Both already fire inside the `lib/api` hooks.** Firing them again double-counts every event. Aaron hit this and correctly skipped it. Phase 3's paste block has been corrected.
3. **The finish route changed.** This plan says `router.push('/empties/finish?productId=…')`. You shipped `router.push({ pathname: '/(tabs)/progress', params: { finishProductId: item.id } })` instead — which is **fine and is now the agreed contract** — but Talbia's screen does not read that param yet, so the button currently goes nowhere. It's on her (Phase 3b in her plan), not you. Don't change your call.

**The three hooks you were blocked on shipped 2026-07-27** (§7-F and §7-G, answered):

- **`useUpdateProduct()`** — unblocks edit; your `editAction`/`editTitle`/`saveEdit` strings finally get UI. `'finished'` is **not in the patch type**, so your status picker offering it won't compile; finishing stays Talbia's flow.
- **`useDeleteProduct()`** — unblocks delete. **The FK answer is `on delete cascade`**, on `usage_logs.product_id` _and_ `empties.product_id`, so a delete takes the usage history and any empties entry with it. Write the confirmation copy to match; §8's hook table has the details.
- **`useUsageLogs(productId?, {limit?})`** — unblocks the usage-history list _and_ the "recently used" filter. Aaron uses the same hook from Home.

**Undeclared overlap worth settling:** you shipped Focus Pot pin/unpin, but **F3 / matrix row 8 is Aaron's**, and he shipped it too. No file conflict — you both call the shared `useTogglePriority` — and two entry points is defensible UX. Just get it ratified rather than leaving it accidental.

**Deviations from this plan that are fine, recorded so nobody "fixes" them:** you used `ProductSearch` directly instead of building a `ProductSearchField` wrapper (better); filtering lives inline in the screen instead of a `useInventoryFilters` hook (extract it when "recently used" lands, so it's unit-testable); your components are named `FastLogSheet`/`ItemDetailSheet`/`UsageLogSheet` rather than `LogModal`/`ProductDetail`/`UsageLogger`.

---

## 1. Your lane

| ✅ OWN & edit freely                                                  | 📥 Import but NEVER edit                                                                                             | ⛔ Forbidden (not yours)                                                                                                                      |
| --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/(tabs)/inventory.tsx`                                            | `components/ui/*` (Shrey — Button, Input, Card, Modal, EmptyState, ErrorState, Chip, etc.) **incl. `ProductSearch`** | `app/(tabs)/progress.tsx` — **Talbia now (was yours; moved 7/21)**                                                                            |
| `features/inventory/*` (components, hooks, `strings.ts`, `__tests__`) | `lib/api/*` hooks — `useProducts`, `useCatalogSearch`, `log_usage`, `track` (Shrey)                                  | `features/empties/*` — **Talbia now (finish flow, celebration, review, private archive)**                                                     |
| `.maestro/log-product.yaml`                                           | `mocks/types.ts` and `mocks/*` fixtures (Shrey)                                                                      | `app/(tabs)/index.tsx`, `features/home/*` (Aaron); `components/ProgressRing.tsx` (Aaron)                                                      |
|                                                                       | `theme/*` NativeWind tokens (Shrey)                                                                                  | `app/(tabs)/wishlist.tsx`, `features/wishlist/*` (Joon)                                                                                       |
|                                                                       |                                                                                                                      | `app/_layout.tsx`, `app/(auth)/*`, `app/(tabs)/you.tsx`, `supabase/*`, `types/database.ts`, `lib/*`, `theme/*`, `docs/*`, `scripts/*` (Shrey) |

**Golden rule:** if a task needs a change to anything in the middle or right columns, STOP and file a CROSS-LANE REQUEST (see §7). Do not edit it yourself, even "just a little." In particular: **you never edit `progress.tsx` or `features/empties/*` anymore** — your only touchpoint with the finish flow is a navigation call.

---

## 2. How to use this plan (non-coder)

1. You will paste the fenced **"Paste this to your agent:"** block for one phase into your AI coding agent (Claude Code / Codex / Antigravity). One phase = one branch = one PR.
2. Paste the block **exactly as written**. It already names the files, hooks, tokens, and states your agent must use, and it tells the agent to stop if it needs to touch someone else's files.
3. When the agent finishes, run the **Verify** commands in your terminal and click through what the "what to click" list says. If anything is red or missing, paste the error back to the agent and ask it to fix — do not edit code by hand.
4. Check off every box in **Done when** before you open a PR. If you cannot check a box, the phase is not done.
5. If the agent ever prints a block titled **CROSS-LANE REQUEST**, it has correctly hit a wall. Copy that block into the team Slack channel and tag Shrey — do NOT tell the agent to "just do it anyway."
6. Never let the agent run `git push --force`, `git merge`, or commit to `main`. If it offers, say no.

---

## 3. Before you start (one-time)

1. Confirm **Shrey's Phase 0 has merged to `main`** (the app scaffold, `theme/`, `components/ui/*` incl. `ProductSearch`, `lib/api/*` mock hooks, `mocks/types.ts`). Ask in Slack: "Is Phase 0 merged?" If no, you cannot start — wait. (See §4.)
2. **Agree the finish route with Talbia + Shrey before Phase 1b.** Your item detail's "Mark as Finished" button must `router.push` to the route Talbia registers for her finish screen (planned: `/empties/finish?productId=<id>`). Confirm the exact path + param name in Slack so your navigation call matches her screen. (See §7-B.)
3. Install the tools once: Node LTS, `npm install` in the repo root, the Expo Go app on your phone or an iOS/Android simulator, and the Maestro CLI (`curl -fsSL https://get.maestro.mobile.dev | bash`).
4. Learn the four commands you'll live in:
   - `git checkout main && git pull` — get the latest.
   - `git checkout -b feat/matt/<slug>` — start a phase branch.
   - `npm run verify` — the gate (tsc + eslint + prettier + jest). Must be green before every PR.
   - `npm run start` (or `npx expo start`) — run the app to click through it.
5. Read `docs/mockups/log-modal.png` (your fast-log ground truth) — keep it open while you work. Skim `docs/DESIGN-TOKENS.md` §Tokens so you can tell the agent which token name to use if it hardcodes a color.

---

## 4. Dependencies & sequencing

- **Wait for Shrey's Phase 0 merge before writing any code.** Everything you import (`components/ui/*` incl. `ProductSearch`, `theme/*`, `lib/api/*`, `mocks/types.ts`) is created there. Starting early means building against files that don't exist yet.
- **Build against mocks first (Phase 1).** All your data comes from Shrey's `lib/api/*` hooks — `useProducts`, `useCatalogSearch` — which return `mocks/` fixtures until Shrey's `types/database.ts` lands. **You never call supabase-js and you never write SQL.** When real types land, you re-import and the hook shapes stay the same (Phase 2).
- **The finish button only navigates.** Your "Mark as Finished" button calls `router.push('/empties/finish?productId=<id>')` — it does NOT create the empties row, run the celebration, or compute months-in-use. Talbia owns the destination screen and the `finish_product` logic. **Agree the exact route name + param with Talbia and Shrey first** (§3.2, §7-B); if the route isn't registered yet, the button is still safe to ship (it just navigates to Talbia's screen once she lands it).
- **Usage logging shares the `log_usage` hook with Aaron.** Aaron logs usage from Home; you log usage from the inventory item detail. **Same hook in `lib/api`, zero file overlap** — you both import it, neither of you edits it. Do not create your own logging endpoint.
- **Each daily schema merge (Shrey) may regenerate `types/database.ts`.** After a schema merge, `git checkout main && git pull` and re-run `npm run verify` before pushing again.
- **Suggested order:** Phase 1a fast-log & inventory list → Phase 1b item detail + usage logging + finish-seam button → Phase 2 wire real hooks → Phase 3 polish/a11y/analytics/Maestro → Phase 4 user testing. One module per branch/PR, PR ≤~400 lines, commit ~every 30 min.

---

## 5. Backend fields & hooks you use (quick reference)

You never write SQL or call supabase-js. You read/write these shapes **only** through `lib/api/*` hooks. Shapes mirror `docs/DATA-MODEL.md` / `mocks/types.ts`.

**`products` columns you touch:**

| Field                | Type  | Notes                                                                     |
| -------------------- | ----- | ------------------------------------------------------------------------- |
| `brand`              | text  | required                                                                  |
| `name`               | text  | required                                                                  |
| `shade`              | text? | optional; may override catalog                                            |
| `category`           | enum  | `lip \| face \| eye \| skincare \| fragrance \| hair \| other` — required |
| `format`             | enum  | `full \| mini \| sample` (toggle in log modal)                            |
| `status`             | enum  | `unopened \| in_rotation \| finished`                                     |
| `percent_remaining`  | int   | 0–100, honor-system, **5% steps**                                         |
| `photo_url`          | text? | from "Tap to scan" photo attach or a progress photo                       |
| `pao_months`         | int?  | `6` or `12` (PAO; optional by design)                                     |
| `opened_at`          | date? | optional                                                                  |
| `is_priority`        | bool  | Focus Pot flag (max 5 per user, enforced backend-side)                    |
| `catalog_product_id` | uuid? | set when chosen from catalog; null if manual                              |

**`usage_logs` columns (created by the log hook — each log is its own row, never overwrite):** `percent_after` (int 0–100), `note` (text?), `photo_url` (text?), `logged_at` (timestamptz).

**Hooks (import, never edit) — CORRECTED 7/27 to match what actually exists.** The method-bag shape this section originally described (`useProducts().create/.update/.remove/.logUsage`) never existed. `useProducts` is a plain read query and every mutation is its own top-level hook:

| Hook                                     | Shape                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Status                 |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| `useProducts(filters?)`                  | read query → `Product[]`; filters `{status?, category?, is_priority?}`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | ✅ you use it          |
| `useCreateProduct()`                     | mutation; arg is `Omit<Product,'id'\|'user_id'\|'created_at'>` — **every key required**, pass explicit `null`s for optionals                                                                                                                                                                                                                                                                                                                                                                                                                                    | ✅ you use it          |
| `useLogUsage()`                          | mutation `{productId, percentAfter, note?, photoUrl?}` — the same hook Aaron calls                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | ✅ you use it          |
| `useTogglePriority()`                    | mutation `{productId, isPriority}`; the 6th pin is rejected by the DB trigger                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | ✅ you use it          |
| `useCatalogSearch(q, category?, limit?)` | read query → `CatalogProduct[]`; `components/ui/ProductSearch` already wraps it                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | ✅ via `ProductSearch` |
| `useUpdateProduct()`                     | mutation `{productId, patch}` where `patch: ProductPatch` = partial over `brand, name, shade, category, format, status, percent_remaining, photo_url, pao_months, opened_at`. `percent_remaining` is a direct correction — it writes **no** `usage_logs` row. `ProductPatch['status']` **excludes `'finished'`** — passing it is a `tsc` error, and a runtime throw backstops casts. Finishing goes through Talbia's flow so the empties archive + verdict are written. Omit `finished` from your edit UI's status options; it stays a valid **display** status | ✅ merged 2026-07-27   |
| `useDeleteProduct()`                     | mutation `{productId}`. **Cascades:** `usage_logs.product_id` and `empties.product_id` are both `on delete cascade`, so the item's whole usage history — and its private empties entry + repurchase verdict, if it was ever finished — go with it. Write the confirmation copy accordingly                                                                                                                                                                                                                                                                      | ✅ merged 2026-07-27   |
| `useUsageLogs(productId?, {limit?})`     | read query → `UsageLog[]`, newest first. Pass an id for one item's history; omit it for all of the user's logs (that's Aaron's Home usage). RLS scopes the read — no owner filter needed                                                                                                                                                                                                                                                                                                                                                                        | ✅ merged 2026-07-27   |

**`track()` lives in `lib/analytics.ts`, not `lib/api`** — and you should not call it at all. `useCreateProduct` already fires `inventory_item_added`; `useLogUsage` already fires `usage_logged`; `useTogglePriority` already fires `focus_product_set`. Calling them yourself double-counts.

**Design tokens:** PanPal Rose is the **`primary-container`** token. There is **no `brand` token** — and `primary` is `#8c4c4d`, a deep mauve, so `bg-primary` silently gives you the wrong colour.

> Not yours anymore: `useEmpties`, `finish_product`, `useDashboard`, `ProgressRing` — those belong to Talbia's finish/Progress work. Do not import or call them.

---

## 6. Phases

### Phase 1a — Fast-log modal + inventory list (F1, F9 / rows 4, 16)

**Goal:** Maya can open the fast-log, add an owned product (catalog pre-fill or manual) in ≤15s, and see it in a searchable, filterable inventory list. Everything reads/writes through mock hooks.

**Paste this to your agent:**

```
You are building the PanPals inventory feature (Matt's lane). Read AI-CONTEXT.md
and docs/DESIGN-TOKENS.md first. Stack: Expo SDK 53+, React Native, TypeScript
strict, expo-router, NativeWind (tokens ONLY — never hardcode a hex, font, or
radius; use theme/ token classes), Zustand for local UI state, TanStack Query
via the existing lib/api hooks. Do NOT call supabase-js. Do NOT write SQL.

Build the fast-log modal and the inventory list:

1. app/(tabs)/inventory.tsx — screen shell: an inventory list plus a primary
   "Log Item" pill button that opens the fast-log modal. Handle loading, empty
   ("No products yet — log your first"), and error states using
   components/ui/EmptyState and ErrorState.
2. features/inventory/components/LogModal.tsx — matches docs/mockups/log-modal.png
   EXACTLY. Fields: "Tap to scan" photo-attach zone at top (Wizard-of-Oz — it
   opens the camera / image picker to attach a photo ONLY; NO product
   identification, NO barcode, NO AI), brand, name, category (enum: lip, face,
   eye, skincare, fragrance, hair, other), shade, amount-remaining, and a
   format toggle (full / mini / sample). REQUIRED = brand + name + category.
   shade and amount-remaining are ENCOURAGED but OPTIONAL. Allow saving a
   partial entry. Use components/ui primitives (Input, Button, Modal, Chip).
3. features/inventory/components/ProductSearchField.tsx — a thin wrapper that
   reuses Shrey's ProductSearch from components/ui and calls useCatalogSearch;
   selecting a catalog result pre-fills brand/name/shade/category. Manual entry
   is always available as fallback.
4. features/inventory/components/InventoryList.tsx + ProductListItem.tsx — list
   with a search box and filters: category, status (active/focus/finished),
   and "recently used". Filtering must return in <1s.
5. features/inventory/hooks/useInventoryFilters.ts — Zustand or local state for
   the search text + active filters; pure filter logic (unit-testable).
6. features/inventory/strings.ts — ALL user-visible copy here (no inline
   literals in JSX). Tone: calm, non-judgmental, second person.
7. Save via the existing lib/api useProducts().create hook (mock-backed). Every
   touchable gets an accessibilityLabel. Never convey status by color alone (add
   a text label or icon).

Only edit files under my lane (app/(tabs)/inventory.tsx, features/inventory/*);
if anything else is needed output a CROSS-LANE REQUEST and stop. Import
components/ui/* (incl. ProductSearch), lib/api/* (useProducts, useCatalogSearch,
track), mocks/types.ts, and theme/* but NEVER edit them.
```

**Files created:** `app/(tabs)/inventory.tsx`, `features/inventory/components/LogModal.tsx`, `features/inventory/components/ProductSearchField.tsx`, `features/inventory/components/InventoryList.tsx`, `features/inventory/components/ProductListItem.tsx`, `features/inventory/hooks/useInventoryFilters.ts`, `features/inventory/strings.ts`, `features/inventory/__tests__/useInventoryFilters.test.ts`.

**Verify:**

- Run `npm run verify` — must be all green (tsc, eslint, prettier, jest).
- Run `npm run start`, open the app, go to the **Inventory** tab.
- Click: "Log Item" → modal matches `log-modal.png` → type a brand in the search field → pick a catalog result → confirm brand/name/shade/category pre-fill → toggle format to "mini" → leave shade blank → Save → the item appears in the list.
- Click: type in the list search box and toggle each filter (category, status, recently used) → results update instantly.
- Confirm the "Tap to scan" zone only attaches a photo and never claims to identify the product.

**Done when:**

- [ ] `npm run verify` passes.
- [ ] Fast-log adds a product in ≤15s with only brand+name+category filled.
- [ ] Catalog search pre-fills fields; manual entry still works with no match.
- [ ] Format toggle (full/mini/sample) works; partial save works.
- [ ] Inventory list search + all three filters work and return <1s.
- [ ] Loading, empty, and error states all render.
- [ ] No hardcoded hex/font/radius; all strings in `strings.ts`; every touchable has an `accessibilityLabel`.
- [ ] `git diff --name-only main` shows only files in my lane.

---

### Phase 1b — Item detail, edit, delete, usage logging + finish-seam button (rows 9, 16 / F2, F9)

**Goal:** Tap a product → see its detail, edit fields, correct % remaining, log usage in one tap (or a 5% slider) via the shared `log_usage` hook, view usage history, delete safely — and a "Mark as Finished" button that **navigates** to Talbia's finish flow (you do NOT implement finishing).

> **✅ Already shipped in PR #21:** `ItemDetailSheet.tsx` (ring, status/category/format badges, pin/unpin, "Log usage", "Mark as Finished"), `UsageLogSheet.tsx` (5% steps, optional note, clamped 0–100), `useInventoryActions.ts`, `daysSinceOpened.ts`, and the finish-seam navigation. **Do not rebuild any of it.**
>
> **❌ Still to do: edit, delete, usage history.** The three hooks these needed are **merged as of 2026-07-27** — build against them, and still do not call supabase-js or add a hook to `lib/api` yourself.

**Paste this to your agent (`useUpdateProduct`, `useDeleteProduct`, and `useUsageLogs` are merged):**

```
Continue the PanPals inventory feature (Matt's lane). Same rules as before:
NativeWind tokens only, no hardcoded hex/font/radius, no supabase-js, no SQL,
all copy in features/inventory/strings.ts, all touchables get accessibilityLabel,
handle loading/empty/error. Import lib/api hooks; never edit them.

ALREADY BUILT — read these first and extend them, do NOT recreate them:
features/inventory/components/ItemDetailSheet.tsx, UsageLogSheet.tsx,
InventoryItemCard.tsx, FastLogSheet.tsx, hooks/useInventoryActions.ts,
utils/daysSinceOpened.ts, strings.ts.

Add the three missing pieces to the EXISTING ItemDetailSheet:

1. Usage history. Call the new useUsageLogs(productId) read hook and render each
   usage_log as its own row (percent_after + logged_at + note if present),
   newest first. Each log is a separate row — history is never overwritten.
   Handle loading / empty ("No uses logged yet") / error inline.
2. Edit. An edit mode reusing the FastLogSheet form fields, letting the user
   change brand, name, shade, category, format, status, pao_months, opened_at,
   and CORRECT percent_remaining directly. Save via the new useUpdateProduct
   hook. The strings already exist in strings.ts: logSheet.editTitle,
   logSheet.saveEdit, detailSheet.editAction — use them, they are currently
   dead keys.
3. Delete, via the new useDeleteProduct hook, behind a confirmation dialog.
   Calm, non-judgmental copy. IMPORTANT: only state that usage history is
   preserved if Shrey has confirmed the usage_logs.product_id FK does not
   cascade. If he has not confirmed it, write neutral copy that makes no claim
   either way and ask me to check.

Also add the missing third inventory filter from Phase 1a: "recently used",
derived from the usage-log data. While you are there, extract the search +
filter logic out of app/(tabs)/inventory.tsx into
features/inventory/hooks/useInventoryFilters.ts as pure, unit-testable
functions, and add tests for it.

Do NOT touch the "Mark as Finished" button — it already navigates correctly to
Talbia's screen and that contract is agreed. Do NOT import useEmpties,
useFinishProduct, useDashboard, or ProgressRing. Do NOT create any file under
features/empties/*. Do NOT call track() — the lib/api hooks already fire
inventory_item_added, usage_logged, and focus_product_set.

Only edit files under my lane (app/(tabs)/inventory.tsx, features/inventory/*);
if anything else is needed output a CROSS-LANE REQUEST and stop. Import
components/ui/*, lib/api/*, mocks/types.ts, and theme/* but NEVER edit them.
Run `npm run verify` and fix until green.
```

**Files created:** `features/inventory/components/ProductDetail.tsx`, `features/inventory/components/EditProductForm.tsx`, `features/inventory/components/UsageLogger.tsx`, `features/inventory/hooks/useProductDetail.ts`, `features/inventory/__tests__/useProductDetail.test.ts`. (Add detail + finish-button strings to the existing `features/inventory/strings.ts`.)

**Verify:**

- `npm run verify` green.
- `npm run start` → Inventory → tap a product → detail opens.
- Click: "Log a use" once → % drops one step and a new row appears in usage history; drag the slider to a specific % and log with a photo → history shows both entries (old one preserved).
- Click: edit → change the name and correct % remaining → save → detail reflects it.
- Click: delete → confirmation appears and its copy says the item's usage history goes with it (see the cascade note in §8) → confirm → item leaves the list.
- Click: "Mark as Finished" → the app **navigates** to Talbia's finish route (`/empties/finish?productId=...`). Confirm your screen did NOT try to finish, celebrate, or archive anything itself. (If Talbia's screen isn't merged yet, you'll land on a not-found/placeholder — that's expected; the navigation call is what you're verifying.)

**Done when:**

- [ ] `npm run verify` passes.
- [ ] Usage logging works one-tap AND via 5% slider with optional photo, through the shared `log_usage` hook (no duplicate hook created).
- [ ] Each log is a new row; history is never overwritten.
- [ ] Edit saves all fields and % correction.
- [ ] Delete has a confirmation that states usage history is not silently removed.
- [ ] "Mark as Finished" ONLY calls `router.push` to the agreed finish route; my lane contains no finish/celebration/archive logic and no `features/empties/*` files.
- [ ] Loading/empty/error states; tokens only; strings in `strings.ts`; a11y labels present.
- [ ] `git diff --name-only main` shows only my-lane files.

---

### Phase 2 — Wire real hooks

**Goal:** When Shrey's `types/database.ts` lands and he flips `lib/api/*` from fixtures to real Supabase, your screens keep working with zero UI rewrites.

**Paste this to your agent:**

```
Continue Matt's lane. Shrey has flipped lib/api hooks (useProducts,
useCatalogSearch, log_usage) from mocks to real Supabase, and types/database.ts
is now generated. Re-run against real data. Do NOT call supabase-js directly and
do NOT write SQL — only consume the lib/api hooks. Update any type imports from
mocks/types.ts to types/database.ts IF AND ONLY IF Shrey's hooks now export from
there; otherwise leave them. Fix any type mismatches surfaced by tsc in MY files
only. Verify optimistic updates / loading / error states still behave with real
latency. The "Mark as Finished" button still ONLY navigates — do not add finish
logic.

Only edit files under my lane (app/(tabs)/inventory.tsx, features/inventory/*);
if anything else is needed output a CROSS-LANE REQUEST and stop.
```

**Files created:** none new — edits to existing lane files only.

**Verify:** `npm run verify` green; `npm run start` and repeat the Phase 1a/1b click-throughs against real data (log, filter, log usage, edit, delete, finish-button navigates). Confirm data persists across app reload.

**Done when:**

- [ ] `npm run verify` passes with `types/database.ts` present.
- [ ] All Phase 1 flows work against real hooks; data persists on reload.
- [ ] "Mark as Finished" still only navigates to Talbia's route.
- [ ] Still no direct supabase-js calls and no SQL in my files.

---

### Phase 3 — Polish: states, a11y, analytics, Maestro

**Goal:** Every screen has clean loading/empty/error states, full accessibility, the two analytics events fire, and the Maestro flow passes.

**Paste this to your agent:**

> **✅ Already shipped:** `.maestro/log-product.yaml` (PR #23) and 10 RTL tests covering the card, the fast-log save path, opened_at, and the 5% usage stepper.
>
> **⚠️ The original version of this block told you to fire `track()`. Do not.** `useCreateProduct`, `useLogUsage`, and `useTogglePriority` already fire `inventory_item_added`, `usage_logged`, and `focus_product_set` from inside `lib/api`. Calling `track()` yourself double-counts every event.

```
Polish Matt's lane. Do NOT call track() — the lib/api hooks already fire
inventory_item_added, usage_logged, and focus_product_set internally, and
firing them again double-counts. product_finished belongs to Talbia.

1. FIX FIRST, one line: features/inventory/strings.ts currently reads
   scanPlaceholder: 'Tap to scan barcode or take photo'. Barcode lookup is an
   explicit non-goal (AI-CONTEXT.md §1). Change it to 'Tap to add a photo' and
   check no other string implies scanning or product identification.
2. Audit every screen in my lane for loading / empty / error states and for
   accessibilityLabel on every touchable. Status must never be conveyed by
   colour alone — the badges must carry text. Check tap targets are >= 44px.
3. Add RTL tests in features/inventory/__tests__ for: the status and category
   filters narrowing the list, the PAO/status labels rendering, and that
   "Mark as Finished" calls router.push with
   { pathname: '/(tabs)/progress', params: { finishProductId: <id> } }
   (mock expo-router — do NOT test the finish flow itself, that is Talbia's).
   Mock the lib/api hooks — never hit Supabase in Jest.

.maestro/log-product.yaml already exists — re-run it, don't rewrite it.

Only edit files under my lane (app/(tabs)/inventory.tsx, features/inventory/*,
.maestro/log-product.yaml); if anything else is needed output a CROSS-LANE
REQUEST and stop. Run `npm run verify` and fix until green.
```

**Files created:** `.maestro/log-product.yaml`, expanded `__tests__` in `features/inventory/`.

**Verify:**

- `npm run verify` green.
- `maestro test .maestro/log-product.yaml` passes.
- Manually turn on the OS screen reader briefly and tab through Inventory/detail — every control is announced.

**Done when:**

- [ ] `npm run verify` passes; `.maestro/log-product.yaml` passes locally.
- [ ] `inventory_item_added` and `usage_logged` fire via `track()`; `product_finished` is NOT fired from my lane; no raw review text/notes logged.
- [ ] Every screen has loading/empty/error; status never conveyed by color alone.
- [ ] RTL tests cover filters, usage-history append, and the finish-button navigation.

---

### Phase 4 — User testing support

**Goal:** Your flows are ready for the moderated sessions (5–8 MBA testers). No new code unless testing surfaces a bug.

**Paste this to your agent (only if a bug is found):**

```
A user test surfaced this bug in Matt's lane: <paste exact steps + what happened
vs expected>. Fix it in my lane only (app/(tabs)/inventory.tsx,
features/inventory/*, .maestro/log-product.yaml), add a regression test in
features/inventory/__tests__, keep tokens/strings/a11y rules. If anything else is
needed output a CROSS-LANE REQUEST and stop.
```

**Verify:** `npm run verify` green; re-run `.maestro/log-product.yaml`; re-time the fast-log against the ≤15s median target.

**Done when:**

- [ ] Fast-log median ≤15s in testing; no regressions; `npm run verify` green.

---

### Phase 5 — Footer realignment: your fast-log becomes the ⊕ Log destination (NEW, 7/27 — **revised 7/27, read this version**)

> **⚠️ This phase was rewritten and got much smaller.** An earlier draft asked you to
> extract a `FastLogForm` component out of `FastLogSheet` so a new `app/log.tsx` screen
> could render it. **That is cancelled — do not do it.** Shrey re-audited against `main`
> and dropped the separate screen: the ⊕ now opens the `FastLogSheet` you already
> shipped. No extraction, no refactor, no new component. Two small changes instead.

> ### 📥 INBOUND CROSS-LANE REQUEST — from Shrey (2026-07-27), footer audit
>
> ```
> CROSS-LANE REQUEST — from Shrey (navigation/IA) to Matt
> The bottom nav is becoming: Home | Inventory | ⊕ Log | Wishlist | Empties.
> I am NOT building a separate log screen. The centre ⊕ pushes to:
>     router.push({ pathname: '/(tabs)/inventory', params: { action: 'log' } })
> so it opens the FastLogSheet you already shipped — same pattern your own
> ItemDetailSheet already uses to pass finishProductId across a lane boundary.
>
> Two things in app/(tabs)/inventory.tsx, both small:
>
>   1. Read the param and open the sheet (~4 lines). You already have isLogOpen
>      state at line 25:
>        const { action } = useLocalSearchParams<{ action?: string }>();
>        useEffect(() => { if (action === 'log') setIsLogOpen(true); }, [action]);
>      Clear the param when the sheet closes — router.setParams({ action: undefined })
>      — otherwise tapping ⊕ while already on Inventory won't reopen it.
>
>   2. Repoint the finish seam. ItemDetailSheet.tsx:53 pushes to '/(tabs)/progress'.
>      Talbia is renaming that file to empties.tsx behind a temporary shim, so the
>      old path works only until she deletes the shim. Change it to '/(tabs)/empties'.
>      This one is load-bearing: if the shim dies before your change lands, your
>      "Mark as Finished" button navigates to a dead route and F6 stops working in a
>      production build.
>
> Nothing else changes. Your "Log a product" button on the Inventory screen stays —
> two entry points to logging is fine and probably good.
> ```

**Goal:** the fast-log sheet becomes reachable from anywhere via the centre ⊕, and the finish seam survives the tab rename.

**Why this is small for you:** you already built everything. `isLogOpen` exists; `FastLogSheet` works; the param-passing convention is one you introduced. This is roughly six lines across two files.

**Sequencing — you are step 4 of 5, and step 5 depends on you.** Aaron → Talbia → Shrey's nav PR → **you** → Talbia deletes the shim. Your PR must land **before** Talbia's shim deletion. Tell the channel when it's up.

**Status 2026-07-28 (`main` @ `bbf7605`): ✅ Aaron done (PR #29) · 🟡 Talbia pending · ⬜ Shrey pending · ⬜ you · ⬜ Talbia's shim deletion.** Both of your changes need the earlier steps on `main` first — `'/(tabs)/empties'` has to exist before you point at it, and `action=log` has to be sent before you can test receiving it. Wait for Shrey's go-ahead.

**Paste this to your agent:**

```
Continue the PanPals inventory feature (Matt's lane). Same rules as before.

Shrey shipped a centre "⊕ Log" tab. It does NOT have its own route — it pushes to
my Inventory tab with a param, and I open my existing sheet. Two changes only.

1. app/(tabs)/inventory.tsx — open FastLogSheet from a route param.
   Read it with useLocalSearchParams<{ action?: string }>() from expo-router.
   When action === 'log', set the EXISTING isLogOpen state to true.
   When the sheet closes, clear the param (router.setParams({ action: undefined }))
   so tapping ⊕ again from the Inventory tab reopens the sheet instead of doing
   nothing. Do not add a second piece of state and do not change FastLogSheet.

2. features/inventory/components/ItemDetailSheet.tsx line ~53 — the "Mark as
   Finished" push currently targets '/(tabs)/progress'. Talbia renamed that screen
   to app/(tabs)/empties.tsx. Change the pathname to '/(tabs)/empties'. Keep the
   params exactly as they are: { finishProductId: item.id }. Do not change the
   param name — Talbia reads it.

Do NOT extract a FastLogForm component. Do NOT create app/log.tsx. An earlier
version of this plan asked for both; they are cancelled.

Add tests: navigating to Inventory with action=log opens the sheet; closing it
clears the param; the Mark as Finished button pushes to '/(tabs)/empties' with
finishProductId.

Only edit files under my lane (app/(tabs)/inventory.tsx, features/inventory/*).
Do NOT touch app/(tabs)/_layout.tsx, app/(tabs)/empties.tsx, or components/ui —
those are Shrey's and Talbia's. If anything else is needed output a CROSS-LANE
REQUEST and stop. Run `npm run verify` and fix until green.
```

**Verify:** sign in (there is no mock data any more), tap the ⊕ from Home — you land on Inventory with the fast-log sheet open. Close it, tap ⊕ again from Inventory — it reopens. Open an item and tap "Mark as Finished" — you land on the Empties tab and Talbia's finish flow starts.

**Done when:**

- [ ] Tapping ⊕ from any tab opens `FastLogSheet` over the Inventory screen.
- [ ] Tapping ⊕ **while already on Inventory** reopens the sheet (the param is cleared on close).
- [ ] `ItemDetailSheet` pushes to `/(tabs)/empties` with `finishProductId` unchanged.
- [ ] No `FastLogForm` was extracted and no `app/log.tsx` was created.
- [ ] `npm run verify` green; all prior tests still pass; only my-lane files changed.
- [ ] Told the channel the PR is up, so Talbia can delete her shim behind it.

---

## 7. Cross-lane requests you'll likely need (pre-written)

Copy the relevant block into Slack and tag the named owner. Do NOT implement these yourself.

**A. ProductSearch reuse (Shrey — `components/ui/*`)**

```
CROSS-LANE REQUEST — to Shrey (components/ui)
Need: confirm the reusable ProductSearch primitive (type-ahead over
useCatalogSearch that emits a selected catalog_product) and its export + props,
so my fast-log ProductSearchField can reuse it instead of rebuilding search.
Why: F1 catalog pre-fill; avoids duplicating catalog-search UI in my lane.
```

**B. Finish route contract (Talbia — `features/empties/*`, `app/(tabs)/progress.tsx`; cc Shrey — routing)**

```
CROSS-LANE REQUEST — to Talbia (finish flow) + Shrey (routing)
Need: confirm the exact expo-router path and param for your finish screen so my
inventory item detail's "Mark as Finished" button navigates correctly. Proposed:
router.push('/empties/finish?productId=<uuid>'). Please confirm the path segment
and the param name (productId?), and that your screen reads it to load the right
product and run finish_product. I own ONLY the button + navigation; you own the
finish/celebration/review/archive screen. Neither of us edits the other's files.
```

**F. Update + delete product hooks (Shrey — `lib/api/*`) — BLOCKING Phase 1b, file this now**

```
CROSS-LANE REQUEST — to Shrey (lib/api)
Need two mutations that don't exist yet, blocking the edit and delete halves of
my Phase 1b:
  1. useUpdateProduct() — takes a product id + a PARTIAL patch over brand, name,
     shade, category, format, status, percent_remaining, photo_url, pao_months,
     opened_at. I need percent_remaining editable directly so users can correct a
     bad number without logging a fake use.
  2. useDeleteProduct() — deletes a product row.
Also please confirm the ON DELETE behaviour of the usage_logs.product_id FK. My
plan tells me to write delete-confirmation copy saying usage history is not
silently removed, and I don't want to ship a promise the schema doesn't keep.
My strings.ts already has editAction/editTitle/saveEdit committed as dead keys
waiting on this.
```

**G. Usage-log read hook (Shrey — `lib/api/*`) — BLOCKING, and Aaron needs it too**

```
CROSS-LANE REQUEST — to Shrey (lib/api)
Need a useUsageLogs(productId) read hook returning that product's usage_logs
(percent_after, note, photo_url, logged_at), newest first. The RLS select policy
usage_logs_select_own already exists, so this should just be a query.
It blocks three things:
  - the usage-history list on my item detail (Phase 1b item 1)
  - the "recently used" inventory filter (Phase 1a item 4, still missing)
  - Aaron's "Recent progress" section and his weekly checkmark row — his
    useHomeData.ts currently hardcodes recentActivity: [] with a TODO pointing
    at this exact hook, and StreakRow approximates logged days from
    last_log_date because there's no per-day history.
Worth building once for both of us.
```

**C. `log_usage` hook shape (Shrey — `lib/api/*`)**

```
CROSS-LANE REQUEST — to Shrey (lib/api)
Need: confirm the exact signature/return of the shared log_usage hook exposed via
useProducts().logUsage (params: product_id, percent, note, photo_url) — that it
inserts a new usage_log row and updates percent_remaining without overwriting
history. I import it (same hook Aaron uses from Home); I will not write it.
```

**D. products / catalog fields (Shrey — `lib/api/*`, `mocks/types.ts`)**

```
CROSS-LANE REQUEST — to Shrey (lib/api, mocks/types)
Need: confirm useProducts exposes create/update/remove/logUsage and returns the
products fields I render (brand, name, shade, category, format, status,
percent_remaining, photo_url, pao_months, opened_at, is_priority,
catalog_product_id), and that useCatalogSearch(q, category) returns catalog
results for pre-fill. Add any missing field to mocks/types.ts (your lane) — I
import only.
```

**E. Navigation registration (Shrey — `app/_layout.tsx` / `app/(tabs)/_layout.tsx`)**

```
CROSS-LANE REQUEST — to Shrey (app/_layout.tsx)
Need: ensure the Inventory tab is registered in the bottom-tab layout with the
right icon/label. My screen lives at app/(tabs)/inventory.tsx; I cannot edit
_layout.tsx. (The Progress tab is Talbia's now.)
```

---

## 8. Common pitfalls

- **Editing outside your lane.** The #1 project goal is zero merge conflicts. If the agent starts editing `components/ui/*`, `theme/*`, `lib/api/*`, `mocks/*`, or another tab — STOP it and file a CROSS-LANE REQUEST. Check `git diff --name-only main` before every PR.
- **Building the finish flow yourself.** You NO LONGER own finishing, the empties archive, or the Progress tab (Talbia, D20). Your only touchpoint is a `router.push` button. Never create `features/empties/*`, never edit `app/(tabs)/progress.tsx`, never import `useEmpties`, `finish_product`, `useDashboard`, or `ProgressRing`. If the agent tries to add a celebration, review, months-in-use, or archive — stop it and file a CROSS-LANE REQUEST to Talbia.
- **Getting the finish route wrong.** ~~The button must match the path + param Talbia registers (§7-B).~~ **Settled 7/27:** you shipped `router.push({ pathname: '/(tabs)/progress', params: { finishProductId: item.id } })` and the **param name `finishProductId` is the agreed contract** — Talbia reads it (her Phase 3b). Never rename it. **The pathname does change exactly once**, in Phase 5: Talbia renames her screen to `app/(tabs)/empties.tsx`, so `'/(tabs)/progress'` becomes `'/(tabs)/empties'`. Her temporary shim keeps the old path alive until she deletes it, so make the change in Phase 5 and not before — and not after, or the seam breaks a second time.
- **Reintroducing deferred/scanning features.** No barcode, no AI identification — the photo zone only attaches a photo (Wizard-of-Oz). No points, no badges anywhere. **This is currently violated in copy:** `strings.ts` says "Tap to scan barcode or take photo". Fix it (§0).
- **Hardcoding styles.** Never a raw hex, font name, or pixel radius. Use the NativeWind token classes from `theme/`. If the agent writes `#f2a2a2`, tell it to use **`primary-container`** — there is **no `brand` token**, and `primary` is a completely different colour (`#8c4c4d`, deep mauve).
- **Calling `track()` yourself.** The `lib/api` hooks already fire `inventory_item_added`, `usage_logged`, and `focus_product_set`. Adding your own call double-counts.
- **Rebuilding what's already shipped.** Phase 1a and half of 1b are on `main`. Read §0 before pasting any block, and read the existing components before adding to them.
- **Inline strings.** All user-visible copy goes in `features/inventory/strings.ts`. Copy must be calm and non-judgmental — never shame the user.
- **Writing SQL or calling supabase-js.** You never do either. All data goes through `lib/api/*` hooks. If the agent reaches for supabase-js, stop it.
- **Duplicating the usage-logging endpoint.** There is ONE shared `log_usage` hook (you and Aaron both import it). Do not create a second one.
- **Overwriting usage history.** Each usage log is a new row — logging a use never edits an old one. **Deleting a product, however, does cascade-delete its `usage_logs` and any `empties` row** (answered 2026-07-27, see §8). Your confirmation copy must be honest about that; do not promise history survives.
- **Skipping states or a11y.** Every screen needs loading/empty/error; every touchable needs an `accessibilityLabel`; never convey status by color alone.
- **Big PRs / stale branches.** One module per branch, PR ≤~400 lines, commit ~every 30 min, rebase on `main` after each schema merge. Never `git push --force`, never merge, never touch `main`.
