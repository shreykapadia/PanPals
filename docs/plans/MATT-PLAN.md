# Matt's Implementation Plan — Inventory & Logging

> Your mission: build the **log → track** half of the core loop — fast-log entry, inventory browse/filter/edit, and one-tap usage logging — so Maya can log a product in ≤15s and check her stash in-store in <1s. You own PRD functions **F1** (log a product), **F2** (update usage / % remaining), and **F9** (check stash in-store), plus matrix rows **4, 9, 16**.
>
> **Scope narrowed 7/21 (DECISIONS.md D20):** you NO LONGER own the finish/celebration flow, the private empties archive, or the **Progress tab** — those moved to **Talbia** (`features/empties/*`, `app/(tabs)/progress.tsx`). You keep only the **finish seam**: a "Mark as Finished" button on your item detail that *navigates* (expo-router) to Talbia's finish route. You do NOT implement finishing.

---

## 1. Your lane

| ✅ OWN & edit freely | 📥 Import but NEVER edit | ⛔ Forbidden (not yours) |
|---|---|---|
| `app/(tabs)/inventory.tsx` | `components/ui/*` (Shrey — Button, Input, Card, Modal, EmptyState, ErrorState, Chip, etc.) **incl. `ProductSearch`** | `app/(tabs)/progress.tsx` — **Talbia now (was yours; moved 7/21)** |
| `features/inventory/*` (components, hooks, `strings.ts`, `__tests__`) | `lib/api/*` hooks — `useProducts`, `useCatalogSearch`, `log_usage`, `track` (Shrey) | `features/empties/*` — **Talbia now (finish flow, celebration, review, private archive)** |
| `.maestro/log-product.yaml` | `mocks/types.ts` and `mocks/*` fixtures (Shrey) | `app/(tabs)/index.tsx`, `features/home/*` (Aaron); `components/ProgressRing.tsx` (Aaron) |
| | `theme/*` NativeWind tokens (Shrey) | `app/(tabs)/wishlist.tsx`, `features/wishlist/*` (Joon) |
| | | `app/_layout.tsx`, `app/(auth)/*`, `app/(tabs)/you.tsx`, `supabase/*`, `types/database.ts`, `lib/*`, `theme/*`, `docs/*`, `scripts/*` (Shrey) |

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

| Field | Type | Notes |
|---|---|---|
| `brand` | text | required |
| `name` | text | required |
| `shade` | text? | optional; may override catalog |
| `category` | enum | `lip \| face \| eye \| skincare \| fragrance \| hair \| other` — required |
| `format` | enum | `full \| mini \| sample` (toggle in log modal) |
| `status` | enum | `unopened \| in_rotation \| finished` |
| `percent_remaining` | int | 0–100, honor-system, **5% steps** |
| `photo_url` | text? | from "Tap to scan" photo attach or a progress photo |
| `pao_months` | int? | `6` or `12` (PAO; optional by design) |
| `opened_at` | date? | optional |
| `is_priority` | bool | Focus Pot flag (max 5 per user, enforced backend-side) |
| `catalog_product_id` | uuid? | set when chosen from catalog; null if manual |

**`usage_logs` columns (created by the log hook — each log is its own row, never overwrite):** `percent_after` (int 0–100), `note` (text?), `photo_url` (text?), `logged_at` (timestamptz).

**Hooks (import, never edit):**
- `useProducts()` → `.create(...)`, `.update(...)`, `.remove(...)`, `.logUsage(...)` (the last wraps the shared `log_usage` RPC; deleting a product must NOT wipe `usage_logs`).
- `useCatalogSearch(q, category)` → type-ahead results for catalog pre-fill (wraps `search_catalog`); `ProductSearch` in `components/ui` already consumes this.
- `track(event, props)` → analytics; you fire `inventory_item_added` and `usage_logged` (see Phase 3). **Never log raw review text or notes.**

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

**Goal:** Tap a product → see its detail, edit fields, correct % remaining, log usage in one tap (or a 5% slider + optional photo) via the shared `log_usage` hook, view usage history, delete safely — and a "Mark as Finished" button that **navigates** to Talbia's finish flow (you do NOT implement finishing).

