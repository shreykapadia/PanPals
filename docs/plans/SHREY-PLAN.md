# Shrey's Implementation Plan — Foundation, Backend & Platform (Lead)

> **Mission:** build the scaffold, NativeWind theme, 5-tab navigator, shared UI kit, mock-first `lib/api` hooks, auth + goal capture, the You tab, analytics, and the catalog-search service **AND the entire Supabase backend** (schema, RLS, the max-5-priority trigger, the five RPCs, the Kaggle catalog seed, RLS verification SQL, and the generated `types/database.ts`) — so the other four can build in parallel against your hooks. Then review and merge every PR.
> **Ownership note (D20, 7/21):** you now own **everything except the four front-end feature lanes** — Aaron (Home), Matt (Inventory), Talbia (Progress/empties UI), Joon (Wishlist). What used to be a separate "Talbia data-platform" plan is now yours: nobody but you touches `supabase/*` or `types/database.ts`. You also **review and merge all PRs** at 12pm & 9pm daily.
> PRD functions owned: **F1 catalog type-ahead**, plus the backend behind F1–F9. Matrix rows: **1** (account + goal capture), **5** (catalog search), **14/15** (dashboard shell + 5-tab IA), **20** (You), **21** (shared states), **24** (analytics → `analytics_events`), **25** (a11y + privacy baseline).

---

## 1. Your lane

| Files you OWN & edit                                                                                                                                                  | Files you may IMPORT but NEVER edit  | The four feature lanes you must NOT edit                                               |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | -------------------------------------------------------------------------------------- |
| `app/_layout.tsx` (root layout, providers)                                                                                                                            | `features/*` — read for context only | `app/(tabs)/index.tsx` + `features/home/*` + `components/ProgressRing.tsx` → **Aaron** |
| `app/(tabs)/_layout.tsx` (5-tab navigator: Home \| Inventory \| Progress \| Wishlist \| You)                                                                          | —                                    | `app/(tabs)/wishlist.tsx` + `features/wishlist/*` → **Joon**                           |
| `app/(auth)/*` (welcome, sign-up, sign-in, goal capture)                                                                                                              | —                                    | `app/(tabs)/inventory.tsx` + `features/inventory/*` → **Matt**                         |
| `app/(tabs)/you.tsx` (Profile / You tab)                                                                                                                              | —                                    | `app/(tabs)/progress.tsx` + `features/empties/*` → **Talbia**                          |
| **`supabase/*`** (migrations, `seed.sql`, RLS, RPC functions, RLS tests)                                                                                              | —                                    | Any feature owner's `strings.ts` / `__tests__`                                         |
| **`types/database.ts`** (generated — never hand-edit contents, but you own the file)                                                                                  | —                                    |                                                                                        |
| `lib/*` (incl. `lib/api/*` hooks, `lib/analytics.ts` `track()`, `lib/supabase.ts`)                                                                                    | —                                    |                                                                                        |
| `theme/*` (NativeWind config from DESIGN-TOKENS)                                                                                                                      | —                                    |                                                                                        |
| `mocks/*` (`mocks/types.ts` + fixtures)                                                                                                                               | —                                    |                                                                                        |
| `components/ui/*` (Button, Card, Input, Badge/Chip, EmptyState, LoadingState, ErrorState, **ProductSearch**)                                                          | —                                    |                                                                                        |
| `docs/*`, `.github/*` (CODEOWNERS, PR template), `scripts/*`                                                                                                          | —                                    |                                                                                        |
| Root config: `package.json`, `tsconfig.json`, `tailwind.config.js`, `app.json`, `babel.config.js`, `.eslintrc.js`, `.prettierrc`, `metro.config.js`, `jest.config.js` | —                                    |                                                                                        |

Rule: if a task needs a file in the right column, **stop and emit a CROSS-LANE REQUEST** (§7). As lead you own nearly every cross-cutting file, so most "cross-lane" traffic is _inbound_ requests from teammates that you route (§7).

---

## 2. How to use this plan (non-coder loop)

You paste prompts into your AI coding agent (Claude Code / Codex / Antigravity) and verify the result. For each phase:

1. **Branch.** Front-end/platform work: `git checkout main && git pull && git checkout -b feat/shrey/<module>-<slug>`. Backend work: `git checkout -b schema/<slug>` (WORKFLOW.md branch table). One module = one branch = one PR.
2. **Paste the "Paste this to your agent" block** for that phase. Let it work; it edits only files in your lane.
3. **Commit every ~30 min:** `git add -A && git commit -m "<what changed>"`. Small commits are your undo button.
4. **Run Verify** (the box in each phase). If red, paste the error back to the agent until green. For SQL phases, "Verify" means running the migration + asserts against your **local** Supabase (Docker) before it ever touches hosted.
5. **Click through** the app (`npx expo start`, `i` for iOS sim) or run the SQL asserts, as the Verify box says.
6. **Open a PR** ≤ ~400 changed lines, fill the template, push. You are the reviewer, so self-merge only after Verify is green and `/review` shows no lane violations. **Squash-merge only.**

Your Phase 0 + first schema PR are the exception to "wait for review" — they seed `main`. Get a teammate to eyeball if possible, then squash-merge.

---

## 2b. Working across two agents (Claude Code + Gemini in Antigravity)

You're using **both** Claude Code and **Gemini inside Google Antigravity**. That's
fine — the repo is already set up for it — as long as you follow the handoff rules
below. This section is for you specifically.

**Both tools already read the same rules.** Claude Code auto-loads `CLAUDE.md`;
Antigravity auto-loads `AGENTS.md` first, then `GEMINI.md`. All three are tiny
pointer files that say the same thing: "read `AI-CONTEXT.md` first." So whichever
tool you open, it picks up our shared contract (lanes, stack, design tokens,
conventions). **Keep `CLAUDE.md`, `AGENTS.md`, and `GEMINI.md` identical** — if you
ever change one, change all three (they're in your lane).

**The repo is the shared brain — not either tool's chat.** Claude Code and
Antigravity do **not** share memory. Antigravity also keeps its own "Knowledge
Items" that persist between sessions; if one ever disagrees with `AI-CONTEXT.md`
or `DATA-MODEL.md`, **the docs win** (that rule is baked into `GEMINI.md`). So the
only reliable way to hand off between tools is through committed code + the `.md`
files.

**The four handoff rules:**

1. **One task, one tool at a time.** Never run both agents editing the same files
   at once — you'll create merge conflicts with yourself. Finish (or at least
   commit) in one before opening the other.
2. **Commit before you switch.** `git add -A && git commit -m "..."`. The other
   tool can only see what's on disk/committed, not what the first tool "was
   thinking."
3. **Re-orient the new tool at the start of every session.** Paste the primer
   below so it reloads context and looks at the current code instead of guessing.
4. **Verify the same way regardless of tool.** `npm run verify` + the phase's
   Verify box is the gate for both. Output style differences between Gemini and
   Claude don't matter as long as verify is green and it stayed in your lane.

**Session primer — paste this first, in either tool, at the start of any session:**

```
Read AI-CONTEXT.md in full, plus docs/DATA-MODEL.md and docs/DESIGN-TOKENS.md.
Then read my plan at docs/plans/SHREY-PLAN.md and tell me which phase we're on
based on the current code (run `git status` and `git log --oneline -5`). Do not
write any code yet — confirm the plan and the files you'll touch first. Only edit
files in my lane per AI-CONTEXT.md §3; if anything else is needed, stop and output
a CROSS-LANE REQUEST.
```

**Optional division of labor (do whatever works for you):** many people let
Antigravity/Gemini handle broad scaffolding, multi-file exploration, and its
artifact/plan views, and use Claude Code for precise edits and the PR `/review`
pass. Not required — either tool can do any phase here. The `AI-CONTEXT.md` +
`DESIGN-TOKENS.md` constraints keep the output consistent no matter which model
wrote it.

