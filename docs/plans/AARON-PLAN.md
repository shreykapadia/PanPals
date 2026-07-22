# Aaron's Implementation Plan — Home, Focus Pot & Progress Rings

> **Mission:** Build Maya's daily "open app → see my rings → tap → slide 5% → done" loop on the Home dashboard, plus the reusable ProgressRing that Matt's Progress tab reuses. **PRD functions owned:** F2 (update usage / % remaining), F3 (Focus Pot, max 5), F4 (visualize depletion — ring + donut), F8 (streak display only). **Matrix rows owned:** 8 (Focus Pot), 9 (usage logging + streak), 10 (progress visualization + weekly checkmarks), 14 (Home dashboard shell contents).

---

## 1. Your lane

| ✅ OWN & edit | 📥 Import but NEVER edit | 🚫 Forbidden (other lanes / not in scope) |
|---|---|---|
| `app/(tabs)/index.tsx` (Home screen) | `components/ui/*` (Shrey — shared primitives: Card, Button, Chip, etc.) | `app/(tabs)/inventory.tsx`, `features/inventory/*` (Matt); `app/(tabs)/progress.tsx`, `features/empties/*` (Talbia) |
| `features/home/*` (components, hooks, `strings.ts`, `__tests__/`) | `lib/api/*` hooks — esp. `useDashboard`, `useProducts`, `track()` (Shrey) | `app/(tabs)/wishlist.tsx`, `features/wishlist/*` (Joon) |
| `components/ProgressRing.tsx` (reusable ring — YOU own it; Matt imports it) | `mocks/types.ts` + `mocks/*` fixtures (Shrey) | `app/_layout.tsx`, `app/(auth)/*`, `lib/*`, `theme/*`, `mocks/*`, `components/ui/*`, `docs/*`, `scripts/*` (Shrey) |
| `.maestro/focus-and-ring.yaml` (your flow) | `theme/*` NativeWind token config (Shrey) | `supabase/*`, `types/database.ts` (Shrey) |

**The #1 rule of this project is: never edit a file outside your lane.** If a task seems to need it, you stop and file a CROSS-LANE REQUEST (see §6). Merge conflicts are the enemy; staying in your lane is how five people ship in parallel.

---

## 2. How to use this plan (you are not a coder — that's fine)

