# Talbia's Implementation Plan — Finish, Empties & Progress

## ▶️ RESUME HERE — read this before anything else (updated 2026-07-28)

> **🟡 You are now the blocker on the footer chain.** Aaron's Phase 5 merged on
> 2026-07-27 (PR #29), which clears step 1 of five. **Step 2 is yours** — the rename to
> `app/(tabs)/empties.tsx` behind a one-line `progress.tsx` shim — and Shrey's nav PR,
> Matt's Phase 5, and your own shim deletion all queue behind it. Phase 3b is still
> more urgent (F6 is broken in production builds), but **do Phase 5 immediately after
> it**, ahead of 3c and 3d, so three other people stop waiting. The old instruction
> "do not start Phase 5 until I tell you Aaron's footer PR has merged" is satisfied:
> it has merged.

**Asking your agent "my plan was updated, where do we continue from?" — this is the answer.**

**Where you left off:** PR #19 is merged. Phases 1 and 2 are built and most of Phase 3 is done. Phase-by-phase breakdown in §0.

**Start with Phase 3b. It is the most urgent thing in the whole project right now.** Your finish flow — the celebration, the repurchase review, everything you built in Phase 2 — is **unreachable in a production build**. Matt's "Mark as Finished" button navigates to your tab with a `finishProductId` param, and your screen never reads it. So F6 does not work end to end in the app we would demo. It is roughly ten lines in your own file.

**Then, in order:**

1. **Phase 3b** (§6) — wire the finish seam. 🔴 Do this first.
2. **Phase 5** (§6) — the footer rename + trim. **Moved up: Aaron merged, so you are step 2 of 5 and three lanes are blocked on you.** Small — a file rename, a one-line shim, and dropping the streak/status duplicates.
3. **Phase 3c** (§6) — swap in Aaron's real `ProgressRing` and delete your stub. His shipped in PR #22.
4. **Phase 3d** (§6) — write `.maestro/finish-and-archive.yaml`. It can't pass until 3b lands, so it goes after.

> **Paste this to your agent to start the session:**
>
> ```
> Read AI-CONTEXT.md in full, then docs/plans/TALBIA-PLAN.md §0 (STATUS) and §5
> (the corrected hook table). My plan was re-audited on 2026-07-27 against
> main @ cdd8e1e. Phases 1 and 2 are already shipped and some instructions later
> in the file are now wrong — §0 overrides anything that contradicts it. In
> particular the finish route is NOT /empties/finish?productId= as older sections
> say; that route was never created.
>
> Then run `git log --oneline -5` and read app/(tabs)/progress.tsx plus
> features/empties/* to see what already exists. Do NOT rebuild any of it.
>
> Start with Phase 3b in §6 — the finish seam is broken and my whole finish flow
> is currently dead code outside __DEV__. Follow that phase's paste block exactly.
>
> After 3b passes verify, do Phase 5 next (§6) — the rename to
> app/(tabs)/empties.tsx behind a one-line progress.tsx re-export shim, plus
> dropping the streak and status counts that duplicate Home. Aaron's footer PR
> merged on 2026-07-27, so Phase 5 is unblocked and three other lanes are now
> waiting on it. Ship it as its own PR before Phase 3c.
>
> Then continue to Phase 3c (swap in Aaron's components/ProgressRing.tsx and
> delete my ProgressRingStub) and Phase 3d (the Maestro flow).
>
> Do NOT delete the progress.tsx shim in the same PR that creates empties.tsx.
> That deletion is a separate 2-line follow-up that must come AFTER Matt repoints
> features/inventory/components/ItemDetailSheet.tsx off '/(tabs)/progress' — I
> will tell you when. Deleting it early breaks F6 in a production build.
>
> Do NOT add any track() calls — useFinishProduct already fires product_finished
> from inside lib/api.
>
> Confirm the plan and the exact files you'll touch before writing any code. Only
> edit files in my lane (app/(tabs)/progress.tsx, features/empties/*,
> .maestro/finish-and-archive.yaml); if anything else is needed — especially
> anything in features/inventory/* — stop and output a CROSS-LANE REQUEST. Run
> `npm run verify` at the end and fix until green.
> ```

> **Mission:** Build Maya's payoff moment — "I used it all up." When a product hits empty, Talbia's flow turns it into a gratifying, **private** finish: a ring-close/confetti celebration, a months-in-use chip, a quick repurchase verdict, and a permanent entry in the user's **private empties archive** on the Progress tab. No feed, no likes, no points, no badges — this is a personal shelf, not a social post. **PRD function owned:** F6 (finish a product — gratifying, private). **Matrix rows owned:** 11 (finish/celebration flow), 12 (repurchase review), and the **Progress-tab side** of rows 10/14 (My Progress summary hosting the archive).
>
> **Role note (D20, 7/21):** Talbia is a **front-end feature owner**. She does **not** own the backend, schema, RPCs, or data hooks — Shrey owns all of that. Talbia consumes Shrey's hooks (`useEmpties`, `useDashboard`, `useProducts`) and builds the screens on top of them.

---

## 0. STATUS — updated 2026-07-28 against `main` @ `bbf7605`

**You shipped PR #19 — Phases 1, 2, and most of 3 are done.** `npm run verify` is green. But there is one problem you need to fix before anything else, and it's serious.

> ### 🔴 Your finish flow is currently unreachable in a production build
>
> Matt's "Mark as Finished" button ships and works. It calls:
>
> ```ts
> router.push({ pathname: '/(tabs)/progress', params: { finishProductId: item.id } });
> ```
>
> Your `app/(tabs)/progress.tsx` **never reads `finishProductId`**. It only opens `FinishFlow` from its own `__DEV__` preview buttons. So today, tapping "Mark as Finished" navigates to your tab and **nothing happens** — and once `__DEV__` is false, `FinishFlow`, `CelebrationState`, `RepurchaseReview`, and the whole `finish_product` path become **dead code**. F6 does not work end to end in the app we'd demo.
>
> **This is a ~10-line fix in your file (Phase 3b below). Do it first.** Note the route is NOT the `/empties/finish?productId=` that §4 and §7-A of this plan proposed — that route was never created, Matt shipped the param-on-the-tab approach instead, and **that is now the agreed contract**. Read `finishProductId`; don't ask Matt to change his call.

| Phase                           | Status                     | What's on `main`                                                                                                                                                        |
| ------------------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1** Archive + Progress tab    | ✅ **Done**                | `EmptiesArchive`, `EmptyCard`, `ProgressSummary`, `EmptiesEmptyState`, `useEmptiesArchive`, `strings.ts`, tests. No likes / author / feed — D13 respected.              |
| **2** Finish flow               | ✅ **Built**, ❌ not wired | `FinishFlow`, `CelebrationState`, `RepurchaseReview`, `useFinishProduct`. Reachable only via `__DEV__` preview — see the box above.                                     |
| **3** States / a11y / analytics | 🟡 **Mostly done**         | ✅ `EmptiesLoadingState`, `EmptiesErrorState`, `useReducedMotion`, `product_finished` fires from the hook. ❌ **`.maestro/finish-and-archive.yaml` was never written.** |
| **3b** Wire the finish seam     | 🔴 **NEW — do first**      | See below.                                                                                                                                                              |
| **3c** Swap in Aaron's ring     | ⬜ Not started             | Your `ProgressRingStub` was the right call when Aaron's ring didn't exist. **It exists now.**                                                                           |
| **4** User testing              | ⬜ Not started             | —                                                                                                                                                                       |
| **5** Footer (rename + trim)    | 🟡 **Unblocked — do 2nd**  | Inbound request in §1. Merges **second** in the footer chain; **Aaron's step 1 landed 2026-07-27 (PR #29), so this is now what the chain is waiting on.**               |

**On the ring (Phase 3c):** `features/empties/components/ProgressRingStub.tsx` carries your own TODO saying to delete it when Aaron's lands. Aaron shipped `components/ProgressRing.tsx` in PR #22. The swap is **not drop-in** — his ring requires an `accessibilityLabel` prop and accepts `strokeWidth`; yours takes neither and animates the fill internally. So: pass `accessibilityLabel` at every call site, decide whether you still need the entry animation (if yes, keep it in a small local wrapper around his ring rather than a whole second ring), then delete `ProgressRingStub.tsx` and the adapter.

**Don't re-fire analytics.** `useFinishProduct` already calls `track('product_finished', …)` inside `lib/api`. Phase 3 below reads as though you must add it — you don't, and you correctly didn't.

---

## 1. Your lane

| ✅ OWN & edit                                                                          | 📥 Import but NEVER edit                                                                    | 🚫 Forbidden (other lanes / not in scope)                                                                                                                          |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `app/(tabs)/empties.tsx` (the tab screen — **renamed from `progress.tsx` in Phase 5**) | `components/ui/*` (Shrey — Card, Button, Chip, and any shared empty/error primitives)       | `app/(tabs)/inventory.tsx`, `features/inventory/*` (Matt — incl. the "Mark as Finished" button)                                                                    |
| `features/empties/*` (components, hooks, `strings.ts`, `__tests__/`)                   | `components/ProgressRing.tsx` (Aaron — you import it for the celebration + summary)         | `app/(tabs)/index.tsx`, `features/home/*` (Aaron)                                                                                                                  |
| `.maestro/finish-and-archive.yaml` (your flow)                                         | `lib/api/*` hooks — esp. `useEmpties`, `useDashboard`, `useProducts`, and `track()` (Shrey) | `app/(tabs)/wishlist.tsx`, `features/wishlist/*` (Joon)                                                                                                            |
|                                                                                        | `mocks/types.ts` + `mocks/*` fixtures (Shrey)                                               | `app/_layout.tsx`, `app/(tabs)/_layout.tsx`, `app/(auth)/*`, `app/(tabs)/you.tsx`, `lib/*`, `theme/*`, `mocks/*`, `components/ui/*`, `docs/*`, `scripts/*` (Shrey) |
|                                                                                        | `theme/*` NativeWind token config (Shrey)                                                   | `supabase/*`, `types/database.ts` (Shrey)                                                                                                                          |

**The #1 rule of this project is: never edit a file outside your lane.** If a task seems to need it, you stop and file a CROSS-LANE REQUEST (see §7). Merge conflicts are the enemy; staying in your lane is how five people ship in parallel.

> ### 📥 INBOUND CROSS-LANE REQUEST — from Shrey (2026-07-27), footer audit
>
> ```
> CROSS-LANE REQUEST — from Shrey (navigation/IA) to Talbia
> A footer audit against docs/PERSONAS.md + docs/PRD.md is changing the bottom nav
> to: Home | Inventory | ⊕ Log | Wishlist | Empties  (You moves off the tab bar).
>
> Two things I need from your lane, because I must not edit your files:
>   1. Rename app/(tabs)/progress.tsx -> app/(tabs)/empties.tsx and retitle the
>      screen "Your Empties". My Tabs.Screen will reference name="empties".
>   2. Remove the streak line and the in_rotation/unopened status badges from
>      ProgressSummary. PRD F4 and F8 both put the donut and the streak on Home,
>      home-dashboard.png already draws them there, and your summary currently
>      renders the same two facts a tab away. Aaron keeps them; you drop them.
>
> This is Phase 5 below, written out in full. Merge order matters — read it.
> Nothing else in your lane changes; the archive, finish flow, and celebration
> are all untouched.
> ```
>
> **Why (so you can defend it at the fair):** D13 deleted the Community sub-tab, so
> the only content on that tab that isn't duplicated on Home is the **private
> empties archive**. That archive is the direct answer to a pain point named in two
> personas — Maya: competitor apps "lose history when products finish"; Sam:
> decluttered items "vanish into the void." Calling the tab "Progress" hides your
> differentiator behind a word that already describes Home. The North Star metric
> is literally **empties/user/month** — the nav should say the word.

**Two seams you depend on but never edit:**

- **The finish entry point** lives on Matt's inventory item detail. His "Mark as Finished" button only **navigates** (expo-router) into _your_ finish screen. You own the destination; Matt owns the button. Neither of you edits the other's files — you just agree on the route name (§4, §7-A).
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
- **You build against mocks, not the database.** `useEmpties()`, `useDashboard()`, and `useProducts()` return fixture data until Shrey's `types/database.ts` lands. Your UI **never** imports supabase-js and **never** writes SQL. Finishing a product goes through the shared `useEmpties().finish(...)` — the hook does the write (it wraps the `finish_product` RPC); you build the _interaction and celebration_.
- **The finish entry point is a route, not a button you build.** Matt's inventory item detail has the "Mark as Finished" button; it calls `router.push(...)` to a route that renders _your_ finish screen. **Agree on the exact route name and params with Matt + Shrey before Phase 2** (§7-A). You never touch inventory files; you just own what the route opens.
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

| Column          | Type                           | Notes                                                     |
| --------------- | ------------------------------ | --------------------------------------------------------- |
| `id`            | uuid                           |                                                           |
| `user_id`       | uuid                           | owner (RLS keeps it private — never shown as an "author") |
| `product_id`    | uuid → products                | the product that was finished                             |
| `review_text`   | text \| null                   | optional 1-liner                                          |
| `repurchase`    | enum: `yes` \| `maybe` \| `no` | the verdict (matrix 12)                                   |
| `months_in_use` | int \| null                    | computed by the RPC from `opened_at`                      |
| `photo_url`     | text \| null                   | optional                                                  |
| `created_at`    | timestamptz                    | when it was finished                                      |

**The finish hook (Shrey's — you consume it). CORRECTED 7/27:** there is no `useEmpties().finish(...)` method. The real hooks are two separate top-level exports, which is what your shipped code already uses:

```ts
useEmpties(); // read query -> Empty[]
useFinishProduct(); // mutation { productId, reviewText?, repurchase, photoUrl? }
```

`useFinishProduct` already fires `track('product_finished', { repurchase }, productId)` internally — **do not fire it again.** Likewise `useDashboard()` returns **snake_case** fields: `{ profile, focus_products, status_counts, streak: { current_streak, longest_streak, last_log_date }, category_counts, ready_wishlist_items }`.

The mutation wraps the `finish_product` RPC, which: sets `products.status = 'finished'`, sets `is_priority = false` (removes it from the Focus Pot), creates the `empties` row, and computes `months_in_use` from `opened_at`. **No badge/points logic.** `useEmpties()` also gives you the list of the current user's empties for the archive (owner-only).

**`products.status` transition:** the finish flow moves a product from `in_rotation` (or `unopened`) → `finished`. You don't set this field yourself — `finish()` does it via the RPC.

**`useDashboard()` (Shrey's — you read the summary from it):** one round-trip returning focus products, status counts for the donut, streak (display only), category count, and wishlist-ready items. On the Progress tab you use the pieces relevant to "My Progress" (e.g. status counts / finished count, streak display). You import Aaron's `ProgressRing` to render any ring in the summary. **Streak fields are display-only — no rewards.**

**Analytics:** fire `track('product_finished', { ... })` via the shared `lib/api` `track()` helper when a finish completes. **Never log the raw `review_text`.**

---

## 6. Phases

### Phase 1 — Private empties archive + Progress tab shell (against mocks)

**Goal:** Build the Progress tab as "My Progress": a summary header (compose Aaron's `ProgressRing` + `useDashboard`) plus the **private empties archive** — a list of the user's finished products. Reuse the `empties-feed.png` **card layout only**, stripped of the like button, author, and any feed framing. Include a warm empty state for "no finishes yet." No finish flow yet, no writes — read mock data from `useEmpties` / `useDashboard`.

> **Paste this to your agent:**
>
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
>
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
- _(If the route needs a file, e.g. `app/empties/finish.tsx`, confirm ownership with Shrey in §7-A before creating it — it may live in your lane or be scaffolded by Shrey.)_

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
>
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

### Phase 3b — Wire the finish seam (NEW, 7/27) — 🔴 DO THIS FIRST

**Goal:** make the finish flow actually reachable. Right now it is dead code in a production build (§0).

**Context you need before pasting:** Matt's button already ships and already navigates. It pushes to your tab with a `finishProductId` route param. Your screen has to read that param and open `FinishFlow` for that product. You are **not** changing Matt's file, and he is **not** changing his call — this contract is settled.

> **Paste this to your agent:**
>
> ```
> Continue in the PanPals repo, my lane only (app/(tabs)/progress.tsx,
> features/empties/*). Re-read AI-CONTEXT.md first.
>
> BUG: my finish flow is unreachable in a production build. Matt's inventory item
> detail navigates with:
>   router.push({ pathname: '/(tabs)/progress', params: { finishProductId: item.id } })
> but app/(tabs)/progress.tsx never reads finishProductId — it only opens FinishFlow
> from its own __DEV__ preview buttons. So the button goes nowhere, and once __DEV__
> is false FinishFlow / CelebrationState / RepurchaseReview are dead code.
>
> Fix it in app/(tabs)/progress.tsx:
> 1. Read the param with useLocalSearchParams() from expo-router. Handle it being
>    a string, a string[], or undefined — expo-router can hand back an array.
> 2. When finishProductId is present, render <FinishFlow productId={...} /> instead
>    of the archive, in ALL builds — not behind __DEV__.
> 3. On complete or cancel, clear the param (router.setParams({ finishProductId:
>    undefined }) or an equivalent replace) so the tab returns to the archive and
>    doesn't re-open the flow when the user taps the tab again. Verify that
>    navigating away and back does not reopen it.
> 4. If the id doesn't match a product the user owns, FinishFlow already renders its
>    calm finishNotFound error state — confirm that path still works.
> 5. Leave the existing __DEV__ preview buttons alone; they're useful for testing.
>
> Add a test in features/empties/__tests__/ asserting that a finishProductId param
> renders FinishFlow for that product, and that no param renders the archive. Mock
> expo-router and the lib/api hooks — never hit Supabase in Jest.
>
> Only edit files under my lane. If anything else is needed output a CROSS-LANE
> REQUEST and stop. Run `npm run verify` and fix until green.
> ```

**Verify:** `npm run verify` green. Then `npx expo start`, sign in, go to **Inventory** → tap a product → **Mark as Finished** → you should land in _your_ celebration, not on a static archive. Complete the review, confirm the new empty appears in the archive, then tap the tab again and confirm the flow does **not** reopen.

**Done when:**

- [ ] Tapping Matt's "Mark as Finished" opens the celebration in a normal (non-`__DEV__`) run.
- [ ] Completing or cancelling clears the param and returns to the archive; re-tapping the tab doesn't reopen the flow.
- [ ] An unknown/foreign `finishProductId` shows the calm not-found state, not a crash.
- [ ] Test covers param-present and param-absent. `npm run verify` green; only my-lane files changed.

---

### Phase 3c — Swap in Aaron's ProgressRing, delete the stub (NEW, 7/27)

**Goal:** retire `ProgressRingStub`. Aaron's `components/ProgressRing.tsx` shipped in PR #22 and your own adapter says to do this.

> **Paste this to your agent:**
>
> ```
> Continue in the PanPals repo, my lane only. Aaron's shared ring now exists at
> components/ProgressRing.tsx (PR #22). Its props are:
>   percent: number; size?: number; strokeWidth?: number; label?: string;
>   accessibilityLabel: string  // REQUIRED
>
> Replace my local stub with it:
> 1. Update every call site in features/empties/* to import ProgressRing from
>    components/ProgressRing (import only — NEVER edit that file, it is Aaron's)
>    and pass a meaningful accessibilityLabel from features/empties/strings.ts.
> 2. My stub animates the fill on mount and respects reduce-motion; Aaron's does
>    not. If the celebration still needs that ring-close animation, keep it in a
>    SMALL local wrapper in features/empties/ that animates the `percent` value it
>    passes down to Aaron's ring — do not keep a second ring implementation, and
>    keep respecting useReducedMotion.
> 3. Delete features/empties/components/ProgressRingStub.tsx and
>    features/empties/components/ProgressRing.tsx (the adapter re-export).
> 4. Keep every existing test green.
>
> Only edit files under my lane. If Aaron's ring is missing something I need,
> output a CROSS-LANE REQUEST (§7-D) instead of editing his file. Run
> `npm run verify` and fix until green.
> ```

**Done when:**

- [ ] No file under `features/empties/` draws its own SVG ring.
- [ ] The celebration still animates (or degrades statically under reduce-motion).
- [ ] Both stub files deleted; `npm run verify` green; only my-lane files changed.

---

### Phase 3d — The missing Maestro flow

`.maestro/finish-and-archive.yaml` was specified in Phase 3 item 4 and never written. Do it **after 3b** — it can't pass until the seam works. Model it on `.maestro/log-product.yaml` and `.maestro/focus-and-ring.yaml`, which are both on `main` and show the house style for signing in as the seeded `maya@panpals.app` account. Assert: Inventory → tap a product → Mark as Finished → celebration shows → pick a verdict → save → land on the archive with the new empty and its verdict visible.

---

### Phase 4 — User-testing support (design fair)

**Goal:** Help the moderated sessions (5–8 MBA testers) hit the PRD metric: the finish moment is described as **"motivating," not "restrictive."** No new features — just fixes surfaced by testing.

> **Paste this to your agent:**
>
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

### Phase 5 — Footer realignment: the Progress tab becomes the **Empties** tab

**This phase is an inbound cross-lane request from Shrey (§1).** It is a rename plus
a subtraction — you are not building anything new. Roughly 30–60 minutes of agent time.

**Goal:** Your tab stops competing with Home. The screen becomes unambiguously "the
place my finished products live," and the two facts that Home already owns (the
status donut and the streak) stop being rendered twice in the app.

> **⚠️ Merge order — read this before you start. The chain is five steps, not three.**
> Shrey's navigation PR will point a tab at `name="empties"`, and your file is currently
> `progress.tsx`. If those two land out of order, `main` breaks for all five of you. The
> fix is a **one-line shim**, and it is part of the paste box below:
>
> 1. ✅ **Aaron went first** — the Home profile button, merged 2026-07-27 (PR #29). Done.
> 2. 🟡 **You go second — this is where the chain is stalled today.** Your PR creates
>    `app/(tabs)/empties.tsx` (the real screen) and leaves `app/(tabs)/progress.tsx`
>    behind as a single re-export line. Both routes resolve, so `main` keeps working with
>    the old nav.
> 3. ⬜ **Shrey merges his nav PR** pointing at `empties`.
> 4. ⬜ **Matt merges his Phase 5** — he repoints
>    `features/inventory/components/ItemDetailSheet.tsx` from `'/(tabs)/progress'` to
>    `'/(tabs)/empties'`. **This step is why the shim has to outlive step 3.**
> 5. ⬜ **You open a 2-line follow-up PR** deleting the `progress.tsx` shim. **Wait for
>    step 4, not step 3** — if you delete it after Shrey merges but before Matt repoints,
>    "Mark as Finished" navigates to a dead route and F6 breaks in a production build.
>    Ask Shrey to confirm Matt's PR is in.

> **Paste this to your agent:**
>
> ```
> Continue in the PanPals repo, my lane only. Re-read AI-CONTEXT.md, docs/PRD.md
> (functions F4, F6, F8) and docs/PERSONAS.md (Maya + Sam) first.
>
> This is a rename-and-subtract task from a navigation audit. Do NOT add features.
> The bottom nav is becoming: Home | Inventory | (+) Log | Wishlist | Empties.
> My tab is the last one and is being renamed from "Progress" to "Empties".
>
> (1) RENAME THE SCREEN, WITH A SHIM.
>   - Use `git mv app/(tabs)/progress.tsx app/(tabs)/empties.tsx` so history is kept.
>   - Then recreate app/(tabs)/progress.tsx containing exactly one line:
>       export { default } from './empties';
>     This shim exists ONLY so Shrey's navigation PR can merge independently of mine.
>     Add a one-line comment above it saying it is a temporary shim to be deleted
>     once Shrey's nav PR lands. Do not put any other logic in it.
>
> (2) RETITLE. The screen heading becomes "Your Empties" (not "My Progress").
>   Update the ScrollView accessibilityLabel to match. All copy stays in
>   features/empties/strings.ts — no inline strings in JSX.
>
> (3) SUBTRACT THE DUPLICATED STATS. Rename features/empties/ProgressSummary.tsx to
>   features/empties/EmptiesSummary.tsx and change what it renders:
>     REMOVE: the streak line. PRD F8 puts the streak on Home, display-only, and
>             Aaron already renders it there. Do not read dashboard.streak at all.
>     REMOVE: the "in rotation" and "unopened" count badges. PRD F4 puts the status
>             donut on Home and docs/mockups/home-dashboard.png already draws it as
>             "At a Glance". Those two numbers are Home's job, not mine.
>     KEEP:   the ring showing percent finished, and the finished count.
>     ADD:    a repurchase-verdict split — the count of Yes / Maybe / No across the
>             archive. Compute it client-side from the entries I already have out of
>             useEmptiesArchive(); do NOT ask for a new lib/api hook and do NOT call
>             supabase-js. Render each as a low-contrast pill with the WORD in it
>             (Yes / Maybe / No), never colour alone. This is the one stat that is
>             genuinely mine — Home cannot show it, because only the archive knows it.
>   Keep using Aaron's components/ProgressRing.tsx by import. Do not edit it.
>
> (4) UPDATE THE FINISH REDIRECT. Anywhere the finish flow routes back to /progress
>   on success, change it to /empties.
>
> (5) UPDATE .maestro/finish-and-archive.yaml for the new route/tab label ("Empties").
>
> (6) UPDATE TESTS under features/empties/__tests__/: rename ProgressSummary tests to
>   EmptiesSummary, assert the streak is NOT rendered, assert the in-rotation and
>   unopened badges are NOT rendered, and assert the Yes/Maybe/No verdict counts are.
>
> Everything else stays exactly as it is: the archive is still PRIVATE (no feed, no
> likes, no author), the celebration still has no points or badges, tone stays calm
> and second person, tokens only — never a hardcoded hex, font, or radius.
>
> Only edit files under my lane: app/(tabs)/empties.tsx, app/(tabs)/progress.tsx
> (shim only), features/empties/*, .maestro/finish-and-archive.yaml. Do NOT edit
> app/(tabs)/_layout.tsx — the tab bar is Shrey's. Do NOT edit components/ProgressRing.tsx
> — it is Aaron's. If anything else is needed, output a CROSS-LANE REQUEST and stop.
>
> Run `npm run verify` and fix until it passes with zero errors.
> ```

**Files created / changed:**

- `app/(tabs)/empties.tsx` (renamed from `progress.tsx`, `git mv`)
- `app/(tabs)/progress.tsx` (temporary one-line re-export shim — deleted in the follow-up PR)
- `features/empties/EmptiesSummary.tsx` (renamed from `ProgressSummary.tsx`; streak + status badges removed, verdict split added)
- Updates to `strings.ts`, `FinishFlow.tsx` (success redirect), `__tests__/`, `.maestro/finish-and-archive.yaml`

**Verify:**

```bash
npm run verify
npx expo start        # press w for web
```

Click through: the last tab now reads **Empties** and opens a screen headed "Your
Empties." The summary shows a ring, a finished count, and a Yes/Maybe/No split — and
**no streak, no "in rotation," no "unopened."** Open Home in the same session and
confirm the streak and the At-a-Glance donut still appear there exactly once. Finish a
product and confirm you land back on the Empties tab with the new card in place.

**Done when:**

- [ ] `npm run verify` passes with zero errors.
- [ ] `app/(tabs)/empties.tsx` exists (via `git mv`, history preserved) and `progress.tsx` is a one-line shim with a comment explaining it is temporary.
- [ ] Screen is headed "Your Empties"; the ScrollView accessibility label matches.
- [ ] The streak, the "in rotation" badge, and the "unopened" badge are **gone** from my tab — each of those facts now appears exactly once in the app, on Home.
- [ ] A Yes / Maybe / No repurchase-verdict split renders, computed client-side from the existing archive entries, with the word in each pill (never colour alone).
- [ ] The finish flow redirects to `/empties` on success.
- [ ] Archive is still private: no likes, no author, no feed, no points, no badges.
- [ ] `.maestro/finish-and-archive.yaml` updated and green.
- [ ] Only my-lane files changed (`git diff --name-only main`); `app/(tabs)/_layout.tsx` is **not** in the list.
- [ ] **After Shrey confirms his nav PR merged:** follow-up PR deletes the `progress.tsx` shim.

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

- **Rebuilding a social feed.** The `empties-feed.png` mockup is a **layout reference only** — the Community feed is **deferred (D13)**. Reuse the card _shape_ but strip the like button, author/avatar, "posted by," comments, and any "Community" sub-tab. Empties are a private personal shelf.
- **Editing inventory files.** The "Mark as Finished" button is **Matt's**. You own only the destination screen. If the agent tries to touch `app/(tabs)/inventory.tsx` or `features/inventory/*`, stop it and use §7-A. Coordinate the route name; never edit his file.
- **Making empties public / cross-user.** RLS on `empties` is **owner-only read and write**. Never frame an empty as belonging to someone else, never add a shared/global list. If a screen implies visibility to other users, it's wrong.
- **Adding points / badges / score to the celebration.** The finish moment is gratifying but **not gamified** — no points, no badges, no unlocks (D15). Ring-close + confetti + months-in-use chip is the whole reward.
- **Editing outside your lane.** The single biggest risk. If the agent touches `lib/api`, `components/ui`, `components/ProgressRing.tsx`, `theme`, `mocks`, or Matt's/Joon's/Aaron's files — stop it and file a CROSS-LANE REQUEST. Prove your PR is clean with `git diff --name-only main`.
- **Calling supabase-js or writing SQL.** You never do either. Finishing goes through `useEmpties().finish(...)`; the archive reads from `useEmpties()`; the summary reads from `useDashboard()`. Talbia never writes SQL.
- **Hardcoding a hex/font/radius.** Never. Everything comes from the NativeWind theme (`theme/`) fed by `docs/DESIGN-TOKENS.md`. Rose `#F2A2A2` and sage `#A8C69F` are _tokens_, not literals you type.
- **Verdict conveyed by color alone.** Always include the word Yes/Maybe/No. Never rely on a green/amber/rose pill by itself.
- **Inline strings in JSX.** All user-visible copy lives in `features/empties/strings.ts`.
- **Skipping states.** Loading, empty (no finishes), and error are required — not optional polish.
- **Shaming or alarming copy.** Tone is calm, celebratory, second person, never judgmental. The finish should feel like a small win, not a scolding.
- **Skipping `npm run verify`.** There is no CI. If you skip it you ship broken code to four teammates. Run it before every PR; keep PRs ≤~400 lines; squash-merge one module per PR.
- **Working on a stale branch.** Always `git checkout main && git pull && git checkout -b feat/talbia/<slug>` at the start of a session. After Shrey merges a schema PR, rebase on `main` and re-pull.
