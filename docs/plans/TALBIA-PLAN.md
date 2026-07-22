# Talbia's Implementation Plan — Finish, Empties & Progress

> **Mission:** Build Maya's payoff moment — "I used it all up." When a product hits empty, Talbia's flow turns it into a gratifying, **private** finish: a ring-close/confetti celebration, a months-in-use chip, a quick repurchase verdict, and a permanent entry in the user's **private empties archive** on the Progress tab. No feed, no likes, no points, no badges — this is a personal shelf, not a social post. **PRD function owned:** F6 (finish a product — gratifying, private). **Matrix rows owned:** 11 (finish/celebration flow), 12 (repurchase review), and the **Progress-tab side** of rows 10/14 (My Progress summary hosting the archive).
>
> **Role note (D20, 7/21):** Talbia is a **front-end feature owner**. She does **not** own the backend, schema, RPCs, or data hooks — Shrey owns all of that. Talbia consumes Shrey's hooks (`useEmpties`, `useDashboard`, `useProducts`) and builds the screens on top of them.

---

## 1. Your lane

| ✅ OWN & edit | 📥 Import but NEVER edit | 🚫 Forbidden (other lanes / not in scope) |
|---|---|---|
| `app/(tabs)/progress.tsx` (Progress tab screen) | `components/ui/*` (Shrey — Card, Button, Chip, and any shared empty/error primitives) | `app/(tabs)/inventory.tsx`, `features/inventory/*` (Matt — incl. the "Mark as Finished" button) |
| `features/empties/*` (components, hooks, `strings.ts`, `__tests__/`) | `components/ProgressRing.tsx` (Aaron — you import it for the celebration + summary) | `app/(tabs)/index.tsx`, `features/home/*` (Aaron) |
| `.maestro/finish-and-archive.yaml` (your flow) | `lib/api/*` hooks — esp. `useEmpties`, `useDashboard`, `useProducts`, and `track()` (Shrey) | `app/(tabs)/wishlist.tsx`, `features/wishlist/*` (Joon) |
| | `mocks/types.ts` + `mocks/*` fixtures (Shrey) | `app/_layout.tsx`, `app/(tabs)/_layout.tsx`, `app/(auth)/*`, `app/(tabs)/you.tsx`, `lib/*`, `theme/*`, `mocks/*`, `components/ui/*`, `docs/*`, `scripts/*` (Shrey) |
| | `theme/*` NativeWind token config (Shrey) | `supabase/*`, `types/database.ts` (Shrey) |

**The #1 rule of this project is: never edit a file outside your lane.** If a task seems to need it, you stop and file a CROSS-LANE REQUEST (see §7). Merge conflicts are the enemy; staying in your lane is how five people ship in parallel.

**Two seams you depend on but never edit:**
- **The finish entry point** lives on Matt's inventory item detail. His "Mark as Finished" button only **navigates** (expo-router) into *your* finish screen. You own the destination; Matt owns the button. Neither of you edits the other's files — you just agree on the route name (§4, §7-A).
- **The ProgressRing** is Aaron's. You import it for the celebration ring-close and for the Progress summary. If you ever need its props to change, that's a cross-lane coordination with Aaron (§7-D), not an edit.

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