1. Work through the phases **in order**. Do not skip ahead — Phase 0 (Shrey's foundation) must be merged before you start Phase 1.
2. Each phase has a grey **"Paste this to your agent"** box. Copy the whole box, paste it into your AI coding agent (Claude Code / Codex / Antigravity), and let it work.
3. When the agent finishes, run the **Verify** steps yourself. Click what it says to click. If something's wrong, tell the agent what you saw and ask it to fix it.
4. Check off every item in **Done when** before you open a Pull Request (PR).
5. If the agent ever says it needs to edit a file that's NOT in your lane (§1), it should **stop and print a CROSS-LANE REQUEST**. Copy that request and post it in the team channel for Shrey. Do not let the agent "just fix it."
6. Commit roughly every 30 minutes (ask the agent: "commit what we have with a short message"). Small commits are your undo button.
7. One module = one branch = one PR. Keep PRs under ~400 changed lines. If it's bigger, split the work across two PRs.

---

## 3. Before you start (one-time machine setup)

Do this once. Paste each line into your terminal (the black text app), press Enter, wait for it to finish before the next.

```bash
# 1. Get the code (ask Shrey for the exact repo URL if you don't have it)
git clone <REPO_URL> panpals
cd panpals

# 2. Install everything the app needs (takes a few minutes)
npm install

# 3. Start the app
npx expo start
```

After `npx expo start` you'll see a QR code and a menu:
- **Phone:** install **Expo Go** from the App Store / Play Store, then scan the QR code.
- **Web (easiest to click around):** press `w` in the terminal to open it in your browser.
- **iOS simulator:** press `i` (needs Xcode). **Android emulator:** press `a` (needs Android Studio).

To stop the app: click the terminal and press `Ctrl + C`.

**The one command you'll run constantly** (this is the quality gate — no CI server exists, so this IS the check):
```bash
npm run verify
```
It runs TypeScript, lint, formatting, and tests. It must show **zero errors** before every PR.

---

## 4. Dependencies & sequencing

- **Wait for Shrey's Phase 0 to merge into `main` before you write any code.** Phase 0 gives you: the NativeWind theme/tokens, the `components/ui/*` primitives, `mocks/types.ts`, and the `lib/api/*` hooks (`useDashboard`, `useProducts`, `track`) returning **mock data**. Confirm with Shrey that Phase 0 is merged, then `git pull` on `main`.
- **You build against mocks, not the database.** `useDashboard()` and `useProducts()` return fixture data until Shrey's `types/database.ts` lands. Your UI **never** imports supabase-js and **never** writes SQL. Logging a usage goes through the shared `useProducts` / `log_usage` hook — same hook Matt calls from inventory. You build the *interaction*; the hook does the *write*.
- **`components/ProgressRing.tsx` is YOURS, but Matt imports it** in the Progress tab. So its props API must be clean and stable — decide it in Phase 1 and don't change it casually later. If you must change its props after Matt starts using it, that's a CROSS-LANE coordination (§6), because it affects his screen.
- **Suggested build order:** Phase 1 (ProgressRing → static Home against mocks) → Phase 2 (wire the real hooks + logging interaction) → Phase 3 (states, a11y, analytics, Maestro) → Phase 4 (user testing support).
- **Every session starts clean:**
  ```bash
  git checkout main && git pull && git checkout -b feat/aaron/<slug>
  ```
  e.g. `feat/aaron/progress-ring`, `feat/aaron/home-dashboard`. Never resume the agent on a stale branch. Never `git push --force`, never merge, never commit to `main`.

---

### Backend fields & hooks you use (quick reference)

You read/write these only through Shrey's `lib/api` hooks — never SQL, never supabase-js.

**Hooks**
- `useDashboard()` → `{ focusProducts: Product[], statusCounts: { unopened, in_rotation, finished }, streak: { current, longest, lastLogDate }, categoryCount, wishlistReady }` (wraps `get_dashboard`).
- `useProducts()` → `{ data: Product[], update(id, patch), logUsage(product_id, percent_after, note?, photo_url?) }`. Pin/unpin a focus product via `update(id, { is_priority })`; log a use via `logUsage` (wraps `log_usage`).

**Columns you touch**
- `products`: `id, brand, name, shade?, category (lip|face|eye|skincare|fragrance|hair|other), status (unopened|in_rotation|finished), percent_remaining (0–100, 5% steps), photo_url?, opened_at?, is_priority (max 5 true per user — DB trigger also enforces)`.
- `usage_logs`: `percent_after, logged_at` (progress history + days-since-last-use).
- `profiles`: `current_streak, longest_streak, last_log_date` (display only — no rewards).

## 5. Phases

### Phase 1 — ProgressRing + static Home dashboard (against mocks)

**Goal:** Ship the reusable `ProgressRing` (with a stable props API), then a Home screen that lays out focus cards, quick-action pills, a status donut, recent progress, the streak/weekly-checkmark row, and the "wishlist ready to reconsider" nudge — all reading mock data from `useDashboard` / `useProducts`. No real writes yet.

> **Paste this to your agent:**
> ```
> You are working in the PanPals repo (Expo SDK 53+, React Native, TypeScript strict, expo-router, NativeWind, Zustand, TanStack Query). Read AI-CONTEXT.md, docs/DESIGN-TOKENS.md, docs/DATA-MODEL.md, and docs/PRD.md first.
>
> Build TWO things.
>
> (A) components/ProgressRing.tsx — a reusable SVG progress ring (use react-native-svg).
>   Props (keep this API stable; Matt's Progress tab will import it):
>     - percent: number (0–100)
>     - size?: number (default 96)
>     - strokeWidth?: number (default 10, must render >= 8)
>     - label?: string (centered text, optional)
>     - accessibilityLabel: string (REQUIRED)
>   Visuals per docs/DESIGN-TOKENS.md: rounded stroke caps ALWAYS; filled arc uses the "brand" token (PanPal Rose); the unfilled track uses the warm-grey border token (#E0D9D4); stroke width 10px. Never hardcode a hex, font, or radius — pull colors from the NativeWind theme in theme/. Ring fills clockwise from top (12 o'clock).
>
> (B) app/(tabs)/index.tsx — the Home dashboard, matching docs/mockups/home-dashboard.png as ground truth. Put real logic in hooks/components under features/home/*; keep the screen file thin.
>   Data: consume useDashboard() and useProducts() from lib/api (mock data for now). Do NOT call supabase-js. Do NOT edit anything under lib/api, components/ui, theme, or mocks — import only.
>   Sections:
>     1. Top app bar: centered "PanPal" serif wordmark (Libre Caslon Text via token).
>     2. Today's Focus: cards for the pinned/priority products (max 5), each showing a ProgressRing with the product's percent_remaining and a "days since last use" label.
>     3. Status donut: a small donut summarizing status counts (unopened / in_rotation / finished) from useDashboard.
>     4. Quick-action pills (pill buttons above the bottom nav): "Scan" (visual placeholder only — no logic), "Search", "Log Item". Use components/ui pill button primitives.
>     5. Recent progress: a short list of recent usage updates.
>     6. Streak row: current streak counter + a weekly checkmark row (7 days). DISPLAY ONLY — no rewards, badges, or points.
>     7. "Ready to reconsider" nudge: a card for a wishlist item whose cooling-off is ready (data from useDashboard). Tapping it should router.push to the Wishlist tab route — do NOT import or edit Joon's wishlist files; navigate by route path only.
>   All user-visible strings live in features/home/strings.ts (no inline string literals in JSX). Copy tone: calm, non-judgmental, second person (see AI-CONTEXT §5). No predictive "finish date" text anywhere unless clearly labeled as an estimate.
>   Use tokens for every color/font/radius/spacing. Cards: white on the off-white surface, radius >= 24, soft diffused shadow — no hard borders.
>
> Add Jest + React Native Testing Library tests under features/home/__tests__/ covering: ProgressRing renders the right arc for 0/50/100 percent and exposes its accessibilityLabel; the Focus section never renders more than 5 rings; the streak row is display-only (no reward UI).
>
> Only edit files under my lane (app/(tabs)/index.tsx, features/home/*, components/ProgressRing.tsx). If anything else is needed, output a CROSS-LANE REQUEST describing exactly what you need and stop.
>
> When done, run `npm run verify` and fix everything until it passes with zero errors.
> ```

**Files created:**
- `components/ProgressRing.tsx`
- `app/(tabs)/index.tsx` (Home screen — thin)
- `features/home/FocusCard.tsx`, `features/home/StatusDonut.tsx`, `features/home/QuickActions.tsx`, `features/home/StreakRow.tsx`, `features/home/ReconsiderNudge.tsx` (or similar component split)
- `features/home/useHomeData.ts` (thin wrapper over useDashboard/useProducts)
- `features/home/strings.ts`
- `features/home/__tests__/ProgressRing.test.tsx`, `features/home/__tests__/Home.test.tsx`

**Verify:**
```bash
npm run verify        # must be zero errors
npx expo start        # then press w for web
```
Click through: Home shows the PanPal wordmark; up to (not more than) 5 focus rings each with a "days since last use" label; a status donut; three quick-action pills (Scan/Search/Log Item); a streak number + 7-day checkmark row; a "ready to reconsider" card. Tapping that card navigates to the Wishlist tab. Rings are rose-filled with rounded ends and a lighter track. Nothing is pure red; no shaming words.

**Done when:**
- [ ] `npm run verify` passes with zero errors.
- [ ] ProgressRing has the exact props above and rounded caps, rose fill, 50%-opacity track, stroke >= 8px.
- [ ] Home matches `home-dashboard.png` layout and uses only tokens (no hardcoded hex/font/radius).
- [ ] Focus section is capped at 5 rings.
- [ ] Streak row is display-only (no badges/points/rewards visible).
- [ ] All strings are in `features/home/strings.ts`.
- [ ] Only files in my lane changed: `git diff --name-only main` shows only lane paths.
- [ ] Tests exist under `features/home/__tests__/`.

---

### Phase 2 — Wire real interactions: pin/unpin Focus Pot + tap-ring usage logging

**Goal:** Make the Home dashboard *interactive* against the shared hooks: pin/unpin products to the Focus Pot (guard max 5 in the UI), and tap a focus ring → 5%-step slider → write via the shared `useProducts` / `log_usage` hook, in ≤3 taps.

> **Paste this to your agent:**
> ```
> Continue in the PanPals repo, my lane only. Re-read AI-CONTEXT.md and docs/DATA-MODEL.md (RPCs section) first.
>
> Add two interactions to the Home dashboard. Put logic in hooks/components under features/home/*; the screen stays thin.
>
> (1) Focus Pot pin/unpin (F3 / matrix 8):
>   - Let the user pin or unpin a product as a focus product (is_priority) via the shared lib/api useProducts hook (mock write for now — do NOT call supabase-js, do NOT write SQL).
>   - Guard MAX 5 pinned in the UI: when 5 are pinned, disable/greys the pin action and show a calm message from strings.ts (e.g. "Your Focus Pot holds 5 — unpin one to add another"). Note the DB trigger also enforces this; the UI guard is a friendly pre-check, not the only defense.
>   - Non-judgmental copy, second person.
>
> (2) Usage logging from a ring (F2 / matrix 9), <= 3 taps total:
>   - Tap a focus ring -> opens a slider that moves in 5% steps (0,5,10,...,100).
>   - On confirm, write the new percent through the shared lib/api useProducts / log_usage hook (the same hook Matt calls from inventory detail). Each log is a new usage row — never overwrite history. Do NOT edit Matt's files; both callers share this one hook.
>   - Optimistically update the ring so it visibly moves. Handle the pending/success/failure of the write.
>
> Use TanStack Query for the server-state mutation and Zustand only if you need local UI state (e.g., which slider is open). Every touchable gets an accessibilityLabel. Never rely on color alone for status.
>
> Add/extend tests under features/home/__tests__/ for: pin guard blocks the 6th pin; slider snaps to 5% steps; confirming the slider calls the shared log_usage hook with the chosen percent.
>
> Only edit files under my lane (app/(tabs)/index.tsx, features/home/*, components/ProgressRing.tsx). If anything else is needed, output a CROSS-LANE REQUEST and stop.
>
> Run `npm run verify` and fix until it passes.
> ```

**Files created / changed:**
- `features/home/useFocusPot.ts` (pin/unpin + max-5 guard)
- `features/home/useLogUsage.ts` (wraps shared `useProducts`/`log_usage` mutation)
- `features/home/RingSlider.tsx` (5%-step slider modal/sheet)
- Updates to `FocusCard.tsx`, `app/(tabs)/index.tsx`, `strings.ts`, and `__tests__/`

**Verify:**
```bash
npm run verify
npx expo start        # press w for web (or i / a for simulators)
```
Click: pin products until 5 are pinned — the pin control then blocks a 6th with a calm message. Tap a focus ring — a slider appears; drag it and confirm you can only land on 5% marks; confirm; the ring visibly moves. Count your taps from Home to a logged update: it should be ≤3.

**Done when:**
- [ ] `npm run verify` passes with zero errors.
- [ ] Pinning is capped at 5 in the UI with non-judgmental copy.
- [ ] Ring tap → 5%-step slider → write via the shared `useProducts`/`log_usage` hook (no supabase-js, no SQL).
- [ ] Logging a usage from Home is ≤3 taps.
- [ ] Ring updates optimistically.
- [ ] Only my-lane files changed (`git diff --name-only main`).
- [ ] Tests cover the pin guard and the 5%-step slider write.

---

### Phase 3 — States, accessibility, analytics, Maestro flow

**Goal:** Production-ready polish: loading / empty / error states for Home (including the brand-new-user "no products yet" empty state), full accessibility pass, fire the two analytics events via the shared `track()`, and write the `focus-and-ring.yaml` Maestro flow.

> **Paste this to your agent:**
> ```
> Continue in the PanPals repo, my lane only. Re-read AI-CONTEXT.md §5–§7 and docs/TESTING.md first.
>
> Polish the Home dashboard (features/home/*, app/(tabs)/index.tsx) — my lane only.
>
> (1) States for Home (AI-CONTEXT §7 requires all three):
>   - Loading: skeletons/placeholders while useDashboard/useProducts are pending.
>   - Empty: a brand-new user with NO products. Show a warm, calm empty state that points them to "Log Item" (no shame). Copy in strings.ts.
>   - Error: a gentle retry state if a hook errors. Never a scary red wall unless it's a real failure; use Soft Amber tone per DESIGN-TOKENS.
>   Use the shared empty/error patterns from components/ui if Shrey provides them (import only — do not edit them). If they don't exist yet, build a local one and file a CROSS-LANE REQUEST asking Shrey whether a shared pattern should exist.
>
> (2) Accessibility: every touchable has a meaningful accessibilityLabel; rings and the donut convey status with text/number, not color alone; check tap targets are large enough.
>
> (3) Analytics (matrix 24) — fire via the shared lib/api track() helper (import only):
>   - track('focus_product_set', { ... }) when a product is pinned to the Focus Pot.
>   - track('usage_logged', { ... }) when a ring usage is logged.
>   Never log raw review text or PII.
>
> (4) Maestro flow .maestro/focus-and-ring.yaml asserting: pin a product -> Home shows its ring -> open the slider -> update % -> ring reflects the new value.
>
> Extend features/home/__tests__/ to cover the empty state (no products) and that track() is called on pin and on log.
>
> Only edit files under my lane (app/(tabs)/index.tsx, features/home/*, components/ProgressRing.tsx, .maestro/focus-and-ring.yaml). If anything else is needed, output a CROSS-LANE REQUEST and stop.
>
> Run `npm run verify` and fix until it passes.
> ```

**Files created / changed:**
- `features/home/HomeEmptyState.tsx`, `features/home/HomeErrorState.tsx`, `features/home/HomeSkeleton.tsx`
- `.maestro/focus-and-ring.yaml`
- Updates to `useHomeData.ts`, `useFocusPot.ts`, `useLogUsage.ts` (fire `track()`), `strings.ts`, `__tests__/`

**Verify:**
```bash
npm run verify
maestro test .maestro/focus-and-ring.yaml     # needs a running simulator/emulator
npx expo start
```
Click: with mock data set to "no products," Home shows the warm empty state pointing to Log Item. Force an error (ask the agent how to toggle the mock) and confirm the gentle retry state. Turn on a screen reader briefly and confirm rings/donut announce their values. Run the Maestro flow — it should go green.

**Done when:**
- [ ] `npm run verify` passes with zero errors.
- [ ] Loading, empty (new user, no products), and error states all exist and are calm/non-judgmental.
- [ ] Every touchable has an accessibilityLabel; status never conveyed by color alone.
- [ ] `focus_product_set` and `usage_logged` fire via shared `track()`.
- [ ] `.maestro/focus-and-ring.yaml` passes locally.
- [ ] Only my-lane files changed.
- [ ] Tests cover the empty state and analytics calls.

---

### Phase 4 — User-testing support (design fair)

**Goal:** Help the moderated sessions (5–8 MBA testers) hit the PRD metrics: the daily check-in feels like something Maya would do unprompted, and logging is fast. No new features — just fixes surfaced by testing.

> **Paste this to your agent:**
> ```
> Continue in the PanPals repo, my lane only. We are in user testing. Do NOT add features.
>
> Based on this tester feedback: <PASTE THE SPECIFIC ISSUE, e.g. "testers didn't notice they could tap the ring" or "the slider felt slow">, make the smallest possible fix to the Home dashboard (features/home/*, app/(tabs)/index.tsx, components/ProgressRing.tsx) to address it. Keep copy calm and non-judgmental. Keep the ring usage log at <= 3 taps.
>
> Only edit files under my lane. If a fix needs another lane, output a CROSS-LANE REQUEST and stop.
>
> Run `npm run verify` and fix until it passes.
> ```

**Files changed:** small edits within `features/home/*`, `app/(tabs)/index.tsx`, `components/ProgressRing.tsx`.

**Verify:** `npm run verify`; re-run `focus-and-ring.yaml`; click through the specific flow the tester struggled with and time the log (target ≤15s median, ≤3 taps).

**Done when:**
- [ ] The reported issue is fixed with the smallest change.
- [ ] Log-from-Home is still ≤3 taps / feels fast.
- [ ] `npm run verify` passes; Maestro flow still green.
- [ ] Only my-lane files changed.

---

## 6. Cross-lane requests you'll likely need (pre-written)

Copy the relevant block, fill the brackets, and post it in the team channel for Shrey to route. **Do not let your agent edit the file itself.**

**A. Shared hook fields for the dashboard.** If `useDashboard()` doesn't return everything Home needs:
```
CROSS-LANE REQUEST — to Shrey (lib/api)
Home needs useDashboard() to return: focus products (with percent_remaining + days-since-last-use), status counts for the donut, current_streak + last-7-days log flags for the checkmark row, and the wishlist item that's "ready to reconsider" (id + minimal display fields + its route target). Currently missing: [LIST]. Can lib/api add these to the mock + hook shape?
```

**B. Log-usage hook signature.** If the shared write path isn't exposed the way the ring needs:
```
CROSS-LANE REQUEST — to Shrey (lib/api)
The Home ring slider needs to log a usage via the shared useProducts/log_usage hook: log_usage(product_id, percent, note?, photo_url?). Please confirm the exact hook name and args so Home and Matt's inventory detail both call the same one. Currently the mock exposes: [WHAT YOU SEE].
```

**C. Focus Pot cap in the mock.** If you can't test the max-5 guard because the mock has no priority flag/toggle:
```
CROSS-LANE REQUEST — to Shrey (lib/api / mocks)
To build and test the Focus Pot max-5 guard, useProducts needs a way to set/unset is_priority in the mock and reflect the count. Can the mock support toggling is_priority so I can verify the 6th-pin block in the UI?
```

**D. Wishlist deep-link route.** For the "ready to reconsider" nudge:
```
CROSS-LANE REQUEST — to Shrey / Joon
The Home "ready to reconsider" nudge should deep-link to a specific wishlist item on Joon's Wishlist tab. What is the exact route path/params to router.push to (e.g. /(tabs)/wishlist?itemId=...)? I will navigate by route only and will not edit wishlist files.
```

**E. Shared empty/error pattern.** If Shrey owns the cross-cutting empty/error components:
```
CROSS-LANE REQUEST — to Shrey (components/ui)
Does a shared empty-state / error-state primitive exist in components/ui I should import for Home's new-user and error states? If yes, point me to it. If not, I'll build a local one in features/home for now.
```

**F. ProgressRing API change after Matt adopts it.** If you must change props once Matt imports the ring:
```
CROSS-LANE REQUEST — to Matt (+ Shrey to route)
I need to change components/ProgressRing.tsx props: [OLD] -> [NEW], because [REASON]. Your Progress tab imports it — can we align on the new API so your screen doesn't break? Proposed change is backward-compatible: [YES/NO].
```

---

## 7. Common pitfalls

- **Editing outside your lane.** The single biggest risk. If the agent touches `lib/api`, `components/ui`, `theme`, `mocks`, Matt's or Joon's files — stop it and file a CROSS-LANE REQUEST. Prove your PR is clean with `git diff --name-only main`.
- **Hardcoding a hex/font/radius.** Never. Everything comes from the NativeWind theme (`theme/`) fed by `docs/DESIGN-TOKENS.md`. Rose `#f2a2a2` is a *token*, not a literal you type.
- **Calling supabase-js or writing SQL.** You never do either. All data goes through `lib/api` hooks. Aaron never writes SQL.
- **Breaking ProgressRing's props after Matt imports it.** Lock the API in Phase 1; changes afterward need coordination (§6-F).
- **Treating the streak as a reward.** Streak + weekly checkmarks are **display only** — no badges, points, unlocks, or celebrations tied to them. That's a hard project decision (D15).
- **Adding a predictive "finish date."** Not allowed unless clearly labeled as an estimate. Don't imply certainty.
- **More than 5 focus rings, or a slider that isn't 5% steps.** These are spec'd numbers (max 5, 5% steps, ≤3 taps). Tests should protect them.
- **Inline strings in JSX.** All user-visible copy lives in `features/home/strings.ts`.
- **Skipping states.** Loading, empty (new user), and error are required on Home — not optional polish.
- **Shaming or alarming copy / red alerts.** Tone is calm, second person, never judgmental. Errors use Soft Amber unless it's a true failure. Copy exists this way because of Claire's churn risk.
- **Skipping `npm run verify`.** There is no CI. If you skip it you ship broken code to four teammates. Run it before every PR; keep PRs ≤~400 lines; squash-merge one module per PR.
- **Working on a stale branch.** Always `git checkout main && git pull && git checkout -b feat/aaron/<slug>` at the start of a session. After Shrey merges a schema PR, rebase on `main` and re-pull.
