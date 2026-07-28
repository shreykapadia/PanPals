# Plan audit — all five lanes vs. `main`

**Audited:** 2026-07-27 against `main` @ `cdd8e1e` (fetched + up to date with `origin/main`)
**Gate:** `npm run verify` is **green** — tsc, eslint (0 warnings), prettier, **19 Jest suites / 94 tests**. No raw hex outside `theme/`.
**Supersedes:** `MATT-PLAN-AUDIT.md` (deleted — it was written against a stale `86992ae` checkout that was missing PRs #21–#24, and it wrongly reported Matt's and Aaron's lanes as unbuilt).

---

## 1. Scoreboard

| Lane       | Phases done                                      | Phases left                                                                 | Lane health                                                               |
| ---------- | ------------------------------------------------ | --------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| **Shrey**  | 0-A → 0-E, B1 → B6, Phase 2, Phase 3             | Phase 4 (ongoing review/merge + testing), **footer rebuild (in flight)**    | 🟢 Ahead. Three shared hooks missing and now blocking two lanes — see §3. |
| **Aaron**  | 1, 2, 3 (PR #22)                                 | Phase 4, **new Phase 5 (footer)**                                           | 🟢 Strongest lane. One stub (`RecentProgress`) blocked on Shrey.          |
| **Matt**   | 1a, most of 1b, 2 (n/a), part of 3 (PR #21, #23) | Rest of 1b (**edit, delete, usage history**), rest of 3, 4, **new Phase 5** | 🟡 Real gaps behind a working surface. One spec violation — see §4-M3.    |
| **Joon**   | 1a (PR #17, hardened in #24)                     | **1b (intercept — the riskiest feature in the app)**, 1c, 2 (n/a), 3, 4     | 🔴 Furthest behind on the highest-risk work. F5 is entirely unbuilt.      |
| **Talbia** | 1, 2, most of 3 (PR #19)                         | Maestro flow, ring swap, **finish seam**, Phase 4, **new Phase 5 (footer)** | 🟡 Shipped work is **unreachable in production** — see §3-B1.             |

**Two facts that changed since the plans were written and invalidate advice in all five:**

1. **There is no mock phase left.** `lib/api/*` hits real Supabase via `lib/supabase.ts`; `types/database.ts` is generated and committed. Every plan's "build against mocks first / Phase 2 wire real hooks" is done _for_ the feature owners. `mocks/fixtures.ts` is now only a Jest double. Practical effect: **you need a signed-in session to see or create anything** — `useCreateProduct` throws `'Not signed in.'`, and RLS returns `[]` when signed out.
2. **`track()` already fires from inside the hooks.** `inventory_item_added`, `usage_logged`, `focus_product_set`, `product_finished`, `wishlist_item_added`, `wishlist_item_removed`, `wishlist_item_purchased` are all fired inside `lib/api`. Aaron correctly did not re-fire them in his Phase 3. **Matt's and Joon's Phase 3 blocks still say to fire them — that would double-count.** Corrected in their plans.

---

## 2. The real shared-hook contract

Every plan's §5 documents a method-bag API (`useProducts().create/.update/.logUsage`, `useWishlist().add/.restore/.markPurchased`, camelCase `useDashboard()` fields). **None of that shape ever existed.** This table is the truth; the plans have been patched to match.

| Hook                                                                           | Shape                                                                                                                                                                       | Notes                                                                                   |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `useProducts(filters?)`                                                        | read query → `Product[]`; filters `{status?, category?, is_priority?}`                                                                                                      | **No methods on it.**                                                                   |
| `useCreateProduct()`                                                           | mutation, arg = `Omit<Product,'id'\|'user_id'\|'created_at'>` — **all keys required**                                                                                       | Pass explicit `null`s for optionals. Fires `inventory_item_added`.                      |
| `useLogUsage()`                                                                | mutation `{productId, percentAfter, note?, photoUrl?}`                                                                                                                      | Shared by Aaron (Home) + Matt (detail). Fires `usage_logged`.                           |
| `useTogglePriority()`                                                          | mutation `{productId, isPriority}`                                                                                                                                          | 6th pin rejected by the DB trigger. Fires `focus_product_set`.                          |
| `useSimilarOwned(category, excludeId?)`                                        | read query → `{count, products}`                                                                                                                                            | **No `matchReason`, no `confidence`** — see §3-B5.                                      |
| `useCreateFromWishlist()`                                                      | mutation `{wishlistItemId}`                                                                                                                                                 | Sets `status='purchased'` + `source_wishlist_item_id`. Fires `wishlist_item_purchased`. |
| `useWishlist(filters?)`                                                        | read query → `WishlistItem[]`                                                                                                                                               | —                                                                                       |
| `useAddWishlistItem()` / `useUpdateWishlistItem()` / `useRemoveWishlistItem()` | separate mutations                                                                                                                                                          | No `restore`/`markPurchased` — Joon composes them himself.                              |
| `useDashboard()`                                                               | → `DashboardData` — **snake_case**: `{profile, focus_products, status_counts, streak:{current_streak,longest_streak,last_log_date}, category_counts, ready_wishlist_items}` | Not the camelCase shape Aaron's plan documented.                                        |
| `useEmpties()` / `useFinishProduct()`                                          | read query; mutation `{productId, reviewText?, repurchase, photoUrl?}`                                                                                                      | Fires `product_finished`.                                                               |
| `useCatalogSearch(q, category?, limit?)`                                       | read query → `CatalogProduct[]`                                                                                                                                             | Wrapped by `components/ui/ProductSearch`.                                               |
| `track(...)`                                                                   | **`lib/analytics.ts`, NOT re-exported from `lib/api`**; `(eventName, properties?, entityId?, sourceView?)`                                                                  | Throws on an unknown event or a `review_text` prop.                                     |

**Design tokens:** there is **no `brand` token**. PanPal Rose is **`primary-container`**. `primary` is `#8c4c4d`, a deep mauve — an agent told to "use the brand token" will write `bg-primary` and get the wrong colour with no error. Matt's plan §8 said exactly that; fixed.

---

## 3. Blockers — Shrey's queue, in priority order

**B1 — The finish seam is broken, and it makes Talbia's shipped work unreachable.** 🔴 Highest priority.
Both plans specified `router.push('/empties/finish?productId=<id>')`. That route was never created. Matt shipped something different instead:

```ts
// features/inventory/components/ItemDetailSheet.tsx
router.push({ pathname: '/(tabs)/progress', params: { finishProductId: item.id } });
```

`app/(tabs)/progress.tsx` **does not read `finishProductId`**. It only opens `FinishFlow` from its own `__DEV__` preview buttons. So today: Matt's button navigates to the Progress tab and nothing happens, and in a **production build Talbia's entire finish flow — celebration, repurchase review, `finish_product` — is dead code**. F6 does not work end to end.
→ **Fix (Talbia's lane, ~10 lines):** read `finishProductId` via `useLocalSearchParams()` and render `<FinishFlow productId={...} />` when present. Cheaper and lower-risk than adding an `app/empties/finish.tsx` route, and it matches what Matt already shipped. Written into her plan as Phase 3b. Both plans' route text has been corrected.

**B2 — No `useUpdateProduct` / `useDeleteProduct`.** Blocks the rest of Matt's Phase 1b.
Matt's strings file already carries `editAction`, `editTitle`, `saveEdit` — dead keys with no UI behind them, because there is nothing to call. Needed: an update mutation taking a partial patch over `brand, name, shade, category, format, status, percent_remaining, photo_url, pao_months, opened_at`, and a delete mutation. **Also confirm the `usage_logs.product_id` FK's ON DELETE behaviour** — Matt is told to write delete-confirmation copy promising usage history survives, and that copy must not be a lie.

**B3 — Nothing reads `usage_logs`.** Now blocking **two** lanes, with stubs already committed in both:

- `features/home/useHomeData.ts` → `recentActivity: [] as never[]` with a comment pointing at the missing hook. Aaron's "Recent progress" section renders nothing.
- `features/home/StreakRow.tsx` → weekly checkmarks are **approximated from `last_log_date`** because there is no per-day history.
- Matt's item detail has no usage-history list at all (plan Phase 1b item 1).
  → One `useUsageLogs(productId?)` read hook unblocks all three. The RLS select policy (`usage_logs_select_own`) already exists.

**B4 — No image picker, no storage bucket.** `expo-image-picker`/`expo-camera` are not installed and every bucket block in `supabase/config.toml` is commented out. Matt's "Tap to scan" is currently a local boolean that toggles a label, and `photo_url` is always saved as `null`. Either wire it up (dep + bucket + owner-only RLS + an upload helper in `lib/api`) or **formally defer photos** and say so in the plans. Right now three plans ask for something the stack can't do.

**B5 — `useSimilarOwned` has no confidence data.** It returns `{count, products}`. Joon's Phase 1b needs `matchReason` and a `confidence: 'high'|'medium'|'low'` per match to satisfy **matrix row 22** (confidence-tiered language: a category-only match must never be called a "duplicate"). Without it he can only ever say "in the same category". Either extend `find_similar_owned` additively, or accept that row 22 collapses to the low-confidence tier only — a scope call worth making explicitly, since row 22 exists to protect Claire from the app's biggest churn risk.

**B6 — Documentation drift** (cheap, do it in the footer PR):

- `D23` is referenced by `docs/plans/README.md` and `GEMINI-FOOTER-PLAN.md` but **does not exist in `docs/DECISIONS.md`**. Append it.
- `components/onboarding/*` and `app/index.tsx` shipped in PR #20 and are **not in the AI-CONTEXT §3 ownership matrix or `.github/CODEOWNERS`**.
- The **2026-07-26 type-scale revision** in `DESIGN-TOKENS.md` (body 14→16px, muted 12→14px, button 14→16px, badge 11→12px) is **applied in zero files** — every area, including Shrey's own `components/ui` and `(auth)`, still uses the old scale. Either apply it or mark it forward-looking; right now new work builds to a scale nothing else uses.
- `GEMINI-FOOTER-PLAN.md` §6 says to copy the placeholder house style from "the current `app/(tabs)/inventory.tsx` stub" — that stub is gone, Matt shipped the real screen.

---

## 4. Per-lane detail

### Shrey — 🟢

Done: Phase 0-A→0-E, B1→B6, Phase 2 (real Supabase swap), Phase 3 (polish/a11y/privacy). Plus an unplanned onboarding redesign (#20).
Left: Phase 4 (standing review/merge + user testing) and the **footer rebuild**, which is fully specced in `GEMINI-FOOTER-PLAN.md` but uncommitted.
Notes: the footer plan's own sequencing (Aaron → Talbia → Shrey → Talbia follow-up) is sound and holds — Aaron's Phase 5 has not shipped, so nothing is out of order yet. **Matt was never sent the `app/log.tsx` cross-lane request** the footer plan §6 tells you to file; it is now written into his plan as Phase 5. Only 2 of 5 Maestro flows exist (`catalog-search`, `signup`, plus Aaron's `focus-and-ring` and Matt's `log-product` — so 4 of 5; `wishlist-intercept` and `finish-and-archive` are missing, owned by Joon and Talbia).

### Aaron — 🟢

Done (#22): `components/ProgressRing.tsx` with the exact spec'd props (`percent, size?, strokeWidth?, label?, accessibilityLabel` required, ≥8px stroke, rounded caps, `primary-container` fill on a `border-warm` track); `HomeScreen` with loading skeleton / empty / error; `FocusCard`, `AddToFocusRow`, `StatusDonut`, `QuickActions`, `StreakRow`, `ReconsiderNudge`, `RingSlider` (5% snap, `SLIDER_STEP = 5`); `useHomeData`, `useFocusPot`; 4 test files; `.maestro/focus-and-ring.yaml`.
Left: Phase 4, and the new **Phase 5** (profile button in the top app bar — _blocking_ for Shrey's nav PR; drop the duplicate "Log item" quick-action pill).
Gaps: `RecentProgress` renders nothing and `StreakRow`'s weekly checkmarks are approximated — both waiting on **B3**. He correctly did not re-fire analytics.

### Matt — 🟡

Done (#21, #23): `app/(tabs)/inventory.tsx` (list + search + status/category filters + loading/empty/error/no-matches); `FastLogSheet` (catalog search via the shared `ProductSearch` **and** manual, brand/name/shade/category/format/status/PAO, brand+name required, saves via `useCreateProduct`); `InventoryItemCard`; `ItemDetailSheet` (RingMark, badges, pin/unpin, log usage, Mark as Finished); `UsageLogSheet` (5% steps, optional note, clamped 0–100); `useInventoryActions`; `daysSinceOpened`; 10 tests; `.maestro/log-product.yaml`.

Left — and this is more than the surface suggests:

- **M1 — no edit UI** (Phase 1b item 2). Blocked on **B2**. Dead strings already committed.
- **M2 — no delete UI, no confirmation dialog** (Phase 1b item 4). Blocked on **B2**.
- **M3 — no usage-history list** (Phase 1b item 1). Blocked on **B3**.
- **M4 — the "recently used" filter is missing.** Phase 1a specified three filters; only category and status shipped. Needs **B3**.
- **M5 — 🔴 spec violation.** `strings.ts` reads `scanPlaceholder: 'Tap to scan barcode or take photo'`. AI-CONTEXT §1 lists barcode lookup under "**do not generate code for these, even if asked casually**", and his own plan §8 says the zone must never claim to identify the product. The implementation is honest (it just toggles a boolean) — **the copy is the bug.** One-line fix, do it now: `'Tap to add a photo'`.
- **M6 — scope overlap:** Matt shipped Focus Pot pin/unpin. **F3 / matrix row 8 is Aaron's**, and Aaron shipped it too. No file conflict (both call the shared `useTogglePriority`) and two entry points is arguably good UX — but it is undeclared duplicate ownership. Ratify it or drop one.
- Phase 3 remains: a11y sweep, the RTL test asserting the finish button navigates, **and explicitly NOT firing analytics**.
- Deviations that are fine, now recorded in his plan: no `ProductSearchField` wrapper (he uses `ProductSearch` directly — better); no `useInventoryFilters` hook (filtering is inline and untested — worth extracting when the "recently used" filter lands); components named `FastLogSheet`/`ItemDetailSheet`/`UsageLogSheet` rather than `LogModal`/`ProductDetail`/`UsageLogger`.

### Joon — 🔴 furthest behind, on the riskiest work

Done (#17, hardened by #24): `app/(tabs)/wishlist.tsx` with status filters and an undo window; `WishlistItemCard`; `AddWishlistItemSheet` (catalog / link / manual); `EditWishlistItemSheet`; `useWishlistActions` (add/update/remove/**restore**, composed from the separate hooks — correct, in-lane); `daysOnList`; 2 test files; error handling on remove/undo and reflection clearing.
Left: **Phase 1b entirely** — `InterceptBanner`, `useIntercept`, confidence-tiered language. This is **F5, the single riskiest assumption in the product** (PERSONAS/Claire), and none of it exists. Then Phase 1c (reconsider detail, duplicate-entry prompt, mark-purchased conversion, in-app reminders), Phase 3 (states, a11y, analytics — **without re-firing** the two events the hooks already send), `.maestro/wishlist-intercept.yaml`, Phase 4.
Watch: **B5** caps what row 22 can do; `useCreateFromWishlist` already exists and does exactly what row 18 needs, so Phase 1c item 4 is easier than his plan implies.

### Talbia — 🟡

Done (#19): Progress tab; `EmptiesArchive`, `EmptyCard`, `ProgressSummary`, `EmptiesEmptyState`/`ErrorState`/`LoadingState`; `FinishFlow` + `CelebrationState` + `RepurchaseReview`; `useEmptiesArchive`, `useFinishProduct`, `useReducedMotion`; 3 test files. No likes, no author, no feed, no points — D13/D15 respected.
Left:

- **T1 — 🔴 wire the finish seam (B1).** Until this lands her whole feature is dev-preview-only.
- **T2 — swap the ring.** `features/empties/components/ProgressRingStub.tsx` was the correct workaround while Aaron's ring didn't exist. It exists now, at `components/ProgressRing.tsx`, and her own adapter carries the TODO. The swap is **not drop-in**: Aaron's ring requires `accessibilityLabel` and takes `strokeWidth`; her stub takes neither and animates internally. Adapt at the call sites, then delete the stub.
- **T3 — `.maestro/finish-and-archive.yaml`** never written (Phase 3 item 4).
- **T4 — Phase 5 (footer):** rename to `app/(tabs)/empties.tsx` behind a shim, retitle "Your Empties", and drop the streak + status badges that duplicate Home.
- Phase 4.

---

## 5. Recommended order

1. **Talbia T1** — the finish seam (§3-B1). Ten lines; without it F6 does not exist in a shipping build. Nothing else in the app is this broken.
2. **Matt M5** — delete the word "barcode" from `strings.ts`. One line, and it is a stated non-goal appearing in shipped UI.
3. **Shrey B2 + B3** — the three missing hooks (`useUpdateProduct`, `useDeleteProduct`, `useUsageLogs`). One PR unblocks Matt's M1/M2/M3/M4 and Aaron's two stubs.
4. **Shrey B4 + B5** — decide photos in/out, decide confidence tiers in/out. Both are scope calls only you can make, and both are currently silent gaps in someone's plan.
5. **Joon Phase 1b** — the intercept. Longest pole and the highest-risk assumption; it should be in front of testers first, not last.
6. **The footer chain** — Aaron Phase 5 → Talbia Phase 5 → Shrey's nav PR → Talbia's shim deletion. Do not reorder.
7. **Shrey B6** — the doc drift, folded into the footer PR.