**PR review across tools (WORKFLOW.md Gate 3):** you can run Claude Code's
`/review` for logic and, in Antigravity, prompt: _"verify this PR only touches
paths owned by the author per AI-CONTEXT.md §3; list any changes to shared
contracts, theme, navigation, or types."_ Either satisfies the gate.

---

## 3. Before you start (one-time)

> **Do the [`SHREY-SETUP-RUNBOOK.md`](./SHREY-SETUP-RUNBOOK.md) first.** It creates the
> GitHub repo + branch protection, the Supabase project + keys, and wires the
> Supabase/GitHub MCP servers into both Claude Code and Antigravity. This section
> covers the local machine tools; the runbook covers the accounts and wiring.

1. **Node 20 LTS** (`node -v` → v20.x). Install via nvm or nodejs.org.
2. **Expo tooling & simulators:** `npm install -g eas-cli` (optional); Xcode (iOS Simulator) and/or Android Studio; **Expo Go** on your phone for the fastest preview.
3. **Maestro** (E2E): `curl -Ls "https://get.maestro.mobile.dev" | bash` then `maestro --version`.
4. **Supabase CLI + Docker** (you own the backend now):
   - **Docker Desktop** — required to run the local Supabase stack (`docker --version` should work and Docker must be _running_).
   - **Supabase CLI:** `brew install supabase/tap/supabase` (or `npm i -g supabase`), confirm `supabase --version`.
5. **Clone the repo** (after Phase 0-B creates it): `git clone <repo-url> && cd panpals-starter-kit`, then `npm install`.
6. **Create the hosted Supabase project** at supabase.com (free tier). From Settings → API copy the **Project URL**, **anon key**, and **service-role key**. You keep all three (you are the only backend owner now — you no longer hand keys to anyone). Link the CLI: `supabase link --project-ref <ref>`.
7. **Env vars:** create `.env` (git-ignored):
   ```
   EXPO_PUBLIC_SUPABASE_URL=<your-project-url>
   EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
   ```
   Commit a `.env.example` with empty values. The anon key is safe in a public repo (RLS protects data). The **service-role key never enters `.env`, the app, or the repo** — keep it in your shell/CLI only.
8. **Run the app:** `npx expo start` → `i` / `a` / QR.

---

## 4. Dependencies & sequencing (you are the critical path)

- **Nothing else starts until Phase 0 is merged.** Aaron, Joon, Matt, and Talbia are all blocked on your scaffold, tokens, shared UI kit, and — most importantly — the **five `lib/api` hooks returning realistic fixtures**. You wait on no one; you build Phase 0 entirely against mocks.
- **Mock-first bridge (the whole reason 5 people build at once):** front-end consumes `lib/api/*` hooks that serve `mocks/` fixtures typed by `mocks/types.ts`. Those fixtures mirror `docs/DATA-MODEL.md` exactly. When `types/database.ts` lands, you swap each hook's _internals_ to real Supabase **without changing a single hook signature** — so no feature screen ever changes.
- **Backend runs right after Phase 0 and is also critical path:** you build it yourself now (Phases B1–B6). The schema/RLS/RPCs must land early so the mock→real swap (Phase 2) is unblocked. There is no separate Talbia data plan anymore.
- **Schema-first daily merge order (you enforce for everyone, WORKFLOW.md D14/D20):** every day your `schema/*` PR merges **first**; you regenerate `types/database.ts` in that same PR; then all open feature branches rebase on `main` and re-import from the regenerated types. This is the "daily regenerate-and-rebase ritual."
- **What blocks your own later phases:** Phase 2 auth wire-up needs `profiles` + RLS live (B2); catalog search wire-up needs `search_catalog()` + seeded `catalog_products` (B3+B4); analytics wire-up needs `analytics_events` (B2). All of those are your own backend phases — you unblock yourself.

**High-level order:** Phase 0-A → 0-B → 0-C → 0-D → 0-E (foundation, all mock) → B1 local stack → B2 core migration + RLS + trigger → B3 RPCs → B4 Kaggle seed → B5 RLS verification SQL → B6 generate types + apply to hosted → Phase 2 wire real auth/catalog/You/analytics → Phase 3 polish → Phase 4 ongoing review/merge.

---

## 5. Backend contract you build (field names the team relies on)

These are the exact shapes `mocks/types.ts` mirrors and `types/database.ts` will generate. Keep the hook return shapes stable across the mock→real swap.

### Tables (columns abbreviated — full spec in `docs/DATA-MODEL.md`)

| Table              | Key columns                                                                                                                                                                                                                                                                                                                           | RLS                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `profiles`         | `id`(=auth.uid), `username`, `avatar_url?`, `age_range?`, `location?`, `selected_goals text[]` (≥1), `current_streak`/`longest_streak`/`last_log_date` (**display only**)                                                                                                                                                             | owner only                                                                  |
| `catalog_products` | `id`, `brand`, `name`, `category`, `shade_or_variant?`, `image_url?`, `source` (provenance), `active_flag`                                                                                                                                                                                                                            | **read = all authenticated**; no user writes (only globally-readable table) |
| `products`         | `id`, `user_id`, `catalog_product_id?`, `brand`, `name`, `shade?`, `category` enum, `format` enum, `status` enum (unopened/in_rotation/finished), `percent_remaining` 0–100, `photo_url?`, `pao_months?`(6/12), `opened_at?`, `is_priority` (**trigger: max 5 true/user**), `source_wishlist_item_id?`                                | owner only                                                                  |
| `usage_logs`       | `id`, `product_id`, `percent_after` 0–100, `note?`, `photo_url?`, `logged_at` (one row per log; never overwrite)                                                                                                                                                                                                                      | owner only (via product)                                                    |
| `wishlist_items`   | `id`, `user_id`, `catalog_product_id?`, `brand`, `name`, `shade?`, `category`, `price?`, `product_url?`, `photo_url?`, `priority` enum (high/medium/low), `rank_position?`, `reflection_response?`, `cooling_off_ends_at` (default `now()+14d`), `reminder_at?`, `status` enum (cooling/ready/removed/purchased), `last_reviewed_at?` | owner only                                                                  |
| `empties`          | `id`, `user_id`, `product_id`, `review_text?`, `repurchase` enum (yes/maybe/no), `months_in_use?`, `photo_url?`                                                                                                                                                                                                                       | **PRIVATE: read = owner only, write = owner only**                          |
| `analytics_events` | `id`, `user_id?`, `event_name`, `entity_id?`, `source_view?`, `properties jsonb?` (**never raw review text**)                                                                                                                                                                                                                         | owner only                                                                  |

**Do NOT create:** `empty_likes`, `badges`, or any public/global read RLS on `empties` (all deferred, D13/D15).

### The five RPCs and the hook that wraps each

| RPC                  | Signature                                                         | Behavior                                                                                                                                        | Wrapping `lib/api` hook                                                   |
| -------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `log_usage`          | `(product_id uuid, percent int, note text, photo_url text)`       | insert `usage_log`, update `products.percent_remaining`, bump streak if first log today                                                         | `useProducts` (usage mutation) — also called from Home & inventory detail |
| `finish_product`     | `(product_id uuid, review text, repurchase text, photo_url text)` | set `status=finished`, `is_priority=false`, insert **private** `empties` row, compute `months_in_use` from `opened_at`. **No badges/points**    | `useEmpties` (finish mutation)                                            |
| `get_dashboard`      | `()`                                                              | one round-trip: focus products, status counts for donut, streak, per-category active counts, wishlist items with `status='ready'`               | `useDashboard`                                                            |
| `search_catalog`     | `(q text, category text null, limit int)`                         | case-insensitive **prefix** type-ahead over `catalog_products` (brand+name), returns `{id, brand, name, category, shade_or_variant, image_url}` | `useCatalogSearch` (and `ProductSearch`)                                  |
| `find_similar_owned` | `(category text, exclude_product_id uuid null)`                   | count + list of active owned products in the same category — powers the F5 duplicate intercept                                                  | `useProducts` (similar-owned selector) / consumed by Joon's banner        |

