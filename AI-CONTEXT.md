# AI-CONTEXT.md — PanPals

> You are working in a 5-person codebase where every developer uses an AI coding
> agent (Claude Code, Antigravity, or Codex). This file is the shared contract.
> Read it fully before generating any code. If a task requires violating
> anything here, STOP and tell your human.
>
> **Scope authority (updated 2026-07-21 team sync):** the go-forward MVP scope is
> the **Maya Feature Matrix** (`docs/PRD.md` + the F1–F9 table). Where any older
> doc, mockup, or comment disagrees with the matrix, the matrix wins. See
> DECISIONS.md D12–D20 for what changed after the sync.
>
> **Team model (D20):** **Shrey builds the entire backend and platform himself**
> (scaffold, auth, navigation, Supabase schema/RLS/RPCs/seed, generated types,
> shared UI kit, and the `lib/api` data hooks). The other four build **front-end
> user features only**, against those hooks. Nobody but Shrey touches `supabase/*`
> or `types/database.ts`.

## 1. What we are building

PanPals: a mobile app that helps people finish the cosmetics they own before
buying more. Core loop:

**Log a product (catalog search or manual) → prioritize (Focus Pot, max 5) →
track depletion (progress rings) → intercept impulse buys (soft alert + 14-day
cooling-off wishlist) → finish → private "empty" archive + repurchase verdict.**

Full spec: `docs/PRD.md`. Design ground truth: `docs/mockups/*.png` +
`docs/DESIGN-TOKENS.md`. Primary user: **Maya, the Low-Tech Migrator** — see
`docs/PERSONAS.md`.

**NOT building (do not generate code for these, even if asked casually):**
scanning/AI product identification, barcode lookup, payments, affiliate links,
hard purchase locks, inventory item caps, budget tracking, non-beauty categories
in the UI, push notifications, and — **deferred at the 7/21 sync (D13, D15)** —
the Community Empties feed, likes, follows/comments, badges, points, and any
reward economy. Finishing a product produces a **private** archive entry, not a
public post.

## 2. Stack (do not introduce alternatives)

- Expo SDK 53+ / React Native / TypeScript strict / expo-router (file-based tabs)
- Styling: **NativeWind only**, using tokens from `docs/DESIGN-TOKENS.md`.
  Never hardcode a hex value, font family, or radius. Never import
  styled-components or emotion.
- State: **Zustand** for client state, **TanStack Query** for server state.
  No Redux. No React Context for data.
- Backend: **Supabase (Postgres + RLS) — owned end-to-end by Shrey (D20).** Shrey
  writes the schema, migrations, RLS, RPCs, seed, and generates
  `types/database.ts`. **Front-end code never calls supabase-js directly** — all
  data access goes through the hooks in `lib/api/` (`useProducts`, `useWishlist`,
  `useDashboard`, `useEmpties`, `useCatalogSearch`, `useSimilarOwned`). Until
  `types/database.ts` lands, those hooks serve fixtures from `mocks/` typed by
  `mocks/types.ts`. This mock-first rule is what lets the four feature owners
  build in parallel before the backend is finished — do not break it.
- Product catalog: a read-only `catalog_products` table seeded from the
  **Kaggle MIT-licensed cosmetics dataset** (D17) powers type-ahead search and
  field pre-fill for both inventory and wishlist. Manual entry is always a
  fallback when there is no catalog match.
- Tests: Jest + React Native Testing Library; Maestro flows in `.maestro/`.
- There is **no CI**. Verification is local: `npm run verify` must pass
  before every PR (see Definition of Done).

## 3. File ownership — DO NOT cross lanes

This matrix is the single most important defense against merge conflicts. If two
people never edit the same file, we never conflict. Work only inside your lane.