- **Wait for Shrey's Phase 0 to merge into `main` before you write any code.** Phase 0 gives you: the NativeWind theme/tokens, the `components/ui/*` primitives, `mocks/types.ts`, and the `lib/api/*` hooks (`useEmpties`, `useDashboard`, `useProducts`, `track`) returning **mock data**. Confirm with Shrey that Phase 0 is merged, then `git pull` on `main`.
- **You build against mocks, not the database.** `useEmpties()`, `useDashboard()`, and `useProducts()` return fixture data until Shrey's `types/database.ts` lands. Your UI **never** imports supabase-js and **never** writes SQL. Finishing a product goes through the shared `useEmpties().finish(...)` — the hook does the write (it wraps the `finish_product` RPC); you build the *interaction and celebration*.
- **The finish entry point is a route, not a button you build.** Matt's inventory item detail has the "Mark as Finished" button; it calls `router.push(...)` to a route that renders *your* finish screen. **Agree on the exact route name and params with Matt + Shrey before Phase 2** (§7-A). You never touch inventory files; you just own what the route opens.
- **ProgressRing comes from Aaron.** Import `components/ProgressRing.tsx` for the celebration ring-close animation and for the Progress-tab summary. Don't reimplement a ring.
- **Suggested build order:** Phase 1 (private empties archive + Progress tab, against mocks) → Phase 2 (finish flow + celebration + repurchase review, wired to the finish route and `useEmpties().finish`) → Phase 3 (states, a11y, analytics, Maestro) → Phase 4 (user-testing support).
- **Every session starts clean:**
  ```bash
  git checkout main && git pull && git checkout -b feat/talbia/<slug>
  ```
  e.g. `feat/talbia/empties-archive`, `feat/talbia/finish-flow`. Never resume the agent on a stale branch. Never `git push --force`, never merge, never commit to `main`. After Shrey merges a schema PR, rebase on `main` and re-pull.

---

## 5. Backend fields & hooks you use (quick reference)

You never write SQL or edit these — this is just so you know the exact shapes your screens read and write.

**`empties` table (PRIVATE archive — owner-only read/write, D13).** One row per finished product.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | |
| `user_id` | uuid | owner (RLS keeps it private — never shown as an "author") |
| `product_id` | uuid → products | the product that was finished |
| `review_text` | text \| null | optional 1-liner |
| `repurchase` | enum: `yes` \| `maybe` \| `no` | the verdict (matrix 12) |
| `months_in_use` | int \| null | computed by the RPC from `opened_at` |
| `photo_url` | text \| null | optional |
| `created_at` | timestamptz | when it was finished |