---

## 6. Phases

### Phase 0 — Foundation (critical path; MERGE before anyone else starts)

Split so each PR stays ≤ ~400 lines. Do 0-A first (repo), 0-B (Supabase project + GitHub) can overlap, then 0-C / 0-D / 0-E as separate PRs.

---

#### Phase 0-A — Scaffold, theme, tab navigator, shared UI kit

**Goal:** A running Expo app with expo-router file-based tabs, the NativeWind theme wired to DESIGN-TOKENS, the shared UI primitives, and `npm run verify` passing.

**Paste this to your agent:**

```
You are scaffolding the PanPals React Native app. Read AI-CONTEXT.md and docs/DESIGN-TOKENS.md first. Create a fresh Expo project (SDK 53+) with TypeScript strict, expo-router (file-based routing), NativeWind, Zustand, and TanStack Query. Do NOT hardcode any hex, font, or radius — everything comes from the theme.

Create/edit ONLY these files:
- package.json — deps: expo, expo-router, react, react-native, nativewind, tailwindcss, zustand, @tanstack/react-query, @supabase/supabase-js, react-native-svg, expo-font, expo-secure-store; devDeps: typescript, jest, jest-expo, @testing-library/react-native, eslint, eslint-config-expo, prettier. Add scripts EXACTLY per docs/TESTING.md: typecheck, lint, format:check, test, verify.
- tsconfig.json (strict: true), babel.config.js (nativewind/babel + expo-router plugins), metro.config.js, app.json (name "PanPals", scheme "panpals", expo-router plugin), .eslintrc.js, .prettierrc, jest.config.js (preset jest-expo), .gitignore, .env.example.
- theme/tokens.ts — export every color, typography, radius, spacing value from docs/DESIGN-TOKENS.md verbatim (PanPal Aesthetic Design System v2.0.0: surface #FFF8F4, card #FFFFFF, primary text #333333 / on-surface #201a1a, brand rose #F2A2A2, eco/sage #A8C69F, warning/intercept #F8D7DA, border #E0D9D4 = also the ring track, error #ba1a1a, radii sm/DEFAULT/md/lg/xl/full, Libre Caslon Text + Satoshi typography scale).
- tailwind.config.js — map those tokens to NativeWind theme keys (colors, fontFamily, borderRadius, spacing). content globs cover app/, components/, features/.
- theme/fonts.ts — load Libre Caslon Text (serif, headlines, via `@expo-google-fonts/libre-caslon-text`) and Satoshi (body/labels). Satoshi is NOT on Google Fonts: download the weights (400/500/600/700) from fontshare.com/fonts/satoshi (ITF Free License), put the files in `assets/fonts/`, and register them with `expo-font` `useFonts({ 'Satoshi-Regular': require('../assets/fonts/Satoshi-Regular.otf'), ... })`. Add the files to git so teammates get them on pull.
- global.css (nativewind directives) and wire it in app/_layout.tsx.
- app/_layout.tsx — root Stack with providers: QueryClientProvider, font loader + splash gate, and a slot that routes to (auth) when signed out, (tabs) when signed in (use a placeholder auth store from lib/ for now).
- app/(tabs)/_layout.tsx — expo-router Tabs with EXACTLY five tabs in this order: Home | Inventory | Progress | Wishlist | You. Fixed bottom nav, icon + label each, active tint = brand rose, each tab has accessibilityLabel, 1.5–2pt line icons (filled only when active).
- Placeholder tab screens so the app runs: app/(tabs)/you.tsx (real, mine). For index.tsx, inventory.tsx, progress.tsx, wishlist.tsx create minimal placeholders that render a centered "Coming soon" using components/ui, with a comment "PLACEHOLDER — owned by <Aaron/Matt/Talbia/Joon>, do not build here."
- components/ui/Button.tsx (pill; primary = brand fill + white text; secondary = light blush fill/pink text; pressed = primary-deep; accessibilityRole="button"), Card.tsx (white, radius >=24, soft diffused shadow ~12% opacity, never hard border/black shadow), Input.tsx (pill), Badge.tsx / Chip.tsx (pill, low-contrast e.g. light sage bg + dark sage text), Icon.tsx wrapper.
- components/ui/EmptyState.tsx, LoadingState.tsx, ErrorState.tsx — reusable, calm non-judgmental copy, each takes title/message/optional action props; ErrorState has retry; all have accessibilityLabels; never color-only status.
- components/ui/index.ts barrel export.

Every user-visible string uses calm, non-judgmental, second-person tone. Every touchable has an accessibilityLabel. Add an RTL smoke test in components/ui/__tests__/ that renders Button, EmptyState, LoadingState, ErrorState.

Only edit files under my lane; if anything else is needed, output a CROSS-LANE REQUEST and stop.
```

**Files created:** `package.json`, `tsconfig.json`, `babel.config.js`, `metro.config.js`, `app.json`, `.eslintrc.js`, `.prettierrc`, `jest.config.js`, `.gitignore`, `.env.example`, `global.css`, `theme/tokens.ts`, `theme/fonts.ts`, `tailwind.config.js`, `app/_layout.tsx`, `app/(tabs)/_layout.tsx`, placeholder `app/(tabs)/{index,inventory,progress,wishlist}.tsx`, `app/(tabs)/you.tsx` (stub), `components/ui/{Button,Card,Input,Badge,Chip,Icon,EmptyState,LoadingState,ErrorState,index}.tsx`, `components/ui/__tests__/ui.test.tsx`.

**Verify:**

- `npm install` then `npm run verify` → tsc, eslint, prettier --check, jest all green, zero warnings.
- `npx expo start` → iOS sim (`i`). Confirm: app boots signed-out, the 5-tab bar shows **Home | Inventory | Progress | Wishlist | You** in that order, tapping each switches screens, You renders.
- `grep -rEn "#[0-9a-fA-F]{6}" app components | grep -v theme/` returns nothing outside `theme/`.

**Done when:**

- [ ] `npm run verify` passes (tsc --noEmit, eslint --max-warnings 0, prettier --check, jest).
- [ ] RTL smoke test covers the UI primitives.
- [ ] Loading / empty / error components render.
- [ ] Only my-lane files changed (`git diff --name-only main`).
- [ ] PR filled per `.github/pull_request_template.md`.

---

#### Phase 0-B — GitHub repo + branch protection + hosted Supabase project

**Goal:** A public repo with protected `main`, CODEOWNERS auto-assigning you, a PR template, and your live hosted Supabase project (keys held by you only).

Do these by hand (web + terminal), then use the agent only for `.github/*`:

1. **Create the repo & make it PUBLIC** (free branch protection on public repos; also a design-fair exhibit). Push your 0-A branch.
2. **Protect `main`:** Settings → Branches → rule for `main`: require a PR, require 1 approval, require review from Code Owners, require up-to-date branch, block force pushes, block direct pushes. Enable **squash-merge only** (disable merge commits + rebase).
3. **Confirm your hosted Supabase project** (from §3): URL + anon key in `.env`; service-role key stays in your CLI/shell only. `supabase link --project-ref <ref>`.

**Paste this to your agent (for the .github files only):**