**Paste this to your agent:**
```
Continue the PanPals inventory feature (Matt's lane). Same rules as before:
NativeWind tokens only, no hardcoded hex/font/radius, no supabase-js, no SQL,
all copy in features/inventory/strings.ts, all touchables get accessibilityLabel,
handle loading/empty/error. Import lib/api hooks; never edit them.

Build the item detail, editing, usage logging, and the finish-seam button:

1. features/inventory/components/ProductDetail.tsx — shows the product's photo,
   brand/name/shade/category/format, status, and % remaining. Include a usage
   history list (each usage_log is its own row — never overwrite history).
2. Editing: an edit mode (or EditProductForm.tsx) to change any field and to
   CORRECT % remaining directly. Save via the existing lib/api useProducts().update
   hook.
3. features/inventory/components/UsageLogger.tsx — one-tap "Log a use" plus a
   5% slider (5% steps) and an OPTIONAL progress photo. This MUST call the
   SHARED lib/api log_usage hook via useProducts().logUsage (the same hook Aaron
   calls from Home — do not create your own; do not edit it). Logging inserts a
   new usage_log row and updates percent_remaining.
4. Delete: a confirmation dialog before deleting a product. The confirmation
   copy must make clear that deleting does NOT silently remove usage history —
   i.e. deletion must not silently wipe usage_logs. Use calm, non-judgmental copy.
5. "Mark as Finished" button on ProductDetail — it ONLY navigates. Use
   expo-router: router.push('/empties/finish?productId=' + product.id). It does
   NOT set status=finished, does NOT create an empties row, does NOT show a
   celebration or review, and does NOT compute months-in-use — Talbia's finish
   screen (features/empties/*) does all of that. Do NOT import useEmpties,
   finish_product, useDashboard, or ProgressRing. Do NOT create any file under
   features/empties/*. If the /empties/finish route is not registered yet, the
   button still just navigates — that is correct.
6. features/inventory/hooks/useProductDetail.ts — thin hook composing useProducts
   (+ its logUsage); keep the screen thin.

Only edit files under my lane (app/(tabs)/inventory.tsx, features/inventory/*);
if anything else is needed (including the finish screen or the empties archive)
output a CROSS-LANE REQUEST and stop. Import components/ui/*, lib/api/*
(useProducts, useCatalogSearch, track), mocks/types.ts, and theme/* but NEVER
edit them.
```

**Files created:** `features/inventory/components/ProductDetail.tsx`, `features/inventory/components/EditProductForm.tsx`, `features/inventory/components/UsageLogger.tsx`, `features/inventory/hooks/useProductDetail.ts`, `features/inventory/__tests__/useProductDetail.test.ts`. (Add detail + finish-button strings to the existing `features/inventory/strings.ts`.)

**Verify:**
- `npm run verify` green.
- `npm run start` → Inventory → tap a product → detail opens.
- Click: "Log a use" once → % drops one step and a new row appears in usage history; drag the slider to a specific % and log with a photo → history shows both entries (old one preserved).
- Click: edit → change the name and correct % remaining → save → detail reflects it.
- Click: delete → confirmation appears and its copy says usage history is preserved → confirm → item leaves the list.
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
```
Polish Matt's lane. Fire analytics via the shared lib/api track() helper (never
log raw review text or notes) on exactly these events: inventory_item_added (on
fast-log save) and usage_logged (on a usage log). Do NOT fire product_finished —
that belongs to Talbia's finish flow. Audit every screen for loading/empty/error
states and for accessibilityLabels; never convey status by color alone. Add the
Maestro flow below.

Create .maestro/log-product.yaml — open the log modal, fill brand+name+category,
save, assert the item appears in inventory.

Add/expand RTL tests in features/inventory/__tests__ for: filter results,
PAO/status label, usage log appends a row (history kept), and that the
"Mark as Finished" button calls router.push to the finish route (mock the
router — do NOT test the finish flow itself, that is Talbia's). Mock the lib/api
hooks in tests — never hit Supabase.

Only edit files under my lane (app/(tabs)/inventory.tsx, features/inventory/*,
.maestro/log-product.yaml); if anything else is needed output a CROSS-LANE
REQUEST and stop.
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
- **Getting the finish route wrong.** The button must match the path + param Talbia registers (§7-B). Agree it in Slack before Phase 1b. Hardcoding a guessed path that doesn't match her screen breaks the seam.
- **Reintroducing deferred/scanning features.** No barcode, no AI identification — "Tap to scan" only attaches a photo (Wizard-of-Oz). No points, no badges anywhere.
- **Hardcoding styles.** Never a raw hex, font name, or pixel radius. Use the NativeWind token classes from `theme/`. If the agent writes `#f2a2a2`, tell it to use the `brand` token.
- **Inline strings.** All user-visible copy goes in `features/inventory/strings.ts`. Copy must be calm and non-judgmental — never shame the user.
- **Writing SQL or calling supabase-js.** You never do either. All data goes through `lib/api/*` hooks. If the agent reaches for supabase-js, stop it.
- **Duplicating the usage-logging endpoint.** There is ONE shared `log_usage` hook (you and Aaron both import it). Do not create a second one.
- **Overwriting usage history.** Each usage log is a new row. Deleting a product must not silently wipe `usage_logs`, and the delete confirmation must say so.
- **Skipping states or a11y.** Every screen needs loading/empty/error; every touchable needs an `accessibilityLabel`; never convey status by color alone.
- **Big PRs / stale branches.** One module per branch, PR ≤~400 lines, commit ~every 30 min, rebase on `main` after each schema merge. Never `git push --force`, never merge, never touch `main`.