| Path                                                                                                                                                                                                       | Owner          | Area                                                                                                                                                                                                                                                                        |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/_layout.tsx`, `app/(tabs)/_layout.tsx`, `app/(auth)/*`, `app/(tabs)/you.tsx`, `supabase/*`, `types/database.ts`, `lib/*`, `theme/*`, `mocks/*`, `components/ui/*`, `docs/*`, `.github/*`, `scripts/*` | **Shrey** ONLY | **Platform + entire backend**: scaffold, auth, navigation, Supabase schema/RLS/RPCs/seed, generated types, shared UI kit, `lib/api` data hooks, catalog search service, analytics, onboarding + profile/You, cross-cutting empty/error patterns. Reviews & merges every PR. |
| `app/(tabs)/index.tsx`, `features/home/*`, `components/ProgressRing.tsx`                                                                                                                                   | **Aaron**      | Home dashboard, Focus Pot, progress rings/donut, streak display                                                                                                                                                                                                             |
| `app/(tabs)/wishlist.tsx`, `features/wishlist/*`                                                                                                                                                           | **Joon**       | Wishlist, impulse intercept, 14-day cooling-off, reconsideration, reminders, purchase→inventory conversion                                                                                                                                                                  |
| `app/(tabs)/inventory.tsx`, `features/inventory/*`                                                                                                                                                         | **Matt**       | Inventory entry (fast-log), browse/filter/edit, usage logging from item detail                                                                                                                                                                                              |
| `app/(tabs)/progress.tsx`, `features/empties/*`                                                                                                                                                            | **Talbia**     | Finish/celebration flow, repurchase review, **private** empties archive, Progress tab                                                                                                                                                                                       |

**Shared seams (coordinate through Shrey, never edit across lanes):**

- Everyone reads types from `mocks/types.ts` (later `types/database.ts`) and data
  from `lib/api/*` hooks — importing is fine, **editing those files is Shrey only**.
- Aaron owns `components/ProgressRing.tsx`; Talbia's Progress tab **imports** it.
- **Finish seam:** the "Mark as Finished" button lives on Matt's inventory item
  detail, but it only **navigates** (expo-router) to the finish flow in Talbia's
  `features/empties/*`. Matt adds the button in his file; Talbia owns the
  destination screen. Neither edits the other's files.
- Usage logging: Aaron (from Home) and Matt (from inventory detail) both call the
  shared `useProducts`/`log_usage` hook — same hook, different screens, no overlap.
- Wishlist → inventory conversion is a **Joon** flow that calls a shared
  `lib/api` hook to create the product; it never edits Matt's or Talbia's files.

If your task needs a change outside your lane: **do not make it.** Output a note
titled `CROSS-LANE REQUEST` describing the needed change, and your human posts it
in the team channel for Shrey to route.

## 4. Data contract (summary — full version in docs/DATA-MODEL.md)

Types come from `types/database.ts` (generated by Shrey from the Supabase schema;
never hand-edit). Until then, import shapes from `mocks/types.ts`, which mirrors
`docs/DATA-MODEL.md` exactly.

Key entities: `profiles` (streak fields are **display-only**, no rewards),
`catalog_products` (read-only, Kaggle-seeded), `products` (status: unopened |
in_rotation | finished; percent_remaining 0–100; is_priority, max 5 per user;
optional `catalog_product_id`, `shade`), `usage_logs`, `wishlist_items`
(priority high|med|low; `cooling_off_ends_at` = created + 14 days; optional
`reflection_response`, `reminder_at`; `source_wishlist_item_id` links a purchased
item to its new product), `empties` (**private** finish archive + repurchase
verdict; RLS owner-only read/write), `analytics_events`.

RPCs: `log_usage()`, `finish_product()` (archives + verdict, **no badges**),
`get_dashboard()`, `search_catalog()`, `find_similar_owned()` (category-based
count for the intercept).

**Deferred tables (do not create): `empty_likes`, `badges`, feed read-all RLS.**

## 5. Conventions

- Components: PascalCase function components, one per file, named export.
- Hooks: `use[Thing].ts` inside the feature folder; screens stay thin,
  logic lives in hooks.
- All user-visible strings in `features/<module>/strings.ts` — no inline
  string literals in JSX.
- Every screen handles three states: loading, empty, error. No unhandled
  promises.
- Accessibility: every touchable gets an `accessibilityLabel`; never rely on
  color alone to convey status.
- Copy tone: calm, non-judgmental, second person. Never shame the user.
  ("You already have 4 similar blushes" ✅ / "Stop overspending!" ❌)
- Analytics: fire the shared `track(event, props)` helper from `lib/api` on the
  key events (see DATA-MODEL.md); never log raw review text.

## 6. Design language (full tokens: docs/DESIGN-TOKENS.md)

Soft minimalism — **PanPal Aesthetic Design System v2.0.0** (D21). Surface
`#FFF8F4`, card `#FFFFFF`, brand "PanPal Rose" `#F2A2A2` for primary CTAs and
progress fills, primary text charcoal `#333333`, warm-grey border `#E0D9D4`
(also the ring track), sage `#A8C69F` for eco/success, soft amber/peach `#F8D7DA`
for gentle warnings (never red). Libre Caslon Text (serif) for headlines,
**Satoshi** for body/labels. Pill-shaped buttons and inputs (`h-12`, `rounded-full`),
24px card radius (`rounded-3xl`), progress rings with rounded 10px stroke caps,
soft diffused shadows — never hard borders or pure-black shadows.

## 7. Definition of Done for any task

1. `npm run verify` passes locally (tsc --noEmit, eslint, prettier --check, jest)
2. RTL test covers the new logic
3. Relevant Maestro flow passes locally
4. Loading / empty / error states exist for any new screen
5. Only files in your lane changed (`git diff --name-only main` proves it)
6. PR description filled per `.github/pull_request_template.md`