```
Create ONLY these files, no others:
- .github/CODEOWNERS — assign reviewers by AI-CONTEXT.md §3 lanes: app/_layout.tsx, app/(auth)/*, app/(tabs)/_layout.tsx, app/(tabs)/you.tsx, supabase/*, types/database.ts, lib/*, theme/*, mocks/*, docs/*, .github/*, scripts/*, components/ui/* → @shrey; app/(tabs)/index.tsx, features/home/*, components/ProgressRing.tsx → @aaron; app/(tabs)/wishlist.tsx, features/wishlist/* → @joon; app/(tabs)/inventory.tsx, features/inventory/* → @matt; app/(tabs)/progress.tsx, features/empties/* → @talbia. A catch-all "* @shrey" line last.
- .github/pull_request_template.md — checkboxes mirroring AI-CONTEXT §7 Definition of Done: npm run verify passes; RTL test added; Maestro flow passes; loading/empty/error states exist; only my-lane files changed (paste git diff --name-only main); PRD function named; screenshots/gif. Plus a "CROSS-LANE REQUEST?" y/n line, and for schema PRs a "RLS verification output attached?" line.

Only edit files under my lane; if anything else is needed, output a CROSS-LANE REQUEST and stop.
```

**Files created:** `.github/CODEOWNERS`, `.github/pull_request_template.md`.

**Verify:**

- Throwaway test PR → auto-requests **@shrey**, shows the template. Cannot merge without approval; cannot push to `main`.
- Repo public; squash-merge is the only merge button.
- `supabase link` succeeds; `supabase projects list` shows your project.

**Done when:**

- [ ] Repo public; `main` protected (PR + 1 CODEOWNERS review + up-to-date + no force push).
- [ ] Squash-merge only.
- [ ] PR template + CODEOWNERS live and auto-assigning (note: `supabase/*` and `types/database.ts` route to you now, not Talbia).
- [ ] Hosted Supabase project live; URL/anon in `.env` + `.env.example`; service-role key held only in your CLI.

---

#### Phase 0-C — mocks/types.ts + fixtures + the five lib/api hooks (THE unblocker)

**Goal:** All five `lib/api` hooks return realistic fixtures typed by `mocks/types.ts`, so Aaron/Joon/Matt/Talbia build immediately. Single most important deliverable for parallel work.

**Paste this to your agent:**

```
Read docs/DATA-MODEL.md fully. Create the mock-first data layer. UI must NEVER call supabase-js directly — all data flows through these hooks. Until types/database.ts exists, hooks return fixtures from mocks/ typed by mocks/types.ts.

Create/edit ONLY:
- mocks/types.ts — TypeScript types mirroring docs/DATA-MODEL.md EXACTLY: Profile (selected_goals text[], current_streak/longest_streak/last_log_date display-only), CatalogProduct (brand, name, category enum, shade_or_variant, image_url, source, active_flag), Product (status unopened|in_rotation|finished; percent_remaining 0-100; category lip|face|eye|skincare|fragrance|hair|other; format full|mini|sample; is_priority; catalog_product_id?; shade?; pao_months? 6|12; source_wishlist_item_id?), UsageLog (percent_after, note?, photo_url?, logged_at), WishlistItem (priority high|medium|low; status cooling|ready|removed|purchased; cooling_off_ends_at = created + 14 days; reflection_response?; reminder_at?; source_wishlist_item_id link), Empty (repurchase yes|maybe|no; months_in_use?; PRIVATE), AnalyticsEvent, and a DashboardData shape (focus products, status counts for donut, streak, category counts, wishlist items ready). Export the category enum as a shared const. Do NOT include badges/likes fields.
- mocks/fixtures.ts — realistic seed: a demo profile with 2 goals + a 5-day streak; ~12 catalog_products across categories (real-sounding brands/names/shades); ~8 products spanning all statuses, some is_priority (<=5), varied percent_remaining in 5% steps; several usage_logs; ~4 wishlist_items (some cooling, one ready/day-14, a category with >=3 owned items to trigger the intercept); ~3 private empties with verdicts. Internally consistent (user_ids match, focus <=5).
- lib/api/useProducts.ts — useQuery returning products fixture; create/update/finish + usage mutation stubs mutating the in-memory fixture and invalidating. Expose a similar-owned selector (category count) mirroring find_similar_owned. Wishlist->inventory conversion via a shared createFromWishlist helper.
- lib/api/useWishlist.ts — wishlist items + add/remove/purchase stubs; computes cooling_off_ends_at = now + 14 days; flips to "ready" at day 14.
- lib/api/useDashboard.ts — returns DashboardData in one object, mirroring get_dashboard().
- lib/api/useEmpties.ts — private empties list + finishProduct stub (sets status=finished, is_priority=false, creates empty, computes months_in_use). NO badges/points.
- lib/api/useCatalogSearch.ts — takes (query, category?, limit?); brand/name prefix filtering over the catalog fixture; debounced; mirrors search_catalog(). Powers F1 + F5 pre-fill.
- lib/api/index.ts barrel; lib/queryKeys.ts centralized TanStack Query keys.
Add a comment atop each hook: "MOCK-FIRST: returns fixtures until types/database.ts lands (AI-CONTEXT §2). Swap internals only; keep this signature stable so feature screens never change."
Add hook tests in lib/api/__tests__/ asserting each returns the fixture shape and catalog search filters by prefix + category.

Only edit files under my lane; if anything else is needed, output a CROSS-LANE REQUEST and stop.
```

**Files created:** `mocks/types.ts`, `mocks/fixtures.ts`, `lib/api/{useProducts,useWishlist,useDashboard,useEmpties,useCatalogSearch,index}.ts`, `lib/queryKeys.ts`, `lib/api/__tests__/hooks.test.ts`.

**Verify:**

