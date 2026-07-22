# Joon's Implementation Plan — Wishlist & Impulse Intercept

> **Mission:** Build the calm, non-shaming Wishlist tab that intercepts impulse buys with the user's *own* inventory, holds items in a 14-day cooling-off, and lets them reconsider, manage, and convert purchases into inventory — never policing, never blocking.
>
> **PRD functions owned:** **F5** (Intercept an impulse) and **F7** (Reconsider a wishlist item).
> **Feature-matrix rows owned:** 2 (capture), 3 (prioritize + reflection), 6 (duplicate detection), 7 (impulse pause decision), 13 (reconsideration), 17 (browse & manage), 18 (purchase → inventory conversion), 19 (in-app reminders), 22 (confidence-tiered language).

---

## 1. Your lane

| ✅ OWN & edit (only these) | 📥 Import but NEVER edit | 🚫 Forbidden — never touch |
|---|---|---|
| `app/(tabs)/wishlist.tsx` | `components/ui/*` (Shrey's shared primitives: Button, Card, Chip, Banner, TextInput, etc.) | `app/_layout.tsx`, `app/(auth)/*` (Shrey) |
| `features/wishlist/*` — components, hooks, `strings.ts`, `__tests__/` | `components/ProductSearch` (Shrey's catalog search UI) | `lib/*`, `theme/*`, `mocks/*`, `docs/*` (Shrey) |
| `.maestro/wishlist-intercept.yaml` (your flow only) | `lib/api/*` hooks: `useWishlist`, `useProducts`, `useCatalogSearch`, and the similar-owned hook (`useSimilarOwned`) | `supabase/*`, `types/database.ts` (Shrey) |
| | `mocks/types.ts` (import types only) | `app/(tabs)/index.tsx`, `features/home/*`, `components/ProgressRing.tsx` (Aaron) |
| | `theme/*` NativeWind tokens (use classNames, never edit) | `app/(tabs)/inventory.tsx`, `features/inventory/*` (Matt); `app/(tabs)/progress.tsx`, `features/empties/*` (Talbia) |

**The golden rule:** if a task seems to need a change to any file in the two right-hand columns, STOP and output a `CROSS-LANE REQUEST` (see §6). Editing another person's file is the #1 thing that breaks this project.

---

## 2. How to use this plan (non-coder)

You will not write code. You paste prompts into your AI coding agent (Claude Code / Codex / Antigravity) and verify what it produces.

1. Work through the phases **in order** (§5). Do not skip ahead — later phases depend on earlier ones.
2. For each phase: copy the entire **"Paste this to your agent"** block verbatim into your agent, including the "Only edit files under my lane…" sentence at the end. That sentence is your safety net.
3. When the agent finishes, run the **Verify** commands, click through what's listed, and check off **Done when**.
4. If the agent ever says it needs to edit a file outside your lane, or you see a file changed that isn't in your ✅ column, stop and post the matching `CROSS-LANE REQUEST` (§6) in the team channel for Shrey.
5. **Commit roughly every 30 minutes** of agent work — small commits are your undo button. Tell the agent: *"Commit the current work with a short message describing what changed."*
6. **Copy tone is sacred.** Claire (our test persona) uninstalls at one shaming word. Every warning must sound like a supportive friend pointing at facts, never a scold. "You already have 4 similar blushes" ✅ / "Stop overspending!" ❌. If any string reads as judgmental, tell the agent to rewrite it softer.

---

## 3. Before you start (one-time)

1. Confirm the repo runs: open a terminal in the project folder and run `npm install`, then `npm run verify`. It should pass on a clean `main`. If it doesn't, that's a Shrey/Phase-0 problem — post in the channel, don't try to fix it.
2. Install the Maestro CLI (free) so you can run E2E flows locally on a simulator. Ask the channel for the team's setup notes if unsure.
3. Open `docs/mockups/wishlist-intercept.png` and keep it visible — it is the **ground truth** for the intercept banner. Match its layout; DESIGN-TOKENS.md wins on any color/spacing value.
4. Read the tone examples in AI-CONTEXT.md §5 and Claire's section in PERSONAS.md once. That's the bar for every string you ship.
5. **Do not start building until Shrey announces Phase 0 (foundation) is merged to `main`** (see §4).

---

## 4. Dependencies & sequencing

- **Wait for Shrey's Phase 0 merge first.** You cannot build until `components/ui/*`, `theme/*`, `mocks/types.ts`, the `lib/api/*` hook stubs, and the `track()` helper exist on `main`. Shrey announces this. Building before it lands guarantees conflicts and broken imports.
- **Build against mocks (Phase 1).** All data comes through `lib/api/*` hooks that return fixtures until `types/database.ts` lands: `useWishlist` (list/add/edit/remove/restore/purchase), `useCatalogSearch` (type-ahead pre-fill), `useProducts` (for the conversion hook), and the **similar-owned hook** (`useSimilarOwned`, wraps the `find_similar_owned` RPC → count + list of active owned items in a category). You import and call these; you never write SQL and never call `supabase-js`.
- **Two shared seams you consume, never build:**
  - **`find_similar_owned` / `useSimilarOwned`** — powers the intercept (rows 6, 7, 22). Consume it via `lib/api`. If the hook doesn't exist yet, mock a local wrapper that returns a hardcoded fixture shape and file a **CROSS-LANE REQUEST** (§6).
  - **Wishlist → inventory conversion** — a shared `lib/api` hook (e.g. `useProducts().createFromWishlist`). This creates the inventory `product` for you so you never touch Matt's inventory files. If it doesn't exist, mock it and file a **CROSS-LANE REQUEST** (§6).
- **Rebase after every schema merge.** Shrey's schema PRs merge first each day; after each, run `git checkout main && git pull`, rebase your branch, and re-import from the regenerated types. Shrey merges at 12pm and 9pm.
- **Phase 2** swaps mocks for real hooks (no UI rewrite — same hook names). **Phase 3** is polish (states, a11y, analytics, Maestro). **Phase 4** is user testing.

---

### Backend fields & hooks you use (quick reference)

You read/write these only through Shrey's `lib/api` hooks — never SQL, never supabase-js.

**Hooks**
- `useWishlist()` → `{ data: WishlistItem[], add(w), update(id, patch), remove(id), restore(id), markPurchased(id), createFromWishlist(id) }`.
- `useSimilarOwned(category, excludeProductId?)` → `{ count, items: Product[] }` (wraps `find_similar_owned` — powers the intercept + confidence-tiered language).
- `useCatalogSearch(q, category?)` → `{ data: CatalogProduct[] }` (wraps `search_catalog`, for pre-fill).

**Columns you touch**
- `wishlist_items`: `id, catalog_product_id?, brand, name, shade?, category, price?, product_url?, photo_url?, priority (high|medium|low), rank_position?, reflection_response?, cooling_off_ends_at (created +14d), reminder_at?, status (cooling|ready|removed|purchased), last_reviewed_at?, created_at`.
- Conversion: `createFromWishlist(id)` sets `wishlist_items.status='purchased'` and creates a `products` row with `source_wishlist_item_id` — you call the hook, never edit inventory files.
- `catalog_products`: `id, brand, name, category, shade_or_variant?, image_url?`.

## 5. Phases

Session start (every phase, every session):
```
git checkout main && git pull && git checkout -b feat/joon/<slug>
```
One module per branch, one PR per branch, PR ≤ ~400 changed lines. Never `git push --force`, never merge, never commit to `main`.

---

### Phase 1a — Wishlist list screen + capture (rows 2, 3, 17)

**Goal:** A working Wishlist tab that lists items and lets the user add one three ways (catalog search, pasted retailer URL for metadata only, or manual entry), set High/Medium/Low priority + optional reflection, and browse/edit/remove/restore — all against mock data. No intercept yet.

**Paste this to your agent:**
```
You are working in the PanPals repo. Read AI-CONTEXT.md and docs/DATA-MODEL.md
first. I own only app/(tabs)/wishlist.tsx and features/wishlist/*.

Build the Wishlist tab and item capture against MOCK DATA:

1. app/(tabs)/wishlist.tsx — thin screen. Renders the wishlist list from the
   useWishlist() hook (import from lib/api). Handle loading, empty, and error
   states using the shared patterns in components/ui/*. Empty state copy:
   supportive, e.g. "Nothing on your wishlist yet. Add something you're
   considering and we'll help you decide."

2. features/wishlist/strings.ts — ALL user-visible strings live here. No inline
   string literals in JSX anywhere. Tone: calm, second person, never shaming.

3. features/wishlist/components/WishlistItemCard.tsx — shows brand, name, shade,
   category, priority chip (High/Medium/Low), days-on-list, and a "similar owned"
   count placeholder. White card, radius >=24, soft shadow, tokens only.

4. features/wishlist/components/AddWishlistItemSheet.tsx — capture flow, must be
   completable in under 1 minute:
   - Tab/segment: "Search catalog" (reuse the shared components/ProductSearch,
     which calls useCatalogSearch — import it, do NOT reimplement search),
     "Paste link" (a URL field; store product_url as metadata only, NO checkout,
     NO fetching), and "Manual".
   - When a catalog item is matched, PRE-FILL brand/name/shade/category; all
     fields remain editable before save.
   - Priority selector: High / Medium / Low (default Medium).
   - Optional reflection prompt field: "Would you still want this in 30 days?"
     stored as reflection_response; editable later.

5. features/wishlist/hooks/useWishlistActions.ts — thin wrappers over useWishlist
   for add / edit / remove / restore. Screens stay thin; logic in hooks.

6. Browse & manage (row 17): filters for priority, category, and status; edit an
   item; remove with an undo/restore affordance.

Use types from mocks/types.ts. Style with NativeWind tokens only — never
hardcode a hex, font, or radius. Every touchable gets an accessibilityLabel.
Add features/wishlist/__tests__/ covering: item renders, priority selector
defaults to Medium, cooling-off/priority stored correctly, filter narrows the
list.

Only edit files under my lane (app/(tabs)/wishlist.tsx, features/wishlist/*); if
anything else is needed output a CROSS-LANE REQUEST and stop.
```

**Files created:**
- `app/(tabs)/wishlist.tsx`
- `features/wishlist/strings.ts`
- `features/wishlist/components/WishlistItemCard.tsx`
- `features/wishlist/components/AddWishlistItemSheet.tsx`
- `features/wishlist/hooks/useWishlistActions.ts`
- `features/wishlist/__tests__/wishlist-capture.test.tsx`

**Verify:**
- Run `npm run verify` — must pass (tsc, eslint, prettier, jest), zero errors.
- Launch the app, open the **Wishlist** tab. Click: add an item via catalog search (fields pre-fill), edit a field before saving, add one via pasted link, add one manually. Set priority to High. Add a reflection answer. Remove an item, then restore it. Apply a category filter.
- Confirm no red/alarm colors and no shaming copy anywhere.

**Done when:**
- [ ] Wishlist tab lists mock items with priority chip + days-on-list.
- [ ] Add flow works via catalog search, pasted URL (metadata only), and manual entry, completable in <1 min.
- [ ] Catalog match pre-fills fields; fields still editable before save.
- [ ] Priority (High/Med/Low, default Medium) and optional reflection saved and editable.
- [ ] Filters (priority, category, status), edit, remove + restore all work.
- [ ] Loading / empty / error states exist. All strings in `strings.ts`. `npm run verify` green.

---

### Phase 1b — Impulse intercept + confidence-tiered language (rows 6, 7, 22)

**Goal:** When the user adds/opens an item, call the similar-owned hook and show the "Hold on" intercept banner that matches `wishlist-intercept.png`: the count and strongest matches of *their own* owned items, WHY each is similar, three actions, and a recorded decision. Buy Now is visually deprioritized but never disabled.

**Paste this to your agent:**
```
You are working in the PanPals repo. Read AI-CONTEXT.md, docs/PRD.md (F5), and
docs/PERSONAS.md (Claire). I own only app/(tabs)/wishlist.tsx and
features/wishlist/*. docs/mockups/wishlist-intercept.png is the ground truth for
this banner — match its layout.

Build the impulse intercept against MOCK DATA:

1. On adding a new wishlist item (and on opening an item detail), call the
   similar-owned hook from lib/api (useSimilarOwned, which wraps the
   find_similar_owned RPC) with the item's category. It returns a count + list of
   the user's active owned products in that category, with a match reason. If the
   hook does not exist yet, create a LOCAL mock wrapper returning a fixture of
   shape { count, items: [{ brand, name, shade, matchReason, confidence }] } and
   note that I must file a CROSS-LANE REQUEST for the real hook.

2. features/wishlist/components/InterceptBanner.tsx — the "Hold on" banner:
   - Only appears when there are similar owned items (per F5: category with >=3
     active owned items). Uses blush/soft-amber tones, NEVER red or alarm styling.
   - Shows the count and the strongest matches, each with a short WHY it's similar
     (e.g. "same category: blush", "same shade family").
   - Copy from strings.ts, calm and supportive. Example headline:
     "You already have {count} similar {category} items in rotation."
   - CONFIDENCE-TIERED LANGUAGE (row 22): scale wording by match confidence.
     NEVER call a category-only match an "exact duplicate". Use:
       high confidence  -> "very similar" / "almost the same shade"
       medium           -> "similar"
       low/category-only -> "in the same category"
   - Three actions: "Use one I own", "Keep on wishlist" (adds to the 14-day
     cooling-off list), "Continue to retailer". A "Buy Now"/retailer action is
     present but visually DEPRIORITIZED (secondary style) — NEVER disabled.

3. features/wishlist/hooks/useIntercept.ts — orchestrates the similar-owned call
   and records the user's decision locally (mock a recordDecision for now).

Style with NativeWind tokens only. Every action button gets an accessibilityLabel;
never rely on color alone to convey the warning. Add tests in
features/wishlist/__tests__/ asserting: banner appears at >=3 same-category owned
items, banner is absent below the threshold, language tier matches confidence,
and the retailer action is never disabled.

Only edit files under my lane (app/(tabs)/wishlist.tsx, features/wishlist/*); if
anything else is needed output a CROSS-LANE REQUEST and stop.
```

**Files created:**
- `features/wishlist/components/InterceptBanner.tsx`
- `features/wishlist/hooks/useIntercept.ts`
- `features/wishlist/__tests__/intercept.test.tsx`

**Verify:**
- Run `npm run verify` — must pass.
- With mock inventory holding 4 same-category items, add a 5th of that category → banner appears, listing the owned items with a WHY for each, and all three actions. Confirm the retailer/Buy Now button is present but secondary and **tappable** (never disabled).
- Add an item in a category you own 0–2 of → **no** banner.
- Compare side-by-side with `wishlist-intercept.png`.
- Read every banner string aloud: does it sound like a supportive friend? No word implies wrongdoing. A category-only match is never called a "duplicate."

**Done when:**
- [ ] Banner shows count + strongest owned matches + WHY, matching the mockup, in blush/amber (no red).
- [ ] Threshold correct: appears at ≥3 same-category owned items, absent below.
- [ ] Language scales with confidence; category-only never labeled "exact duplicate."
- [ ] Three actions work; retailer action deprioritized but never disabled.
- [ ] Decision recorded (mock). Tone passes the read-aloud test. `npm run verify` green.

---

### Phase 1c — Cooling-off, reconsideration, duplicate wishlist detection, purchase conversion, reminders (rows 13, 17, 18, 19)

**Goal:** Items enter a 14-day cooling-off, flip to "ready" on day 14, and show a reconsideration detail with actions. Detect likely-duplicate wishlist entries. Mark-purchased converts to an inventory product via a shared hook (no re-entry) preserving history. Opt-in in-app reminders (no push).

**Paste this to your agent:**
```
You are working in the PanPals repo. Read AI-CONTEXT.md and docs/DATA-MODEL.md
(wishlist_items) and docs/PRD.md (F7). I own only app/(tabs)/wishlist.tsx and
features/wishlist/*.

Build against MOCK DATA:

1. Cooling-off (row 13): new items get cooling_off_ends_at = created_at + 14 days
   and status = "cooling". An item flips to status = "ready" on day 14. Do the
   date math in a small pure helper in features/wishlist/ so it's unit-testable.

2. features/wishlist/components/ReconsiderDetail.tsx — item detail screen showing:
   days-on-list, priority, and the count of similar owned items (from
   useSimilarOwned). Actions: "Buy externally", "Keep waiting", "Remove". Calm,
   non-pressuring copy from strings.ts.

3. Duplicate wishlist detection (row 17): when adding an item that closely matches
   an EXISTING wishlist entry, ask "Looks like this may already be on your list —
   keep both?" (never auto-block). Let the user keep both or cancel.

4. Purchase -> inventory conversion (row 18): "Mark purchased" must create a
   linked inventory PRODUCT WITHOUT re-entry, by calling a SHARED lib/api hook
   (e.g. useProducts().createFromWishlist). Do NOT edit any inventory files
   (features/inventory/*, app/(tabs)/inventory.tsx — those are Matt's). If that
   shared hook does not exist, mock it locally AND tell me to file a CROSS-LANE
   REQUEST to Shrey. Preserve history: set the wishlist item status = "purchased"
   and set source_wishlist_item_id on the new product.

5. Reminders (row 19): opt-in in-app reminder via reminder_at, plus a
   "ready to reconsider" nudge when an item flips to ready. IN-APP ONLY — NO push
   notifications, no expo-notifications, no OS permission prompts.

Types from mocks/types.ts. NativeWind tokens only. accessibilityLabels on all
touchables. Add tests in features/wishlist/__tests__/ for: cooling_off_ends_at =
created + 14 days, cooling->ready flip on day 14, duplicate-entry prompt fires on
a close match, and mark-purchased calls the shared conversion hook and sets
status=purchased + source_wishlist_item_id.

Only edit files under my lane (app/(tabs)/wishlist.tsx, features/wishlist/*); if
anything else is needed output a CROSS-LANE REQUEST and stop.
```

**Files created:**
- `features/wishlist/components/ReconsiderDetail.tsx`
- `features/wishlist/hooks/useCoolingOff.ts` (or a pure helper `coolingOff.ts`)
- `features/wishlist/__tests__/cooling-off.test.ts`
- `features/wishlist/__tests__/purchase-conversion.test.tsx`

**Verify:**
- Run `npm run verify` — must pass.
- Add an item → status is "cooling," cooling-off ends 14 days out. Use a mock item dated 14+ days ago → shows as "ready." Open its detail → days-on-list, priority, similar-owned count, and the three actions all render.
- Add a near-duplicate of an existing wishlist entry → "keep both?" prompt appears; keeping both works.
- "Mark purchased" → wishlist item becomes purchased (history preserved) and the (mocked) shared conversion hook is called. Confirm **no** inventory files were edited (`git diff --name-only main` shows only your lane).
- Toggle a reminder on → stored; no OS push permission dialog ever appears.

**Done when:**
- [ ] Cooling-off = +14 days; flips cooling→ready on day 14 (helper unit-tested).
- [ ] Reconsider detail shows days-on-list, priority, similar-owned count + Buy externally / Keep waiting / Remove.
- [ ] Duplicate wishlist entry prompt asks to keep both, never auto-blocks.
- [ ] Mark-purchased converts via the shared hook (no re-entry), sets status=purchased + source_wishlist_item_id, edits no inventory files.
- [ ] Reminders opt-in, in-app only, no push. `npm run verify` green.

---

### Phase 2 — Wire real hooks

**Goal:** Replace mock wrappers with the real `lib/api/*` hooks now that `types/database.ts` has landed. No UI rewrite — the hook names are the same.

**Paste this to your agent:**
```
You are working in the PanPals repo. types/database.ts and the real lib/api hooks
have landed on main. I own only app/(tabs)/wishlist.tsx and features/wishlist/*.

Switch my wishlist feature from local mock wrappers to the REAL lib/api hooks:
useWishlist, useCatalogSearch, useProducts (createFromWishlist for the purchase
conversion), and useSimilarOwned (wraps find_similar_owned). Remove any local
mock wrappers I added earlier. Update imports to use types from types/database.ts
instead of mocks/types.ts if instructed by the shared contract. Do NOT change hook
signatures, do NOT call supabase-js directly, do NOT write SQL. Keep all three
states (loading/empty/error) working against the real hooks. Update tests to mock
the real lib/api hooks.

If any required hook (especially useSimilarOwned or useProducts().createFromWishlist)
is missing or has a different shape than expected, STOP and output a CROSS-LANE
REQUEST describing exactly what I need from Shrey.

Only edit files under my lane (app/(tabs)/wishlist.tsx, features/wishlist/*); if
anything else is needed output a CROSS-LANE REQUEST and stop.
```

**Files created:** none new (edits only to your lane).

**Verify:**
- `npm run verify` — must pass.
- Click the full wishlist flow against real data: add, intercept, cooling-off, reconsider, mark-purchased, reminder. Confirm data persists via the real hooks.
- `git diff --name-only main` shows only files in your lane.

**Done when:**
- [ ] All mock wrappers removed; real `lib/api` hooks used everywhere.
- [ ] No `supabase-js` import, no SQL, no hook-signature changes.
- [ ] Full flow works on real data; `npm run verify` green; only your lane changed.

---

### Phase 3 — Polish: states, a11y, analytics, Maestro

**Goal:** Production-quality loading/empty/error states, full accessibility, analytics via the shared `track()`, and the passing Maestro flow.

**Paste this to your agent:**
```
You are working in the PanPals repo. Read AI-CONTEXT.md (§5 conventions, §7 DoD)
and docs/TESTING.md. I own only app/(tabs)/wishlist.tsx, features/wishlist/*, and
.maestro/wishlist-intercept.yaml.

Polish the wishlist feature:

1. Loading / empty / error states on every wishlist screen using the shared
   components/ui patterns. Empty and error copy stays calm and supportive.

2. Accessibility: every touchable has a clear accessibilityLabel; status is never
   conveyed by color alone (add text/icon). Check contrast on blush/amber banners.

3. Analytics via the shared track(event, props) helper from lib/api (do NOT build
   your own analytics). Fire on: wishlist_item_added, duplicate_warning_shown,
   warning_decision, wishlist_item_removed, wishlist_item_purchased. Never log raw
   reflection text — only pseudonymous props (ids, category, confidence tier).

4. .maestro/wishlist-intercept.yaml: add a 4th same-category item -> assert the
   banner shows the owned items -> tap the cooling-off CTA. Match TESTING.md's
   description for this flow.

Add/extend tests in features/wishlist/__tests__/ for the analytics calls and
state rendering. Then run npm run verify.

Only edit files under my lane (app/(tabs)/wishlist.tsx, features/wishlist/*,
.maestro/wishlist-intercept.yaml); if anything else is needed output a CROSS-LANE
REQUEST and stop.
```

**Files created:**
- `.maestro/wishlist-intercept.yaml`
- `features/wishlist/__tests__/analytics.test.tsx`

**Verify:**
- `npm run verify` — must pass.
- Run the Maestro flow locally: `maestro test .maestro/wishlist-intercept.yaml` → green. It should add a 4th same-category item, show the banner listing owned items, and tap the cooling-off CTA.
- Turn on VoiceOver/TalkBack briefly: every button announces a meaningful label; warnings are readable without relying on color.
- Confirm the five analytics events fire (check the mock/console) and no raw reflection text is logged.

**Done when:**
- [ ] Loading/empty/error states polished with supportive copy.
- [ ] Full a11y: labels on all touchables; no color-only status; contrast OK.
- [ ] `track()` fires the five events; no raw review/reflection text logged.
- [ ] `.maestro/wishlist-intercept.yaml` passes locally. `npm run verify` green.

---

### Phase 4 — User testing (Claire is the priority)

**Goal:** Support Shrey's moderated sessions (5–8 MBA-cohort testers). The intercept tone is the riskiest assumption in the whole app — this phase is about listening, not building.

**What you do:**
- Sit in on / review sessions where a Claire-type tester hits the intercept.
- Record: does the banner read as **supportive or judgmental**? Capture exact quotes.
- **Success targets (from PRD/PERSONAS):** ≥1 of 5–8 testers says the banner would change a real purchase decision; **zero** testers use the word "judged."
- If any tester feels judged, that is a copy bug — file a `fix/joon/<slug>` branch and soften the offending string in `strings.ts`. No structural rewrite needed.

**Done when:**
- [ ] Intercept observed with ≥2 Claire testers; quotes recorded as design-fair exhibits.
- [ ] Zero "judged" reactions; ≥1 "would change my decision."
- [ ] Any tone issues fixed in `strings.ts` via a small fix PR.

---

## 6. Cross-lane requests you'll likely need (pre-written)

Copy the relevant block, fill the brackets, and post it in the team channel for Shrey to route. Do NOT make the change yourself.

**A. Similar-owned hook (needed for Phase 1b):**
```
CROSS-LANE REQUEST — to Shrey (lib/api)
Need: a useSimilarOwned() hook in lib/api that wraps the find_similar_owned RPC.
Expected return: { count: number, items: Array<{ id, brand, name, shade,
category, matchReason: string, confidence: 'high'|'medium'|'low' }> }, keyed by
category (+ optional exclude id). Blocking: the Wishlist impulse intercept (F5,
rows 6/7/22). I'm mocking this shape locally until it lands.
```

**B. Wishlist → inventory conversion hook (needed for Phase 1c):**
```
CROSS-LANE REQUEST — to Shrey (lib/api)
Need: a shared hook to convert a purchased wishlist item into an inventory product
without re-entry, e.g. useProducts().createFromWishlist(wishlistItem). It must set
the new product's source_wishlist_item_id and let me set the wishlist item's
status=purchased. This keeps the conversion out of Matt's inventory files.
Blocking: row 18. I'm mocking it locally until it lands.
```

**C. New shared UI primitive:**
```
CROSS-LANE REQUEST — to Shrey (components/ui)
Need: a shared [Banner/Chip/Segment] primitive in components/ui for the intercept
banner / priority selector, matching DESIGN-TOKENS.md ([describe]). I can't add it
myself since components/ui is your lane. Workaround until then: [composing existing
primitives].
```

**D. Missing/changed type or token:**
```
CROSS-LANE REQUEST — to Shrey (mocks/types.ts / types/database.ts / theme)
Need: [field/enum/token] on [entity] — e.g. wishlist_items.confidence tier, or a
blush-banner background token. Blocking: [what]. I'll mock locally meanwhile.
```

---

## 7. Common pitfalls

- **Shaming copy = instant churn.** Claire uninstalls at one shaming word. Never "duplicate!", "stop", "wasting", "again?!". Prefer neutral facts about *her own* items. Read every string aloud.
- **Calling a category-only match a "duplicate."** Row 22 is explicit: scale language by confidence. Category-only = "in the same category," never "exact duplicate."
- **Disabling Buy Now.** It must always stay tappable, just visually deprioritized. Hard blocks are an anti-persona (D2) — we chose soft alerts on purpose.
- **Red/alarm styling.** Intercept banners use blush/soft-amber, never error red. Red is only for real failures.
- **Editing another lane.** The conversion touches inventory conceptually but must go through the shared hook — never edit `features/inventory/*`, `app/(tabs)/inventory.tsx`, `components/ProgressRing.tsx`, `lib/*`, `theme/*`, `mocks/*`, or `supabase/*`. When in doubt, CROSS-LANE REQUEST.
- **Calling supabase-js or writing SQL.** Never. Only `lib/api` hooks.
- **Push notifications.** Reminders are IN-APP only. No `expo-notifications`, no OS permission prompts (D19).
- **Inline strings.** All user-visible text lives in `features/wishlist/strings.ts`.
- **Hardcoding hex/font/radius.** Tokens only, via NativeWind classNames.
- **Skipping states.** Every screen needs loading, empty, and error.
- **Big PRs / stale branches.** Keep PRs ≤ ~400 lines, branches ≤ 2 days, commit every ~30 min, rebase after each schema merge, never force-push/merge/touch `main`.
- **Deferred features.** No community feed, likes, badges, points, or push — don't let the agent "helpfully" add them.