**The finish hook (Shrey's — you consume it):**
```
useEmpties().finish(product_id, review_text?, repurchase, photo_url?)
```
This wraps the `finish_product` RPC, which: sets `products.status = 'finished'`, sets `is_priority = false` (removes it from the Focus Pot), creates the `empties` row, and computes `months_in_use` from `opened_at`. **No badge/points logic.** `useEmpties()` also gives you the list of the current user's empties for the archive (owner-only).

**`products.status` transition:** the finish flow moves a product from `in_rotation` (or `unopened`) → `finished`. You don't set this field yourself — `finish()` does it via the RPC.

**`useDashboard()` (Shrey's — you read the summary from it):** one round-trip returning focus products, status counts for the donut, streak (display only), category count, and wishlist-ready items. On the Progress tab you use the pieces relevant to "My Progress" (e.g. status counts / finished count, streak display). You import Aaron's `ProgressRing` to render any ring in the summary. **Streak fields are display-only — no rewards.**

**Analytics:** fire `track('product_finished', { ... })` via the shared `lib/api` `track()` helper when a finish completes. **Never log the raw `review_text`.**

---

## 6. Phases

### Phase 1 — Private empties archive + Progress tab shell (against mocks)

**Goal:** Build the Progress tab as "My Progress": a summary header (compose Aaron's `ProgressRing` + `useDashboard`) plus the **private empties archive** — a list of the user's finished products. Reuse the `empties-feed.png` **card layout only**, stripped of the like button, author, and any feed framing. Include a warm empty state for "no finishes yet." No finish flow yet, no writes — read mock data from `useEmpties` / `useDashboard`.

> **Paste this to your agent:**
> ```
> You are working in the PanPals repo (Expo SDK 53+, React Native, TypeScript strict, expo-router, NativeWind, Zustand, TanStack Query). Read AI-CONTEXT.md, docs/DESIGN-TOKENS.md, docs/DATA-MODEL.md, and docs/PRD.md (function F6) first.
>
> Build the Progress tab and the private empties archive. Put real logic in hooks/components under features/empties/*; keep app/(tabs)/progress.tsx thin.
>
> (A) app/(tabs)/progress.tsx — the "My Progress" screen.
>   Data: consume useDashboard() and useEmpties() from lib/api (mock data for now). Do NOT call supabase-js. Do NOT edit anything under lib/api, components/ui, theme, or mocks — import only.
>   Sections, top to bottom:
>     1. A summary header "My Progress": import components/ProgressRing.tsx (Aaron's — import only, do NOT edit it) and use useDashboard() to show a simple progress/status summary (e.g. finished count and status donut counts). Streak, if shown, is DISPLAY ONLY — no rewards, badges, or points.
>     2. The private empties archive: a list titled e.g. "Your Empties" of the user's finished products from useEmpties().
>   IMPORTANT SCOPE: There is NO "Community Empties" sub-tab and NO feed. Empties are a PRIVATE personal archive (owner-only). Do NOT build a like button, a follow/comment control, an author name/avatar, or any "posted by" framing. This is the user's own shelf.
>
> (B) features/empties/EmptyCard.tsx — one archive card. Reuse the CARD LAYOUT from docs/mockups/empties-feed.png as a visual reference ONLY, stripped of the like button and all author/feed bits. Show: product photo/thumbnail, brand + name, a months-in-use chip, the repurchase verdict (Yes / Maybe / No) as a pill, and the 1-line review_text if present.
>
> (C) features/empties/EmptiesEmptyState.tsx — a warm, calm empty state for a user with NO finishes yet. Encourage them gently (no shame) — e.g. that their finished products will collect here. Copy in strings.ts.
>
> All user-visible strings live in features/empties/strings.ts (no inline string literals in JSX). Copy tone: calm, non-judgmental, second person (AI-CONTEXT §5). Use tokens for every color/font/radius/spacing — never hardcode a hex, font, or radius; pull from the NativeWind theme in theme/. Cards: white on the off-white surface, radius >= 24, soft diffused shadow — no hard borders. Chips/verdict pills: pill-shaped, low-contrast token pairings (e.g. sage for a positive verdict). Every touchable gets an accessibilityLabel; never rely on color alone to convey the verdict (include the word Yes/Maybe/No).
>
> Add Jest + React Native Testing Library tests under features/empties/__tests__/ covering: the archive renders one EmptyCard per empty from the mock; a card shows the repurchase verdict text and months-in-use chip; the empty state renders when useEmpties returns no items; NO like/author/feed elements are rendered.
>
> Only edit files under my lane (app/(tabs)/progress.tsx, features/empties/*). If anything else is needed, output a CROSS-LANE REQUEST describing exactly what you need and stop.
>
> When done, run `npm run verify` and fix everything until it passes with zero errors.
> ```

**Files created:**
- `app/(tabs)/progress.tsx` (Progress tab — thin)
- `features/empties/EmptyCard.tsx`
- `features/empties/EmptiesArchive.tsx` (the list)
- `features/empties/ProgressSummary.tsx` (summary header composing ProgressRing + useDashboard)
- `features/empties/EmptiesEmptyState.tsx`
- `features/empties/useEmptiesArchive.ts` (thin wrapper over `useEmpties`/`useDashboard`)
- `features/empties/strings.ts`
- `features/empties/__tests__/EmptiesArchive.test.tsx`, `features/empties/__tests__/EmptyCard.test.tsx`

**Verify:**
```bash
npm run verify        # must be zero errors
npx expo start        # then press w for web
```
Click through: open the **Progress** tab. You see a "My Progress" summary at the top (a ring/donut + a finished count) and below it a list of empties cards. Each card shows a product, a months-in-use chip, a Yes/Maybe/No verdict pill, and a review line when present. There is **no** like button, no author name, no "community" tab. Temporarily point the mock at "no empties" (ask the agent how) and confirm the warm empty state appears.

**Done when:**
- [ ] `npm run verify` passes with zero errors.
- [ ] Progress tab shows a "My Progress" summary using Aaron's `ProgressRing` + `useDashboard`, and the private empties archive below it.
- [ ] Empties cards reuse the `empties-feed.png` layout **stripped of likes/author/feed** — verified: no like button, no author, no comments, no "Community" sub-tab.
- [ ] Empty state ("no finishes yet") exists and is warm/non-judgmental.
- [ ] Verdict is conveyed with text (Yes/Maybe/No), not color alone; every touchable has an accessibilityLabel.
- [ ] All strings are in `features/empties/strings.ts`; only tokens used (no hardcoded hex/font/radius).
- [ ] Only files in my lane changed: `git diff --name-only main` shows only `app/(tabs)/progress.tsx` and `features/empties/*`.
- [ ] Tests exist under `features/empties/__tests__/`.

---

### Phase 2 — Finish flow: celebration + repurchase review (wired to `useEmpties().finish`)

**Goal:** Build the "Log an Empty" destination screen that Matt's "Mark as Finished" button navigates into. Confirm the finish → play the celebration (ring-close / confetti + months-in-use chip, **no points/badges**) → collect the repurchase review (rating optional, 1-line `review_text`, verdict Yes/Maybe/No; skippable and editable later) → write it all through `useEmpties().finish(...)`. The finished product then appears in the Phase 1 archive.

> **Coordinate first (do this before pasting):** confirm with Matt + Shrey the exact expo-router **route name and params** the "Mark as Finished" button pushes to (e.g. `/empties/finish?productId=...`). See §7-A. Your screen reads `productId` from the route.

> **Paste this to your agent:**
> ```
> Continue in the PanPals repo, my lane only. Re-read AI-CONTEXT.md and docs/DATA-MODEL.md (the empties table + finish_product RPC + the useEmpties hook) first.
>
> Build the "Log an Empty" finish flow as the destination of a route that Matt's inventory item detail navigates to. The agreed route is: <PASTE THE ROUTE NAME + PARAMS AGREED WITH MATT/SHREY, e.g. /empties/finish?productId=...>. My screen reads the productId from the route params. Put logic in hooks/components under features/empties/*; keep the screen file thin.
>
> Flow (F6 / matrix 11 + 12):
>   1. Confirm step: a calm "Finished this one?" confirmation for the product identified by productId (read its display info via the shared useProducts hook — import only, no supabase-js, no SQL).
>   2. Celebration state on confirm: a ring-close animation (import components/ProgressRing.tsx — Aaron's, import only, do NOT edit) animating to 100%/full, plus a light confetti moment, plus a "months in use" chip. This moment must have NO points, NO badges, NO score — it is a gentle, gratifying acknowledgement only (project decision D15).
>   3. Repurchase review (matrix 12), presented as skippable:
>        - an optional rating,
>        - an optional 1-line review_text input,
>        - a repurchase verdict: Yes / Maybe / No.
>      The user can Skip the whole review, and the plan is that it stays editable later from the archive.
>   4. Save: call the shared useEmpties().finish(product_id, review_text?, repurchase, photo_url?) hook. This wraps the finish_product RPC which sets products.status='finished', sets is_priority=false, creates the private empties row, and computes months_in_use from opened_at. Do NOT set these fields yourself and do NOT call supabase-js — the hook/RPC does the write.
>   5. On success, route the user to the Progress tab where the new empty now appears in the archive.
>
> Handle the pending / success / failure states of the finish() mutation with TanStack Query (calm error copy, allow retry). Use Zustand only for local wizard/UI state if needed. All strings in features/empties/strings.ts. Tokens only — no hardcoded hex/font/radius. Every touchable has an accessibilityLabel; the verdict is conveyed by text (Yes/Maybe/No), not color alone. Copy is calm, second person, celebratory-but-not-gamified.
>
> Add/extend tests under features/empties/__tests__/ covering: confirming the finish calls useEmpties().finish with the chosen verdict and review_text; skipping the review still finishes (verdict handled per our default) and does NOT block; the celebration shows a months-in-use chip and renders NO points/badges/score element.
>
> Only edit files under my lane (app/(tabs)/progress.tsx, features/empties/*). Do NOT edit inventory files — the "Mark as Finished" button is Matt's; I only own the destination. If anything else is needed, output a CROSS-LANE REQUEST and stop.
>
> Run `npm run verify` and fix until it passes.
> ```

**Files created / changed:**
- `features/empties/FinishFlow.tsx` (the screen the route renders — thin)
- `features/empties/CelebrationState.tsx` (ring-close + confetti + months-in-use chip)
- `features/empties/RepurchaseReview.tsx` (rating + 1-line review + Yes/Maybe/No, skippable)
- `features/empties/useFinishProduct.ts` (wraps `useEmpties().finish` mutation)
- Updates to `strings.ts`, `EmptyCard.tsx` (edit-review affordance placeholder), and `__tests__/`
- *(If the route needs a file, e.g. `app/empties/finish.tsx`, confirm ownership with Shrey in §7-A before creating it — it may live in your lane or be scaffolded by Shrey.)*

**Verify:**
```bash
npm run verify
npx expo start        # press w for web (or i / a for simulators)
```
Click: trigger the finish route (in dev you may open it directly, or use Matt's button once his branch is merged). Confirm → a ring closes and confetti plays with a "months in use" chip and **no score/points/badge anywhere**. Enter a 1-line review and pick a verdict; also try **Skip** and confirm it still finishes. After saving, land on the Progress tab and see the just-finished product as a new card in the archive with its verdict.

**Done when:**
- [ ] `npm run verify` passes with zero errors.
- [ ] The finish route renders your screen and reads `productId` from params (route name agreed with Matt + Shrey).
- [ ] Celebration shows ring-close + confetti + months-in-use chip and has **no points, badges, or score**.
- [ ] Repurchase review captures optional rating + 1-line `review_text` + Yes/Maybe/No verdict, and is **skippable**.
- [ ] Saving calls `useEmpties().finish(...)` (no supabase-js, no SQL); the product ends up `status='finished'` and appears in the archive.
- [ ] Pending / success / error states of the mutation are handled with calm copy.
- [ ] Only my-lane files changed (`git diff --name-only main`); **no inventory files touched**.
- [ ] Tests cover finish-with-review, skip, and no-gamification.

---

### Phase 3 — States, accessibility, analytics, Maestro flow

**Goal:** Production polish: loading / empty / error states across the Progress tab and finish flow, a full accessibility pass, fire `product_finished` via the shared `track()`, and write the `finish-and-archive.yaml` Maestro flow.

> **Paste this to your agent:**
> ```
> Continue in the PanPals repo, my lane only. Re-read AI-CONTEXT.md §5–§7 and docs/TESTING.md first.
>
> Polish the Progress tab and finish flow (app/(tabs)/progress.tsx, features/empties/*) — my lane only.
>
> (1) States (AI-CONTEXT §7 requires all three, everywhere data loads):
>   - Loading: skeletons/placeholders while useEmpties/useDashboard/useProducts are pending (archive list + summary).
>   - Empty: the "no finishes yet" archive empty state (from Phase 1) is warm and points forward with no shame.
>   - Error: a gentle retry state if a hook or the finish() mutation errors. Never a scary red wall unless it's a real failure; use Soft Amber tone per DESIGN-TOKENS. Import a shared empty/error primitive from components/ui if Shrey provides one (import only — do not edit). If none exists, build a local one and file a CROSS-LANE REQUEST asking Shrey whether a shared pattern should exist.
>
> (2) Accessibility: every touchable has a meaningful accessibilityLabel; the repurchase verdict and any status is conveyed with text/number, not color alone; celebration animation must not trap focus and should respect reduce-motion (fall back to a static ring-full + chip). Check tap targets are large enough.
>
> (3) Analytics (matrix 24) — fire via the shared lib/api track() helper (import only):
>   - track('product_finished', { ... }) when a finish completes.
>   NEVER log the raw review_text or any PII in the analytics properties.
>
> (4) Maestro flow .maestro/finish-and-archive.yaml asserting: start the finish flow for a product -> confirm -> celebration shows -> pick a verdict / save -> land on the Progress tab -> the finished product appears in the PRIVATE empties archive with its repurchase verdict saved.
>
> Extend features/empties/__tests__/ to cover the loading and error states, and that track('product_finished') is called on a successful finish (and that review_text is not included in the analytics payload).
>
> Only edit files under my lane (app/(tabs)/progress.tsx, features/empties/*, .maestro/finish-and-archive.yaml). If anything else is needed, output a CROSS-LANE REQUEST and stop.
>
> Run `npm run verify` and fix until it passes.
> ```

**Files created / changed:**
- `features/empties/EmptiesSkeleton.tsx`, `features/empties/EmptiesErrorState.tsx`
- `.maestro/finish-and-archive.yaml`
- Updates to `useEmptiesArchive.ts`, `useFinishProduct.ts` (fire `track()`), `strings.ts`, `__tests__/`

**Verify:**
```bash
npm run verify
maestro test .maestro/finish-and-archive.yaml     # needs a running simulator/emulator
npx expo start
```
Click: with the mock set to "loading," the Progress tab shows skeletons; with "no empties," the warm empty state; force an error (ask the agent how to toggle the mock) and confirm a gentle retry, not a red wall. Turn on a screen reader briefly and confirm the verdict pills and summary announce their values; toggle reduce-motion and confirm the celebration degrades to a static full ring + chip. Run the Maestro flow — it should go green.

**Done when:**
- [ ] `npm run verify` passes with zero errors.
- [ ] Loading, empty (no finishes), and error states all exist and are calm/non-judgmental.
- [ ] Every touchable has an accessibilityLabel; verdict/status never conveyed by color alone; reduce-motion respected.
- [ ] `product_finished` fires via the shared `track()`; **no raw review text / PII** in the payload.
- [ ] `.maestro/finish-and-archive.yaml` passes locally and asserts the empty lands in the **private** archive with its verdict.
- [ ] Only my-lane files changed.
- [ ] Tests cover the loading/error states and the analytics call.

---

### Phase 4 — User-testing support (design fair)

**Goal:** Help the moderated sessions (5–8 MBA testers) hit the PRD metric: the finish moment is described as **"motivating," not "restrictive."** No new features — just fixes surfaced by testing.

> **Paste this to your agent:**
> ```
> Continue in the PanPals repo, my lane only. We are in user testing. Do NOT add features.
>
> Based on this tester feedback: <PASTE THE SPECIFIC ISSUE, e.g. "the celebration felt anticlimactic" or "testers didn't realize they could skip the review" or "they expected to edit a verdict later">, make the smallest possible fix to the Progress tab / finish flow (app/(tabs)/progress.tsx, features/empties/*) to address it. Keep copy calm, celebratory, non-judgmental. Keep the finish moment free of points/badges. Keep empties PRIVATE (no feed/likes/author).
>
> Only edit files under my lane. If a fix needs another lane, output a CROSS-LANE REQUEST and stop.
>
> Run `npm run verify` and fix until it passes.
> ```

**Files changed:** small edits within `features/empties/*`, `app/(tabs)/progress.tsx`.

**Verify:** `npm run verify`; re-run `finish-and-archive.yaml`; click through the specific moment the tester struggled with and confirm the finish still feels motivating (not restrictive) and the archive stays private.

**Done when:**
- [ ] The reported issue is fixed with the smallest change.
- [ ] The finish moment still reads as motivating, with no gamification and empties still private.
- [ ] `npm run verify` passes; Maestro flow still green.
- [ ] Only my-lane files changed.

---

## 7. Cross-lane requests you'll likely need (pre-written)

Copy the relevant block, fill the brackets, and post it in the team channel for Shrey to route. **Do not let your agent edit the file itself.**

**A. The finish-route seam (Matt + Shrey) — you'll almost certainly need this in Phase 2.**
```
CROSS-LANE REQUEST — to Matt (+ Shrey to route)
Matt's inventory item detail owns the "Mark as Finished" button; my features/empties finish flow is the destination. We need to agree on ONE expo-router route name + params so his button and my screen match. Proposed: router.push('/empties/finish?productId=<id>') opening my FinishFlow, which reads productId from params.
- Matt: does that route name work for your button?
- Shrey: should the route file (e.g. app/empties/finish.tsx) live in my lane, or will you scaffold it in navigation? Please confirm ownership so I don't edit outside my lane.
```

**B. Missing/changed `useEmpties` hook (Shrey).** If `useEmpties` doesn't expose `finish(...)` or the archive list the way the screens need:
```
CROSS-LANE REQUEST — to Shrey (lib/api)
My finish flow + archive need useEmpties() to expose: (1) finish(product_id, review_text?, repurchase: 'yes'|'maybe'|'no', photo_url?) wrapping the finish_product RPC (sets status=finished, is_priority=false, creates the empties row, computes months_in_use), and (2) the current user's list of empties (owner-only) with product display info, review_text, repurchase, months_in_use, photo_url, created_at. Currently the mock exposes: [WHAT YOU SEE]. Can lib/api add/adjust these on the mock + hook shape?
```

**C. Editing a saved review later (Shrey).** If verdicts/reviews should be editable from the archive (matrix 12 says "editable later"):
```
CROSS-LANE REQUEST — to Shrey (lib/api)
Matrix 12 says the repurchase review is "editable later." Is there (or can there be) a useEmpties() method to update an existing empty's review_text / repurchase verdict? If not exposed yet, what's the intended path? I'll build the edit UI in features/empties once the hook exists.
```

**D. ProgressRing props (Aaron, + Shrey to route).** If the ring you import doesn't expose what the celebration/summary needs:
```
CROSS-LANE REQUEST — to Aaron (+ Shrey to route)
My finish celebration + Progress summary import components/ProgressRing.tsx. I need it to support: [e.g. an animated fill-to-100% for the ring-close, or a size prop for the summary]. Its current props are: [WHAT YOU SEE]. Can we align so I don't need to reimplement a ring or edit your file?
```

**E. Shared empty/error pattern (Shrey).** If Shrey owns the cross-cutting empty/error components:
```
CROSS-LANE REQUEST — to Shrey (components/ui)
Does a shared empty-state / error-state primitive exist in components/ui I should import for the Progress tab's archive-empty and hook-error states? If yes, point me to it. If not, I'll build a local one in features/empties for now.
```

---

## 8. Common pitfalls

- **Rebuilding a social feed.** The `empties-feed.png` mockup is a **layout reference only** — the Community feed is **deferred (D13)**. Reuse the card *shape* but strip the like button, author/avatar, "posted by," comments, and any "Community" sub-tab. Empties are a private personal shelf.
- **Editing inventory files.** The "Mark as Finished" button is **Matt's**. You own only the destination screen. If the agent tries to touch `app/(tabs)/inventory.tsx` or `features/inventory/*`, stop it and use §7-A. Coordinate the route name; never edit his file.
- **Making empties public / cross-user.** RLS on `empties` is **owner-only read and write**. Never frame an empty as belonging to someone else, never add a shared/global list. If a screen implies visibility to other users, it's wrong.
- **Adding points / badges / score to the celebration.** The finish moment is gratifying but **not gamified** — no points, no badges, no unlocks (D15). Ring-close + confetti + months-in-use chip is the whole reward.
- **Editing outside your lane.** The single biggest risk. If the agent touches `lib/api`, `components/ui`, `components/ProgressRing.tsx`, `theme`, `mocks`, or Matt's/Joon's/Aaron's files — stop it and file a CROSS-LANE REQUEST. Prove your PR is clean with `git diff --name-only main`.
- **Calling supabase-js or writing SQL.** You never do either. Finishing goes through `useEmpties().finish(...)`; the archive reads from `useEmpties()`; the summary reads from `useDashboard()`. Talbia never writes SQL.
- **Hardcoding a hex/font/radius.** Never. Everything comes from the NativeWind theme (`theme/`) fed by `docs/DESIGN-TOKENS.md`. Rose `#F2A2A2` and sage `#A8C69F` are *tokens*, not literals you type.
- **Verdict conveyed by color alone.** Always include the word Yes/Maybe/No. Never rely on a green/amber/rose pill by itself.
- **Inline strings in JSX.** All user-visible copy lives in `features/empties/strings.ts`.
- **Skipping states.** Loading, empty (no finishes), and error are required — not optional polish.
- **Shaming or alarming copy.** Tone is calm, celebratory, second person, never judgmental. The finish should feel like a small win, not a scolding.
- **Skipping `npm run verify`.** There is no CI. If you skip it you ship broken code to four teammates. Run it before every PR; keep PRs ≤~400 lines; squash-merge one module per PR.
- **Working on a stale branch.** Always `git checkout main && git pull && git checkout -b feat/talbia/<slug>` at the start of a session. After Shrey merges a schema PR, rebase on `main` and re-pull.