- `npm run verify` green.
- Temporarily log `useDashboard()` in the You tab; confirm realistic data renders (focus ≤5, donut counts, 5-day streak). Remove temp log before PR.
- Confirm ≥1 category in fixtures has ≥3 active owned products (so Joon's intercept banner triggers).

**Done when:**

- [ ] All five hooks return typed fixtures; signatures match the future RPCs (§5).
- [ ] `mocks/types.ts` mirrors DATA-MODEL.md (no deferred fields).
- [ ] Hook tests pass; `npm run verify` green.
- [ ] Only my-lane files changed; PR filled; announce "lib/api is live — build against mocks."

---

#### Phase 0-D — ProductSearch shared component + analytics track() + auth shell

**Goal:** The reusable `ProductSearch` type-ahead (Joon & Matt import it), `track()` + event dictionary, and the auth store/shell.

**Paste this to your agent:**

```
Read docs/DATA-MODEL.md (event dictionary + catalog_products) and AI-CONTEXT.md.

Create/edit ONLY:
- components/ui/ProductSearch.tsx — reusable catalog type-ahead. Props: onSelect(catalogProduct), category?, placeholder?, allowManual (default true). Uses useCatalogSearch from lib/api (debounced). Renders an Input (pill) + results list of Card rows (brand · name · shade, thumbnail radius 16). Selecting calls onSelect with catalog fields for pre-fill; a persistent "Enter manually" fallback row always shows (manual entry never blocked). Loading -> LoadingState, no results -> EmptyState (calm copy), error -> ErrorState. Full accessibilityLabels; no color-only status. Export from components/ui/index.ts. Imported by Joon (wishlist add) and Matt (log modal) — keep the API stable.
- lib/analytics.ts — track(event: EventName, props?: Record<string, unknown>). EventName is a string-literal union of EXACTLY the DATA-MODEL.md dictionary: account_completed, inventory_item_added, wishlist_item_added, focus_product_set, usage_logged, duplicate_warning_shown, warning_decision, product_finished, wishlist_item_removed, wishlist_item_purchased. For now console.logs a structured event and buffers to an in-memory array (later inserts into analytics_events). NEVER accept/log raw review text — strip/deny a review_text prop. Export the EventName type for teammates.
- lib/auth/store.ts — Zustand store { session, user, isLoading, signUp, signIn, signOut } backed by a mock/in-memory session for now (real Supabase wiring is Phase 2). Persist a signed-in flag via expo-secure-store.
- lib/auth/useAuth.ts — hook exposing the store.
- app/(auth)/_layout.tsx — Stack for the auth flow.
Add tests: ProductSearch shows results on typing a prefix and calls onSelect; track() rejects raw review text and only allows dictionary events.

Only edit files under my lane; if anything else is needed, output a CROSS-LANE REQUEST and stop.
```

**Files created:** `components/ui/ProductSearch.tsx`, `lib/analytics.ts`, `lib/auth/store.ts`, `lib/auth/useAuth.ts`, `app/(auth)/_layout.tsx`, tests under `components/ui/__tests__/` and `lib/__tests__/`.

**Verify:**

- `npm run verify` green.
- Drop `ProductSearch` on You temporarily, type a fixture brand; confirm type-ahead + selecting fires `onSelect` and "Enter manually" always shows. Remove before PR.
- `track('account_completed')` logs a structured event; passing `review_text` is rejected.

**Done when:**

- [ ] `ProductSearch` reusable, imports `useCatalogSearch`, has three states + a11y labels.
- [ ] `track()` typed to the exact dictionary; refuses raw review text.
- [ ] Auth store/shell in place (mock session).
- [ ] Tests pass; only my-lane files changed; PR filled.

---

#### Phase 0-E — Auth screens + goal capture + You tab (real) + Maestro shell

**Goal:** Welcome / sign-up / sign-in / goal-capture (row 1) and the real You tab (row 20), all against the mock auth store.

**Paste this to your agent:**

```
Read AI-CONTEXT.md and docs/PRD.md (matrix rows 1 and 20). Build the auth flow and You tab against the MOCK auth store (lib/auth) — no supabase-js.

Create/edit ONLY:
- app/(auth)/welcome.tsx — PanPal serif wordmark, calm value prop, "Create account" (primary) + "Sign in" (secondary) pill buttons.
- app/(auth)/sign-up.tsx — email + password Inputs, validation, calls store.signUp; on success routes to goal capture. Errors -> inline calm ErrorState copy.
- app/(auth)/sign-in.tsx — email + password, store.signIn, route to (tabs) on success.
- app/(auth)/goal-capture.tsx — collect FIRST NAME (required) + choose >=1 goal from chips ("Finish what I own", "Cut impulse buys", "Reduce waste", "Build a routine"); OPTIONAL age_range + location clearly skippable ("Skip for now"). On complete: save to profile via mock, fire track('account_completed'), route to Home. Enforce >=1 goal before enabling continue.
- app/(tabs)/you.tsx — real Profile/You: shows first name + selected goals with "Edit goals" (reopens chip picker); an in-app notification/reminder toggle (opt-in, OFF by default — privacy-by-default); "Sign out" (store.signOut -> welcome); "Delete account" requiring a typed/confirm dialog explaining it removes all data, then a mock deleteAccount -> welcome. Streak shown DISPLAY ONLY. No badges/points. Every control has an accessibilityLabel; touch targets >=44px; no color-only status.
- All user-visible strings in a local strings module within my lane (app/(auth)/strings.ts and a you strings file) — calm, non-judgmental, second person.
- Create .maestro/ with catalog-search.yaml shell (open app -> reach a screen with ProductSearch -> type a brand -> tap a result). Add auth steps to signup.yaml if practical.
Add RTL tests: goal capture requires >=1 goal; You delete-account requires confirmation; sign-out routes to welcome.

Only edit files under my lane; if anything else is needed, output a CROSS-LANE REQUEST and stop.
```

**Files created:** `app/(auth)/{welcome,sign-up,sign-in,goal-capture,strings}.tsx`, real `app/(tabs)/you.tsx` (+ strings), `.maestro/catalog-search.yaml`, `.maestro/signup.yaml`, tests under respective `__tests__/`.

**Verify:**

- `npm run verify` green.
- Sim walkthrough: Welcome → Create account → sign-up → **goal capture blocks continue until ≥1 goal**, optionals skippable → Home. You tab: edit goals works, toggle OFF by default, sign out → Welcome, delete requires confirmation.
- `maestro test .maestro/catalog-search.yaml` (and `signup.yaml`) pass on a running sim.

**Done when:**

- [ ] Row 1 works on mock auth (≥1 goal, skippable optionals).
- [ ] Row 20 works (edit goals, toggle default-off, sign out, delete-with-confirmation).
- [ ] Loading/empty/error on every screen; a11y labels + ≥44px targets.
- [ ] RTL + Maestro pass; `npm run verify` green; only my-lane files changed; PR filled.
- [ ] **After 0-E merges: announce Phase 0 DONE — Aaron/Joon/Matt/Talbia may start against mocks.**

---

### Backend phases (B1–B6) — you build the whole thing; runs right after Phase 0

Branch every backend PR as `schema/<slug>`. Each is a ≤~400-line PR. Develop against the **local** Supabase stack first; only apply to hosted at B6.

---

#### Phase B1 — Local Supabase stack

**Goal:** `supabase/` initialized and the local Postgres stack running under Docker, so you can iterate on migrations without touching hosted.

**Paste this to your agent:**

```
Read docs/DATA-MODEL.md. Initialize the Supabase project structure in this repo. Assume Docker Desktop is running and the Supabase CLI is installed.

Create/edit ONLY:
- supabase/config.toml (via `supabase init`) — project id "panpals", default local ports.
- supabase/.gitignore for local volumes.
- supabase/seed.sql placeholder (empty header comment for now; Kaggle seed lands in B4).
- scripts/db-reset.sh — wraps `supabase db reset` (applies all migrations + seed to the local stack) with a comment on usage.
- scripts/rls-check.sh placeholder (RLS verification SQL lands in B5).
Do NOT create migrations yet (that is B2). Do NOT touch hosted.

Only edit files under my lane (supabase/*, scripts/*); if anything else is needed, output a CROSS-LANE REQUEST and stop.
```

**Files created:** `supabase/config.toml`, `supabase/.gitignore`, `supabase/seed.sql` (placeholder), `scripts/db-reset.sh`, `scripts/rls-check.sh` (placeholder).

**Verify:**

- `supabase start` boots the local stack (Postgres + Studio + Auth); `supabase status` prints local URL + local anon/service keys.
- `supabase db reset` runs clean (no migrations yet, so just an empty DB).
- Studio opens at the local URL.

**Done when:**

- [ ] `supabase start` / `supabase status` succeed under Docker.
- [ ] `scripts/db-reset.sh` runs `supabase db reset` cleanly.
- [ ] Only `supabase/*` + `scripts/*` changed; PR filled.

---

#### Phase B2 — Core migration: tables + enums + RLS + the max-5-priority trigger

**Goal:** One migration creating every table in §5 with enums, FKs, defaults, RLS policies (owner-only for all user tables incl. **private** empties; catalog readable by all authenticated), and the trigger enforcing **max 5 `is_priority=true` per user**.

**Paste this to your agent:**

```
Read docs/DATA-MODEL.md fully. Create ONE migration under supabase/migrations/ (timestamped, e.g. supabase/migrations/0001_core_schema.sql) implementing the schema EXACTLY. Local stack only — do not apply to hosted.

Enums: product_category (lip, face, eye, skincare, fragrance, hair, other), product_format (full, mini, sample), product_status (unopened, in_rotation, finished), wishlist_priority (high, medium, low), wishlist_status (cooling, ready, removed, purchased), repurchase_verdict (yes, maybe, no).

Tables (all columns per DATA-MODEL.md §Entities):
- profiles (id uuid PK = auth.uid(); username text unique; avatar_url, age_range, location nullable; selected_goals text[] NOT NULL; current_streak/longest_streak int default 0; last_log_date date null; created_at timestamptz default now()).
- catalog_products (id, brand, name, category enum, shade_or_variant, image_url nullable, source text NOT NULL, active_flag bool default true). Index brand+name for prefix search (e.g. lower(brand) text_pattern_ops, lower(name)).
- products (id; user_id FK->profiles; catalog_product_id FK->catalog_products null; brand, name; shade null; category enum; format enum; status enum; percent_remaining int CHECK 0..100; photo_url null; pao_months int null CHECK in (6,12); opened_at date null; is_priority bool default false; source_wishlist_item_id FK->wishlist_items null; created_at).
- usage_logs (id; product_id FK->products; percent_after int CHECK 0..100; note null; photo_url null; logged_at timestamptz default now()).
- wishlist_items (id; user_id FK; catalog_product_id FK null; brand, name; shade null; category enum; price numeric null; product_url null; photo_url null; priority enum default 'medium'; rank_position int null; reflection_response text null; cooling_off_ends_at timestamptz default now() + interval '14 days'; reminder_at timestamptz null; status enum default 'cooling'; last_reviewed_at null; created_at).
- empties (id; user_id FK; product_id FK->products; review_text null; repurchase repurchase_verdict; months_in_use int null; photo_url null; created_at).
- analytics_events (id; user_id FK null; event_name text NOT NULL; entity_id uuid null; source_view text null; properties jsonb null; created_at). Do NOT add a raw-review-text column.

RLS — enable on every table:
- profiles, products, usage_logs (owner via product_id join), wishlist_items, empties, analytics_events: owner-only SELECT/INSERT/UPDATE/DELETE using auth.uid() = user_id (empties is PRIVATE — owner-only read too; NO cross-user or public read).
- catalog_products: SELECT to role authenticated (all logged-in users); no INSERT/UPDATE/DELETE policy for users (seed/admin only).

Trigger: enforce_focus_pot_max — BEFORE INSERT OR UPDATE ON products; when NEW.is_priority = true, count existing is_priority=true rows for NEW.user_id (excluding NEW.id on update); if the resulting count would exceed 5, RAISE EXCEPTION with a calm message ('You can focus on up to 5 products at a time.'). Attach via CREATE TRIGGER.

Do NOT create empty_likes, badges, or any public/global read policy on empties.

Only edit files under supabase/*; if anything else is needed, output a CROSS-LANE REQUEST and stop.
```

**Files created:** `supabase/migrations/0001_core_schema.sql`.

**Verify:**

- `supabase db reset` applies the migration with no errors.
- In Studio / psql: all seven tables exist with correct enums, defaults, FKs; `wishlist_items.cooling_off_ends_at` default resolves to `now()+14d`.
- Trigger asserts (run in psql as a test user): inserting a 6th `is_priority=true` product raises the exception; the 5th succeeds; flipping an existing product to priority when 5 already exist fails.
- RLS is enabled (`SELECT relrowsecurity FROM pg_class` true for all user tables); `catalog_products` has an authenticated SELECT policy.

**Done when:**

- [ ] Migration applies cleanly via `supabase db reset`.
- [ ] All tables/enums/FKs/defaults/checks match DATA-MODEL.md.
- [ ] Max-5-priority trigger enforced (6th fails, 5th passes).
- [ ] RLS enabled owner-only everywhere; empties private; catalog readable by authenticated; no deferred tables created.
- [ ] Only `supabase/*` changed; PR filled.

---

#### Phase B3 — The five RPCs

**Goal:** `log_usage`, `finish_product`, `get_dashboard`, `search_catalog`, `find_similar_owned` as `SECURITY DEFINER` (or invoker where RLS suffices) functions matching the §5 signatures exactly — **no badges/points anywhere**.

**Paste this to your agent:**

```
Read docs/DATA-MODEL.md §RPCs. Create ONE migration supabase/migrations/0002_rpcs.sql defining exactly these five Postgres functions. They must respect RLS (operate as the calling user; use auth.uid()). Signatures and return shapes must match so lib/api hooks map 1:1 with no client reshaping.

- log_usage(product_id uuid, percent int, note text, photo_url text): insert a usage_logs row (percent_after = percent), update products.percent_remaining = percent for that product, and bump the owner's streak ONLY if this is the first log today (compare last_log_date to current_date; increment current_streak, update longest_streak, set last_log_date). Return the updated product row.
- finish_product(product_id uuid, review text, repurchase text, photo_url text): set products.status='finished' and is_priority=false; insert an empties row (review_text=review, repurchase=repurchase::repurchase_verdict, months_in_use computed from opened_at to now in whole months, photo_url); return the new empties row. NO badge/points logic.
- get_dashboard(): return ONE json/record payload with: focus products (is_priority=true, active), status counts for the donut (count by status), current_streak, per-category active-product counts, and wishlist_items with status='ready'. One round-trip.
- search_catalog(q text, category text default null, "limit" int default 20): case-insensitive PREFIX match on catalog_products brand+name (use lower(col) LIKE lower(q)||'%'), optional category filter, active_flag=true, ordered, limited. Return {id, brand, name, category, shade_or_variant, image_url}.
- find_similar_owned(category text, exclude_product_id uuid default null): return count + list of the caller's active (status != 'finished') owned products in that category, excluding exclude_product_id. Powers the F5 duplicate intercept.

Grant EXECUTE on all five to role authenticated.

Only edit files under supabase/*; if anything else is needed, output a CROSS-LANE REQUEST and stop.
```

**Files created:** `supabase/migrations/0002_rpcs.sql`.

**Verify:**

- `supabase db reset` applies both migrations.
- In psql as a seeded test user: `select * from log_usage(...)` updates percent + inserts a log + bumps streak once/day; `finish_product(...)` sets finished + creates a private empties row + computes months_in_use; `get_dashboard()` returns focus/donut/streak/category/ready-wishlist in one payload; `search_catalog('ma')` returns prefix matches; `find_similar_owned('face', null)` returns the right count.
- Confirm no function references badges/points/likes.

**Done when:**

- [ ] All five RPCs match the §5 signatures and return shapes.
- [ ] Each behaves per DATA-MODEL.md; streak bumps once per day; finish is idempotent-safe and private.
- [ ] EXECUTE granted to authenticated; RLS respected.
- [ ] No badge/points/likes logic anywhere; only `supabase/*` changed; PR filled.

---

#### Phase B4 — Kaggle catalog seed (license-clean)

**Goal:** `supabase/seed.sql` populating `catalog_products` from a **license-clean** cosmetics dataset (MIT or CC), with provenance documented and **no retailer scraping**.

**Paste this to your agent:**

```
Read docs/DATA-MODEL.md (catalog_products, D17). I will provide a license-clean cosmetics dataset CSV (Kaggle, MIT or CC-licensed — provenance recorded). Build the catalog seed pipeline.

Create/edit ONLY:
- scripts/build-catalog-seed.ts (or .mjs) — reads a local CSV at data/catalog_raw.csv, maps columns to catalog_products (brand, name, category mapped to our product_category enum, shade_or_variant, image_url if present, source = the dataset name+license+URL), de-dupes, filters to beauty categories, and emits INSERT statements into supabase/seed.sql. Set active_flag=true. Cap to a sensible demo size (a few hundred rows).
- supabase/seed.sql — generated INSERTs (header comment must state dataset name, license (MIT/CC), source URL, and retrieval date for compliance). This is the ONLY place catalog rows are inserted.
- docs/CATALOG-PROVENANCE.md — one page documenting the dataset, its license, the source URL, why it is license-clean (no retailer scraping), and how to regenerate the seed.
Do NOT scrape any retailer. If no CSV is present, generate ~40 clearly-synthetic but realistic rows and note in the header that they are placeholder pending the licensed dataset.

Only edit files under supabase/*, scripts/*, docs/*; if anything else is needed, output a CROSS-LANE REQUEST and stop.
```

**Files created:** `scripts/build-catalog-seed.ts`, `supabase/seed.sql` (populated), `docs/CATALOG-PROVENANCE.md`.

**Verify:**

- `supabase db reset` runs seed; `select count(*) from catalog_products` returns the expected rows.
- `search_catalog('<brand-prefix>')` returns seeded rows; categories all map to the enum.
- `docs/CATALOG-PROVENANCE.md` states license (MIT/CC) + source + date; no retailer scraping.

**Done when:**

- [ ] `catalog_products` seeded from a license-clean dataset; provenance documented.
- [ ] Categories mapped to `product_category`; `active_flag` true; `search_catalog` finds them.
- [ ] Seed is regenerable via `scripts/build-catalog-seed.ts`; only `supabase/*`, `scripts/*`, `docs/*` changed; PR filled.

---

#### Phase B5 — RLS verification SQL (two users)

**Goal:** A repeatable SQL script proving owner-only isolation for all user tables (incl. **private empties**) and global-read for `catalog_products`, using two test users. Output attached to every schema PR (TESTING.md / DATA-MODEL.md).

**Paste this to your agent:**

```
Read docs/DATA-MODEL.md §RLS verification and docs/TESTING.md §RLS. Create a runnable RLS verification harness for the LOCAL stack.

Create/edit ONLY:
- supabase/tests/rls_verification.sql — creates/uses two test users (user A, user B) via auth.users seed or set_config('request.jwt.claim.sub', ...) to simulate each. Assert, with clear PASS/FAIL RAISE NOTICE output:
  * A cannot SELECT/UPDATE/DELETE B's products, wishlist_items, usage_logs, empties, or profiles.
  * empties are NOT readable across users (A cannot read B's empties) — the private-archive change (D13/7-21).
  * Both A and B CAN SELECT catalog_products.
  * The max-5-priority trigger blocks a 6th priority product for a single user.
- scripts/rls-check.sh — runs supabase db reset then psql -f supabase/tests/rls_verification.sql against the local stack and prints the PASS/FAIL summary (this is what you paste into schema PRs).

Only edit files under supabase/*, scripts/*; if anything else is needed, output a CROSS-LANE REQUEST and stop.
```

**Files created:** `supabase/tests/rls_verification.sql`, `scripts/rls-check.sh` (populated).

**Verify:**

- `bash scripts/rls-check.sh` prints all asserts PASS: cross-user reads/writes fail on every owned table, empties private, catalog readable by both, trigger blocks the 6th priority.
- Copy the PASS output into the PR description (required for schema PRs).

**Done when:**

- [ ] All cross-user isolation asserts PASS; empties confirmed private.
- [ ] `catalog_products` confirmed readable by both users.
- [ ] Trigger assert PASS; output attached to the PR; only `supabase/*`, `scripts/*` changed.

---

#### Phase B6 — Generate types/database.ts + apply to hosted (daily regenerate-and-rebase ritual)

**Goal:** Generate `types/database.ts` from the schema, push all migrations + seed to your **hosted** project, and establish the daily ritual you run for the team.

**Paste this to your agent (for the type-gen + script only):**

```
Read AI-CONTEXT.md §2/§4. Generate the typed database client contract and a helper script.

Create/edit ONLY:
- types/database.ts — generated by `supabase gen types typescript` (linked project). Do NOT hand-edit the body; add only a top comment: "GENERATED — do not hand-edit. Regenerate via scripts/gen-types.sh after any migration (AI-CONTEXT §4)."
- scripts/gen-types.sh — runs `supabase gen types typescript --linked > types/database.ts` and reminds the operator to commit it in the same PR as the migration, then tell feature owners to rebase.
Confirm types/database.ts exports the same table row shapes and enums that mocks/types.ts mirrors, so the Phase 2 swap needs no signature changes.

Only edit files under types/*, scripts/*; if anything else is needed, output a CROSS-LANE REQUEST and stop.
```

Then, by hand: `supabase db push` (applies 0001 + 0002 to hosted), `supabase db reset --linked` is NOT used on hosted; instead run the seed via `psql`/Studio against hosted once. Verify hosted RLS with a two-user check.

**Files created:** `types/database.ts`, `scripts/gen-types.sh`.

**Verify:**

- `npm run verify` green (tsc sees `types/database.ts`).
- Hosted project shows all tables/RPCs/seed; a two-user check against hosted matches B5 results.
- `types/database.ts` enums/rows line up field-for-field with `mocks/types.ts` (diff by eye).

**Done when:**

- [ ] Migrations + seed applied to hosted; hosted RLS verified.
- [ ] `types/database.ts` generated and committed; matches `mocks/types.ts` shapes.
- [ ] `scripts/gen-types.sh` documents the **daily regenerate-and-rebase ritual** (schema PR merges first → regenerate types in same PR → feature owners rebase + re-import). Only `types/*`, `scripts/*` changed (+ hosted, no code).

---

### Phase 2 — Wire real auth + catalog search + You tab + analytics (swap mocks for real data)

**Goal:** Point `lib/api` at real Supabase, wire real auth to `profiles`, catalog search to `search_catalog()`, You-tab profile edits/delete to real rows, and analytics to `analytics_events` — **without changing any hook signature**, so feature screens need zero edits.

**Paste this to your agent:**

```
types/database.ts now exists (I generated it). Wire the mock-first layer to real Supabase WITHOUT changing any public hook signature — feature screens must not change.

Create/edit ONLY:
- lib/supabase.ts — create the supabase-js client from EXPO_PUBLIC_SUPABASE_URL + EXPO_PUBLIC_SUPABASE_ANON_KEY, with expo-secure-store session persistence. This is the ONLY file that imports @supabase/supabase-js.
- Switch each lib/api hook internal to call Supabase/RPCs, keeping the SAME return types (now sourced from types/database.ts): useDashboard -> get_dashboard(); useCatalogSearch -> search_catalog(); useEmpties.finish -> finish_product(); useProducts usage -> log_usage(); useProducts similar-owned -> find_similar_owned(); wishlist add relies on the DB default for cooling_off. Keep mocks/ as the test double (unit tests still mock these hooks — never hit real Supabase in Jest).
- lib/auth/store.ts + useAuth.ts -> real Supabase auth (signUp/signIn/signOut, session listener). goal-capture writes selected_goals + first name to profiles. You-tab deleteAccount calls the real deletion path.
- lib/analytics.ts -> track() now inserts into analytics_events via lib/api (still refuses raw review text).
Update lib/api tests to mock the supabase client. Do NOT edit any feature screen, supabase/*, or types/database.ts contents.

Only edit files under my lane; if anything else is needed, output a CROSS-LANE REQUEST and stop.
```

**Files created/edited:** `lib/supabase.ts`, updated `lib/api/*`, `lib/auth/*`, `lib/analytics.ts`, updated `lib/api/__tests__`.

**Verify:**

- `npm run verify` green.
- Sim against hosted: sign up creates a real `profiles` row with goals; catalog search returns seeded rows; finishing a product writes a real **private** `empties` row; `analytics_events` rows appear.
- `git diff --name-only main` shows only `lib/*` (no feature screen changed).
- Maestro `catalog-search.yaml` still passes against real data.

**Done when:**

- [ ] `lib/supabase.ts` is the only supabase-js importer; hook signatures unchanged.
- [ ] Real auth + goal capture + catalog search + You edits/delete + analytics work end to end.
- [ ] Unit tests still mock hooks (no live Supabase in Jest); `npm run verify` green.
- [ ] Only `lib/*` changed; PR filled.

---

### Phase 3 — Polish (states, a11y, analytics coverage, Maestro)

**Goal:** Every shared screen has real empty/loading/error states, the a11y + privacy baseline (row 25) is enforced app-wide, all dictionary events fire, and your Maestro flows are solid.

**Paste this to your agent:**

```
Polish pass on my lane only. Read AI-CONTEXT.md §5-6 and docs/DESIGN-TOKENS.md.
- Audit app/(auth)/*, app/(tabs)/you.tsx, and components/ui/* for the three states (loading/empty/error) and calm copy.
- Accessibility baseline (matrix 25): every touchable has an accessibilityLabel; contrast meets WCAG AA against surface #fff8f4; touch targets >=44px; status never conveyed by color alone. Add an a11y checklist note to docs/.
- Privacy-by-default: notification/reminder toggle defaults off; empties stay private; confirm no raw review text ever reaches track() or analytics_events.
- Confirm every dictionary event fires from the right place in my lane (account_completed on goal capture complete).
- Finalize .maestro/catalog-search.yaml and signup.yaml; keep them green.
Add/expand RTL tests for the polished states.

Only edit files under my lane; if anything else is needed, output a CROSS-LANE REQUEST and stop.
```

**Files created/edited:** updates across `app/(auth)/*`, `app/(tabs)/you.tsx`, `components/ui/*`, `.maestro/*`, `docs/` a11y note.

**Verify:**

- `npm run verify` green.
- VoiceOver through auth + You — every control announces a meaningful label.
- Maestro `catalog-search.yaml` + `signup.yaml` pass.

**Done when:**

- [ ] Loading/empty/error on every shared screen; a11y labels + AA contrast + ≥44px targets; no color-only status.
- [ ] Privacy defaults verified; dictionary events fire; Maestro green; `npm run verify` green; only my-lane files changed; PR filled.

---

### Phase 4 — Ongoing review/merge role + moderated user testing

**Goal:** Run the full Maestro set nightly, keep `main` demoable, run the daily merge windows, and support the 5–8 tester moderated sessions (≤15s median log; intercept changes ≥1 decision; finish "motivating").

Not an agent-coding task. Your standing duties as lead:

- **Nightly:** `maestro test .maestro/` (full set: log-product, focus-and-ring, wishlist-intercept, catalog-search, finish-and-archive). Anything red blocks the demo — file a fix.
- **Every 12pm & 9pm — the 4-gate PR pipeline (WORKFLOW.md) for all four teammates:** pull the branch, `npm run verify`, run the module's Maestro flow, `/review` for logic, Antigravity lane-check ("verify this PR only touches paths owned by <author> per AI-CONTEXT §3"), then read the diff against the named PRD function. Squash-merge if green.
- **Enforce schema-first merge order daily:** your `schema/*` PR merges first; regenerate `types/database.ts` in the same PR (`scripts/gen-types.sh`); tell feature owners to rebase on `main` and re-import.
- **Facilitate testing:** record log-time timings and verbatim quotes as design-fair exhibits.

**Verify / Done when:**

- [ ] Full Maestro set green nightly; `main` always demoable.
- [ ] All PRs pass the 4 gates before squash-merge; no lane violations reach `main`.
- [ ] Daily regenerate-and-rebase ritual observed.
- [ ] Success metrics captured from 5–8 testers.

---

## 7. Cross-lane requests you'll RECEIVE and how to route them

You own every cross-cutting file (theme, mocks, `lib/api`, UI kit, **and now `supabase/*` + `types/database.ts`**), so you rarely _send_ a request — you _receive and route_ them. When a teammate files a `CROSS-LANE REQUEST`, handle it as an additive change in your lane:

**Paste this to your agent when a request comes in:**

```
A teammate filed this CROSS-LANE REQUEST: <paste it>. Make ONLY the minimal, ADDITIVE change to the named file(s) in my lane (theme/*, mocks/*, components/ui/*, lib/api/* signatures, or — if it needs schema — supabase/* + a regenerated types/database.ts). Never change a hook return shape or a column in a breaking way — add optional fields/columns instead. If schema changes, add a new migration (never edit a merged one), re-run RLS verification, regenerate types, and update mocks/types.ts to match. Add/adjust a test. Then tell me exactly which teammate to notify to rebase.

Only edit files under my lane; if anything else is needed, output a CROSS-LANE REQUEST and stop.
```

**Typical inbound requests and routing:**

- _Aaron needs a new field on `Product` (e.g. an extra donut status count in `get_dashboard`)_ → add the optional column via a new migration, extend the RPC additively, regenerate types, mirror in `mocks/types.ts`, notify Aaron to rebase.
- _Joon needs `ProductSearch` to accept a `category` filter_ → already supported; point him at the prop.
- _Matt needs `find_similar_owned` to also return the newest item's shade_ → extend the RPC return additively, regenerate types, mirror mock, notify Matt.
- _Talbia (empties UI) needs an extra field on the `Empty` shape or `finish_product` return_ → additive column/return, new migration, re-run RLS verification (empties stay **private**), regenerate types, notify Talbia.
- _Anyone asks for badges/likes/points/a public empties feed_ → **decline**; these are deferred (D13/D15). Empties stay private; no `empty_likes`/`badges`.

Always: schema change = new migration + RLS re-verify + type regen + mock mirror, merged first, then teammates rebase.

---

## 8. Common pitfalls

- **Breaking a hook signature (or a column) in Phase 2 / a schema change.** Changing a `lib/api` return shape or renaming a column breaks all four teammates. Add optional fields/columns; never rename/remove. The mock-first contract is why 5 people build at once.
- **Editing a merged migration.** Never edit `supabase/migrations/*` once merged — always add a new timestamped migration. Editing history breaks everyone's `db reset`.
- **Skipping RLS verification on a schema PR.** Every `schema/*` PR must attach the `scripts/rls-check.sh` PASS output — especially the assert that **empties are NOT cross-user readable**.
- **Making empties readable / creating deferred tables.** Never create `empty_likes`, `badges`, or a public/global read policy on `empties`. No points/streak-driven rewards — streak columns are **display only**.
- **Committing the service-role key.** It never enters `.env`, the app, or the repo — CLI/shell only. Only the anon key (safe under RLS) ships.
- **Scraping retailers for the catalog.** Seed only from a license-clean (MIT/CC) dataset with provenance in `docs/CATALOG-PROVENANCE.md`.
- **Letting supabase-js leak into UI.** Only `lib/supabase.ts` imports it (Phase 2+). Screens/features go through `lib/api`.
- **Forgetting the daily regenerate-and-rebase ritual.** Schema PR merges first, regenerate `types/database.ts` in the same PR, tell feature owners to rebase — every day.
- **Hardcoding a hex/font/radius.** Everything from `theme/`. Run the grep check before every PR.
- **PRs over ~400 lines.** Phase 0 is split 0-A…0-E; backend is split B1…B6. One module/migration per PR.
- **Skipping `npm run verify` because "you're the lead."** No exceptions, including you (TESTING.md).
- **Color-only status / missing accessibilityLabels.** Row 25 is yours and applies everywhere — icon+text, never color alone.
- **Editing another lane to "just fix it fast."** Even as lead, route it as an additive change against your own contract or a separate PR to the right owner — keeps the diff honest and the design-fair exhibit clean.
