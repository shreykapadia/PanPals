# PanPals — Product & Engineering Blueprint

**Prepared for:** Shrey Kapadia (System Gatekeeper) and the PanPals team (Aaron, Joon, Matt, Talbia)
**Date:** July 14, 2026
**Sources parsed:** 3 meeting transcripts (July 1 lecture, July 1 team formation, July 8 working session), Blue Cyclone Chapters 2–5, both deep-research PDFs, the competitive analysis, the persona-iteration doc, both design-system files, and all 4 Stitch mockups.

---

## Executive Summary

You have roughly **two weeks** until the design fair (class kicked off projects July 1; the professor said "the next four weeks... and the design fair at the end"). The persona-iteration doc and the four mockups are your real spec — the earlier deep-research PDFs contain decisions your team already overturned. This blueprint locks the MVP to one loop (Log → Focus → Track → Intercept → Finish → Share), puts it on Expo/React Native + Supabase, and gives five AI-driven developers non-overlapping lanes with you as the single merge authority.

---

## ⚠️ Contradictions Found in Your Docs (Resolve Before Writing Code)

These are real conflicts between artifacts. Each one will cause two AIs to generate incompatible code if left ambiguous.

| #   | Contradiction                                                                                                                                                                                                                                                                                  | Where                                        | Resolution (recommended)                                                                                                                                                                  |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C1  | **Hard purchase locks & item caps vs. soft alerts.** The "Strategic Blueprint" PDF specifies a locked Buy button, One-In-One-Out gating, and a 15-item Focus Pot cap. The persona-iteration doc explicitly kills these ("That's a competitor"; no caps; "Are you sure?" alerts; honor system). | Deep-research PDFs vs. persona-iteration doc | **Persona-iteration doc + PNGs are the single source of truth.** Soft intercepts only. Archive the two research PDFs as background, not spec.                                             |
| C2  | **30-day Wishlist Sandbox vs. 14-day Cooling-Off.** Research says 30 days; the mockup CTA says "Add to 14-Day Cooling-Off Wishlist."                                                                                                                                                           | Deep Research Plan vs. `808447c6.png`        | **14 days**, user-adjustable later. Ship what the mockup shows.                                                                                                                           |
| C3  | **The Empties Feed lives under the "Progress" tab.** The feed mockup shows the _Progress_ tab active, but your nav is Home / Inventory / Progress / Wishlist / You — so where does personal progress vs. community content live?                                                               | `391cd8a9.png` vs. Stitch master prompt      | Merge them: **Progress tab = "My Progress" + "Community Empties" as two sub-tabs.** Do not add a 6th tab.                                                                                 |
| C4  | **User journeys assume AI shade/scan identification, but scanning is out of scope.** Journeys start with "onboards 120+ products via AI scanner"; Beautistics testing showed scan is exactly where competitors crash.                                                                          | Deep Research journeys vs. MVP reality       | Rewrite journey step 1 as **manual fast-log with photo attach (<15s)**. The `af1f08ec.png` log modal already supports this — it has a scan _placeholder_, which is fine for the demo.     |
| C5  | **Affiliate monetization vs. anti-overconsumption mission** — flagged by your own team ("teetering the line of actually motivating overconsumption"), and the cooling-off feature "conflicts with the idea of trying to make money."                                                           | July 8 transcript                            | **Cut all monetization from the class MVP.** No affiliate links, no $5 rewards, no points-to-cash. It's a business-model slide at the fair, not code. This dissolves the tension for now. |
| C6  | **Two different home dashboards.** The wide mockup (`98994c06`) includes Budget and Wishlist carousels; the phone revision (`6225c4ca`) removed them per the PM recommendation.                                                                                                                | Two PNGs                                     | Build the **phone revision**. Budget card is cut (it's a second product domain — personal finance — smuggled into a consumption tracker).                                                 |
| C7  | **Beauty-only vs. "works for laundry detergent too."** The pitch generalized; the July 8 meeting concluded broadening "would kill" the focus.                                                                                                                                                  | PPD 4 vs. July 8 transcript                  | Beauty-only. Category enum is extensible in the schema, invisible in the UI.                                                                                                              |
| C8  | **The class doesn't require a built product.** Chapter 5's cautionary tale is literally a student who built a whole app before testing; your AI-PM session recommended clickable prototypes first. You're building anyway — fine, but the fair grades _process_.                               | Ch. 5, transcripts                           | Build the MVP **and** keep the paper trail (DECISIONS.md, experiment logs) as fair exhibits. The repo itself becomes your process artifact.                                               |

---

# 1. Core MVP PRD & Feature Scoping

## 1.1 Problem Statement

Project Pan participants currently track consumption with notebooks, tape, spreadsheets, and notes apps. Existing apps (Beautistics, Makeup Shelf, Project Pan Journey) cap free tiers at 5–30 items, crash on scanning, hide wishlists from inventory, and track without changing purchase behavior. Nobody connects the full chain: **Log → prioritize → track → confront duplicates → finish → purchase intentionally.**

## 1.2 Applying Blue Cyclone Ch. 2 & 5

**Chapter 2 — "Functions are verbs. People buy verbs."** The PRD below is written as functions with measurable specs, not features. Per the professor's rule, "easy to use" and "reliable" are banned words; every attribute gets a number.

**Chapter 5 — Shrink the task.** "A prototype is a question you can touch. Build only what is needed to answer the next risk-reducing question." Your next risk-reducing question is: _does the log → ring → intercept → empty loop feel motivating rather than restrictive to 5–8 testers?_ Everything not needed to answer that question is out of scope. Cycles stay ≤3 days — the phase plan in Section 4 is built on 2–3 day increments.

## 1.3 Functions, Attributes, Specifications (the MVP spine)

| #   | Function (verb)                | Attribute                  | Specification                                                                                                                                                                                                              |
| --- | ------------------------------ | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1  | **Log a product**              | Fast                       | ≤15 seconds, ≤6 fields (photo, brand, name, category, format, status, PAO) — matches `af1f08ec.png`                                                                                                                        |
| F2  | **Update usage / % remaining** | Frictionless, honor-system | ≤3 taps from Home via Today's Focus ring; slider in 5% steps                                                                                                                                                               |
| F3  | **Prioritize a Focus Pot**     | Small, non-judgmental      | Up to 5 pinned products; no cap on total inventory (C1)                                                                                                                                                                    |
| F4  | **Visualize depletion**        | Glanceable                 | Progress ring per product, rounded caps, 8px stroke (per DESIGN.md); dashboard donut of status counts                                                                                                                      |
| F5  | **Intercept an impulse**       | Gentle, data-driven        | Adding a wishlist item in a category where user owns ≥3 active items triggers the "Hold on" banner showing those items; CTA = 14-day cooling-off (C2). Soft alert only — Buy Now is visually deprioritized, never disabled |
| F6  | **Celebrate a finish**         | Gratifying                 | "Log an Empty" flow: confetti/ring-close moment, months-in-use chip, repurchase Yes/No verdict, optional photo + 1-line review                                                                                             |
| F7  | **Share an empty**             | Communal                   | Post lands in the Community Empties feed with like button and badge chip; single global feed, reverse-chronological                                                                                                        |
| F8  | **Sustain a streak**           | Motivating                 | Daily-log streak counter with weekly checkmark row (per dashboard mockup); 3 launch badges: First Empty, 7-Day Streak, Pan Master (5 empties)                                                                              |
| F9  | **Check stash in-store**       | Fast recall                | Inventory searchable/filterable by category in <1s; answers "do I already own this?"                                                                                                                                       |

## 1.4 In-Scope vs. Out-of-Scope

| ✅ In-Scope (MVP, ~2 weeks)                            | ❌ Out-of-Scope (say it out loud at the fair)                                                            |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| Email/password auth (Supabase)                         | Social login, profiles with followers                                                                    |
| Manual fast-log with photo attach (F1)                 | **AI shade scanning / barcode identification** — highest-volatility feature; it's where Beautistics dies |
| Inventory list + category filters (F9)                 | CSV import, weight tracking, per-pump ml estimation                                                      |
| Focus Pot + progress rings + dashboard donut (F3, F4)  | Budget tracking card (C6)                                                                                |
| Manual % slider updates (F2)                           | AI photo-based progress estimation                                                                       |
| Wishlist + impulse intercept + 14-day cooling-off (F5) | **Affiliate links, live vendor checkout, points-to-cash, $5 rewards** (C5)                               |
| Duplicate confrontation by category count (F5)         | Shade-similarity matching (needs color AI)                                                               |
| Empties log + celebration + repurchase verdict (F6)    | Goodreads-style review ecosystem, comments, sample programs                                              |
| Community Empties feed with likes (F7)                 | Follows, DMs, moderation tooling, Mindful Toss/purge log                                                 |
| Streaks + 3 badges (F8)                                | Challenges ("No-Buy July"), tiered PanScore economy                                                      |
| In-app nudges only                                     | Push notifications (real device-token infra is a time sink)                                              |
| Beauty categories only (C7)                            | Groceries/pantry generalization                                                                          |

**Cut-line rationale:** every out-of-scope item either (a) depends on volatile tech (scanning, color AI), (b) reopens the mission/monetization conflict, or (c) adds a second user population (sellers, followers, moderators) you cannot test in two weeks. The Wizard-of-Oz rule applies: the log modal keeps its "Tap to scan" zone as a _visual placeholder_ that opens the camera for a photo attach — the demo looks complete without the volatile capability.

## 1.5 Personas Served (from your persona-iteration doc)

MVP serves the **Low-Tech Migrator** (5-second ring check-in), the **Dopamine-Chasing Hauler** (impulse intercept, Journey 1.1–1.3 minus the affiliate step), and the **Zero-Waste Eco-Purist** (Empties Feed, Journey 3.2). The **Project Pan Purist** (weight tracking) and **Subscription Box Overloader** (batch mini-logging) are explicitly deferred — their precision features are post-class.

## 1.6 Success Metrics (define before launch, per Founder's Playbook)

| Metric                                                         | Target for the fair                                                                             |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Time to log a product (moderated test, 5–8 MBA-cohort testers) | ≤15s median                                                                                     |
| Intercept effect                                               | ≥1 tester says the duplicate banner would change a purchase decision                            |
| Finish moment                                                  | Testers describe it as "motivating," not "restrictive" (exact words from your success criteria) |
| North Star (instrumented, even with fake users)                | Empties logged per active user; % of Focus Pot panned                                           |

---

# 2. Cross-Platform Technical Stack

## 2.1 Recommendation

| Layer        | Choice                                                                                                                                                                        | Runner-up (rejected)                                 |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Framework    | **React Native via Expo (SDK 53+), TypeScript, expo-router**                                                                                                                  | Flutter — rejected below                             |
| Styling      | **NativeWind (Tailwind for RN)** wired to your DESIGN.md tokens                                                                                                               | StyleSheet objects                                   |
| State        | **Zustand** (client state) + **TanStack Query** (server state)                                                                                                                | Redux — too much ceremony for AI codegen             |
| Backend      | **Supabase** (Postgres, Auth, Storage, RLS)                                                                                                                                   | Firebase — rejected below                            |
| Testing      | **Jest + React Native Testing Library** (unit/component), **Maestro** (e2e smoke flows), **tsc + ESLint + Prettier** (static gates)                                           | Detox — heavier setup                                |
| Distribution | **Expo Go** for dev _and_ the fair demo (QR code, $0); local Android APK (`npx expo run:android`, $0) as backup; EAS free tier (15 iOS + 15 Android builds/mo) only if needed | Bare RN — requires Xcode fluency nobody has time for |

**Cost profile (verified against expo.dev/pricing, Jul 2026):** every layer of this stack is $0 — Expo framework is MIT open source; only its optional EAS cloud service is metered, and its free tier exceeds our needs. Supabase free tier suffices (caveat: projects pause after ~1 week idle — wake before demos). Maestro CLI is free locally/in CI. The only real paywall in mobile dev is Apple's $99/yr Developer Program for TestFlight/App Store — framework-independent and unnecessary for this class: the MVP has no custom native modules, so it runs entirely in Expo Go.

## 2.2 Why this stack is optimized for five AI code generators

**TypeScript/React is the densest region of every model's training data.** Claude Code and Codex both produce materially better React/TS than Dart/Flutter — more idiomatic output, fewer hallucinated APIs, better self-repair when tests fail. With five independent AI configurations, you want the stack where the models make the _fewest_ mistakes, not the stack with the nicest widget system.

**Expo-router is file-based routing.** A screen is a file at a predictable path (`app/(tabs)/wishlist.tsx`). That gives each AI a deterministic answer to "where does this code go?" — the exact question that causes overlapping file generation. Directory structure _is_ the module boundary.

**TypeScript is the shared contract between five AIs.** `supabase gen types typescript` generates the database types from the live schema into one committed file. Every AI imports the same `Database` type; if the Codex dev changes the schema, everyone else's code fails typecheck loudly at PR time instead of silently at runtime. This is the single strongest defense you have against schema drift.

**Supabase over Firebase, specifically for vibe coding:**

1. **Schema as reviewable text.** Supabase migrations are plain SQL files in `supabase/migrations/`. You can read a schema change in a PR diff. Firestore's schema is implicit — it exists only as whatever shape five different AIs decided to write, which is precisely how a five-AI codebase corrupts.
2. **Postgres RLS policies are code-reviewed security.** Row Level Security lives in migration files (e.g., "users can only update their own products"), versioned in git, reviewed by you. Firestore rules are a separate proprietary language models handle worse.
3. **No custom backend server to co-author.** The Supabase JS client + RLS + a few Postgres functions (RPCs) replace an entire Express/API layer — one less codebase for five AIs to collide in.
4. **Frontend devs never need real backend during Week 1.** TanStack Query + a mock layer (Section 4) means UI modules build against fixtures while the schema stabilizes.

**Why not Flutter:** single-codebase benefit is identical, but Dart training density is lower, your design tokens are already Tailwind-shaped (DESIGN.md uses rem-based radii and CSS-style tokens), Stitch/Claude Design output is HTML/React-flavored, and none of your five devs gets a fallback ecosystem they know. Flutter is the better _hand-coded_ choice; RN is the better _AI-coded_ choice.

## 2.3 Data model (the contract Dev 2 owns)

```
profiles        id (=auth.uid), username, avatar_url, current_streak, last_log_date
products        id, user_id, brand, name, category (enum), format (full|mini|sample),
                status (unopened|in_rotation|finished), percent_remaining (0–100),
                photo_url, pao_months (6|12|null), opened_at, is_priority (bool, max 5
                enforced by trigger), created_at
usage_logs      id, product_id, percent_after, logged_at
wishlist_items  id, user_id, brand, name, category, price, photo_url,
                cooling_off_ends_at (now()+14d), status (cooling|ready|removed)
empties         id, user_id, product_id, review_text, repurchase (bool),
                months_in_use, photo_url, likes_count, created_at
empty_likes     empty_id, user_id (composite PK)
badges          user_id, badge (first_empty|streak_7|pan_master), earned_at
```

Three Postgres RPCs, no other custom endpoints: `log_usage(product_id, percent)` (writes usage_log, updates product, bumps streak), `finish_product(product_id, review…)` (transitions status, creates empty, awards badges), `get_dashboard()` (one round-trip for the Home screen's counts and donut).

## 2.4 Verification strategy for the stack (non-negotiable)

Every module ships with: (1) `tsc --noEmit` clean; (2) component tests for its screens' core logic (RTL); (3) one Maestro flow per feature (e.g., `log-product.yaml`: open modal → fill fields → save → assert item in inventory); (4) RLS verified by Dev 2 with a SQL test script that asserts user A cannot read/write user B's rows. CI (GitHub Actions, free tier) runs 1–3 on every PR; 4 runs on every migration PR.

---

# 3. GitHub Architecture & Branching Governance

## 3.1 The core rule

**Directory ownership is the merge-conflict firewall.** Branching strategy alone cannot stop five AIs from colliding — two agents editing `theme.ts` on different branches still collide at merge. So governance has two layers: _who may touch which paths_ (ownership matrix, Section 4.2) and _how code flows to main_ (below).

## 3.2 Branching model: trunk-based, short-lived feature branches

No `develop` branch, no GitFlow — that ceremony multiplies merge surfaces. One protected `main` that always builds.

| Branch  | Pattern                                                                   | Created by                    | Merges into   | Max lifespan |
| ------- | ------------------------------------------------------------------------- | ----------------------------- | ------------- | ------------ |
| `main`  | protected, always demoable                                                | —                             | —             | permanent    |
| Feature | `feat/<owner>/<module>-<slug>` e.g. `feat/joon/wishlist-intercept-banner` | Module owner                  | `main` via PR | **2 days**   |
| Schema  | `schema/<slug>` e.g. `schema/add-empties-table`                           | **Dev 2 (Talbia/Codex) only** | `main` via PR | 1 day        |
| Fix     | `fix/<owner>/<slug>`                                                      | anyone                        | `main` via PR | 1 day        |
| Docs    | `docs/<slug>`                                                             | anyone                        | `main` via PR | 1 day        |

**Why 2-day max lifespan:** merge conflicts grow with branch age, and Blue Cyclone Ch. 5 demands ≤3-day cycles anyway. A branch that can't merge in 2 days is a scope problem, not a git problem — shrink the task.

## 3.3 Protection & merge rules (configure these on day 1)

1. `main` protected: no direct pushes (including you), PRs required, **1 required review from @shrey** (CODEOWNERS makes this automatic), CI must be green, branch must be up-to-date with main before merge.
2. **Squash-merge only.** Five AIs generate noisy commit histories ("fix", "fix again", "actually fix"). Squash keeps main readable: one commit = one PR = one module change.
3. **CODEOWNERS file** maps every path to its owner + you. A PR touching a path outside the author's lane automatically requires an extra conversation.
4. **Merge order rule: schema PRs merge first, every day.** After any `schema/*` merge, Dev 2 regenerates `types/database.ts` in the same PR; all open feature branches rebase on main before their next push. This serializes the one dependency everyone shares.
5. **PR size cap: ~400 changed lines.** AI agents happily emit 2,000-line PRs; you cannot review those as a single gatekeeper. Big PR → split it.

## 3.4 The PR review pipeline (you as single source of truth)

Your review is a 4-gate pipeline, and gates 1–3 are automated so gate 4 stays fast:

| Gate         | What runs                                                                                                                                                                                                                                                                 | Tool           | Pass condition                             |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ------------------------------------------ |
| 1. Static    | `tsc --noEmit`, ESLint, Prettier                                                                                                                                                                                                                                          | GitHub Actions | zero errors                                |
| 2. Tests     | Jest/RTL suite + changed-module Maestro flow                                                                                                                                                                                                                              | GitHub Actions | green                                      |
| 3. AI review | You pull the branch; run **Claude Code** `/review` for logic/security and **Antigravity** for agentic cross-file verification: "verify this PR only touches paths owned by <author> per AI-CONTEXT.md; list any changes to shared contracts, theme, navigation, or types" | Your machine   | no ownership violations, no contract drift |
| 4. Human     | You read the diff (≤400 lines) against the PRD line item in the PR description                                                                                                                                                                                            | You            | matches spec, demoable                     |

**PR description template (enforced via `.github/pull_request_template.md`):**

```
## What
PRD function: F5 — Impulse intercept banner
## Screens/paths touched
app/(tabs)/wishlist.tsx, features/wishlist/*
## Contract changes
None / (describe + link AI-CONTEXT.md update)
## How I verified
- [ ] tsc + lint clean locally
- [ ] RTL tests added/updated
- [ ] Maestro flow `wishlist-intercept.yaml` passes
- [ ] Screenshot/screen-recording attached
## AI session notes
Tool used, notable prompts, anything the agent did I'm unsure about
```

That last field matters: it's your early-warning system for AI-generated code the author doesn't understand, and it doubles as design-fair process evidence.

## 3.5 AI session hygiene (rules every dev follows, verbatim in WORKFLOW.md)

1. **Start every AI session with:** `git checkout main && git pull && git checkout -b feat/<you>/<module>-<slug>`. Never resume an agent session on a stale branch.
2. One module, one branch, one PR. Never let an agent "also fix" something in another module — file an issue instead.
3. Commit every ~30 minutes of agent work. Small commits are your undo button when an agent goes sideways.
4. Agents never run `git push --force`, never merge, never touch `main`, never edit `supabase/migrations/` (except Dev 2), never edit shared contract files (Section 5) without a flagged PR.
5. If the agent wants to modify a file outside your lane, **stop** — that's a dependency; post it in the team channel for Shrey to route.

---

# 4. Component-Driven Modular Implementation Plan

## 4.1 The plain-language version

Think of the app as a house. Shrey pours the foundation and runs the plumbing (the app shell, login, colors, navigation). Talbia builds the water and power supply everyone shares (the database). Aaron, Joon, and Matt each decorate one room — and only their room. Nobody touches a load-bearing wall (shared files) without Shrey signing off. Because every room connects to the plumbing the same standard way (typed data contracts and mock data), the rooms can be built at the same time without anyone waiting on anyone else — and when the real plumbing switches on in Week 2, each room just plugs in.

## 4.2 Ownership matrix

| Dev                | Tooling                   | Module (their lane)                                                                                                                           | Owns these paths                                                                                    | Why this assignment                                                                                                                                                          |
| ------------------ | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Shrey (Dev 1)**  | Antigravity + Claude Code | **Platform & integration**: repo scaffold, expo-router tab shell, auth screens, theme/NativeWind token setup, mock-data layer, CI, all merges | `app/_layout.tsx`, `app/(auth)/*`, `lib/*`, `theme/*`, `mocks/*`, `.github/*`, all `*.md` contracts | Gatekeeper must own everything shared, so nobody else ever needs to touch it                                                                                                 |
| **Talbia (Dev 2)** | Codex / ChatGPT Plus      | **Data platform**: schema, migrations, RLS policies, the 3 RPCs, seed data (incl. fake feed users like @claire_pans), generated types         | `supabase/*`, `types/database.ts`                                                                   | Codex works well in the SQL/schema lane; it's a text-file domain with zero UI merge surface. Talbia is also the domain expert — she knows what fields a blush actually needs |
| **Aaron (Dev 3)**  | Claude Code               | **Home & Progress rings**: Today's Focus carousel, depletion rings, dashboard donut, streak card, log-usage slider (F2, F3, F4, F8)           | `app/(tabs)/index.tsx`, `features/home/*`, `components/ProgressRing.tsx`                            | The fitness-ring concept was his idea; highest-polish visual module for the fair demo                                                                                        |
| **Joon (Dev 4)**   | Claude Code               | **Wishlist & Impulse Intercept**: wishlist list, add-item flow, "Hold on" banner, similar-items grid, 14-day countdown (F5)                   | `app/(tabs)/wishlist.tsx`, `features/wishlist/*`                                                    | Highest-risk feature per your own persona doc — needs a dedicated owner; Joon argued the judgment-free position, so he'll calibrate the tone right                           |
| **Matt (Dev 5)**   | Claude Code               | **Inventory & Empties**: fast-log modal (F1), inventory list/filters (F9), finish celebration + empties feed with likes (F6, F7)              | `app/(tabs)/inventory.tsx`, `app/(tabs)/progress.tsx`, `features/inventory/*`, `features/empties/*` | Feed lands in Phase 2–3, which absorbs his London week without blocking anyone                                                                                               |

Two lanes are deliberately heavier (Matt's) and lighter (Aaron's, but demo-critical polish expands to fill it). Rebalance at the Phase 2 checkpoint if needed.

## 4.3 The mock-first pattern (what makes parallel work possible)

Shrey ships `mocks/` in Phase 0: fixture data matching `types/database.ts` exactly (the 3 Focus products from the mockups, the 128-item stash counts, @claire_pans's feed post). Every feature module builds against a `useProducts()` / `useWishlist()` / `useEmpties()` hook whose implementation Shrey swaps from fixtures to Supabase in Phase 2. **UI devs never write a Supabase query.** That's the decoupling: frontend blocks are fully isolated; the backend is one unified surface behind hooks.

## 4.4 Phase plan (2–3 day cycles, per Blue Cyclone Ch. 5)

| Phase                             | Days        | Deliverable                                                                                                                                                                 | Owner(s)                                                       | Verification gate                                                                                      |
| --------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **0 — Foundation**                | Jul 15–16   | Repo + CI + tab shell + theme tokens + mock layer + all `.md` contracts committed; `main` runs in Expo Go on everyone's phone                                               | Shrey (Talbia drafts schema in parallel)                       | Each dev clones, runs, and posts a screenshot from their own device                                    |
| **1 — Isolated modules on mocks** | Jul 17–21   | Home/rings, Wishlist/intercept, Inventory/fast-log — all fully interactive against fixtures. Schema + RLS + RPCs merged; `types/database.ts` generated                      | Aaron, Joon, Matt, Talbia                                      | Per-module RTL tests + Maestro flow green; mid-phase demo Sun Jul 19                                   |
| **2 — Wire-up**                   | Jul 22–24   | Shrey swaps hooks to Supabase module-by-module (Home → Inventory → Wishlist); auth gates everything; empties feed starts                                                    | Shrey + Talbia; UI devs fix integration fallout in their lanes | Full loop works with real data: log → ring updates → finish → empty appears in feed                    |
| **3 — Loop close & polish**       | Jul 25–27   | Streaks/badges, finish celebration, feed likes, empty states, DESIGN.md polish pass                                                                                         | Aaron (celebration), Matt (feed), Joon (countdown states)      | Maestro end-to-end: create account → log product → prioritize → update → intercept → finish → see post |
| **4 — Test & fair prep**          | Jul 28–fair | Moderated tests with 5–8 MBA-cohort users (per your screener plan); bug triage = only crashes and loop-breakers; EAS demo build; process exhibits printed from DECISIONS.md | Everyone                                                       | Success metrics from §1.6 measured and written up                                                      |

**Timeline honesty:** if the fair is Jul 29, Phase 3 and 4 compress — cut badges before you cut user testing. The professor grades learning, not feature count.

---

# 5. Team Alignment Markdown Architecture

## 5.1 Assessment of current docs

| Current artifact                         | Verdict                                                                                                                                                                                                                                                                            |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DESIGN.md` (tokens + component specs)   | **Keep — it's excellent.** Machine-readable YAML frontmatter with exact hex/typography/radius values. Becomes `docs/DESIGN-TOKENS.md` nearly as-is                                                                                                                                 |
| `panpal_design.md`                       | **Delete.** ~90% subset of DESIGN.md with drifted values (`#a8c69f` vs `#A8C3A0` for sage; `#f8d7da` as warning vs. DESIGN.md's Soft Amber `#F2C299`). Two token files = two AIs generating two different greens. Merge the nav/component notes into DESIGN-TOKENS.md, then remove |
| Deep-research PDFs, competitive analysis | Background, not spec. Superseded on locks/caps/durations (C1, C2). Do **not** commit to repo — an AI that reads "15-item cap" will build it                                                                                                                                        |
| Persona-iteration doc + 4 PNGs           | **Current source of truth.** Distill decisions into PRD.md; commit PNGs to `docs/mockups/` — AIs with vision use them as layout ground truth                                                                                                                                       |
| Meeting transcripts                      | Process evidence for the fair; keep out of repo (noisy, garbled, would pollute AI context)                                                                                                                                                                                         |

## 5.2 Repo documentation taxonomy

```
/
├── AI-CONTEXT.md            ← master context file, read by every AI, every session
├── CLAUDE.md                ← 3 lines: "Read AI-CONTEXT.md first. Obey ownership matrix. Never edit paths you don't own."
├── AGENTS.md                ← identical 3 lines (Codex reads this filename, Claude Code reads CLAUDE.md)
├── docs/
│   ├── PRD.md               ← Section 1 of this blueprint: functions table, in/out-of-scope, metrics
│   ├── DATA-MODEL.md        ← schema + RPC signatures (Talbia keeps in sync with migrations)
│   ├── DESIGN-TOKENS.md     ← current DESIGN.md, single source for all styling
│   ├── WORKFLOW.md          ← Section 3: branching, PR template, AI session hygiene
│   ├── DECISIONS.md         ← append-only log: "2026-07-14: 14-day cooling-off, not 30 (C2). Soft alerts, no locks (C1)…"
│   ├── TESTING.md           ← how to run tsc/jest/maestro; per-module test expectations
│   └── mockups/             ← the 4 PNGs, renamed: home-dashboard.png, wishlist-intercept.png, empties-feed.png, log-modal.png
```

Rules: `AI-CONTEXT.md` and everything in `docs/` is owned by Shrey (CODEOWNERS-enforced). DECISIONS.md is append-only — it is simultaneously your drift-prevention tool and your design-fair process exhibit.

## 5.3 AI-CONTEXT.md — exact template (commit this verbatim, then maintain)

```markdown
# AI-CONTEXT.md — PanPals

> You are working in a 5-person codebase where every developer uses an AI coding
> agent. This file is the shared contract. Read it fully before generating code.
> If a task requires violating anything here, STOP and tell your human.

## 1. What we are building

PanPals: a mobile app that helps people finish the cosmetics they own before
buying more. Core loop: Log product → prioritize (Focus Pot, max 5) → track
depletion (progress rings) → intercept impulse buys (soft alerts + 14-day
cooling-off wishlist) → celebrate finishing ("empties") → share to community feed.
Full spec: docs/PRD.md. NOT building: scanning/AI identification, payments,
affiliate links, push notifications, budgets, hard purchase locks, item caps.

## 2. Stack (do not introduce alternatives)

- Expo SDK 53 / React Native / TypeScript strict / expo-router (file-based tabs)
- Styling: NativeWind ONLY, using tokens from docs/DESIGN-TOKENS.md.
  Never hardcode a hex value, font, or radius. Never import styled-components.
- State: Zustand for client state, TanStack Query for server state.
  No Redux, no Context for data.
- Backend: Supabase (Postgres + RLS). UI code NEVER calls supabase-js directly;
  use the hooks in lib/api/ (useProducts, useWishlist, useEmpties, useDashboard).
- Tests: Jest + React Native Testing Library; Maestro flows in .maestro/.

## 3. File ownership — DO NOT cross lanes

| Path                                                                                        | Owner       |
| ------------------------------------------------------------------------------------------- | ----------- |
| app/_layout.tsx, app/(auth)/_, lib/_, theme/_, mocks/_, docs/_, .github/_                   | Shrey ONLY  |
| supabase/*, types/database.ts                                                               | Talbia ONLY |
| app/(tabs)/index.tsx, features/home/*, components/ProgressRing.tsx                          | Aaron       |
| app/(tabs)/wishlist.tsx, features/wishlist/*                                                | Joon        |
| app/(tabs)/inventory.tsx, app/(tabs)/progress.tsx, features/inventory/_, features/empties/_ | Matt        |
| If your task needs a change outside your owner's lane: do not make it.                      |
| Output a note titled "CROSS-LANE REQUEST" describing the needed change.                     |

## 4. Data contract (summary — full version in docs/DATA-MODEL.md)

Types come from types/database.ts (generated; never hand-edit).
Key entities: profiles, products (status: unopened|in_rotation|finished;
percent_remaining 0–100; is_priority max 5 per user), usage_logs,
wishlist_items (cooling_off_ends_at = created +14 days), empties, empty_likes,
badges. RPCs: log_usage(), finish_product(), get_dashboard().

## 5. Conventions

- Components: PascalCase function components, one per file, named export.
- Hooks: use[Thing].ts in the feature folder; screens stay thin, logic in hooks.
- All user-visible strings in features/<module>/strings.ts (no inline literals).
- Every screen handles: loading, empty, error states. No unhandled promises.
- Accessibility: every touchable gets accessibilityLabel.
- Copy tone: calm, non-judgmental, second person. Never shame the user
  ("You already have 4 similar blushes" ✅ / "Stop overspending!" ❌).

## 6. Design language (details: docs/DESIGN-TOKENS.md)

Soft minimalism. Surface #fff8f4, primary "PanPal Rose" #f2a2a2, sage #A8C3A0
for eco/success, soft amber #F2C299 for gentle warnings. Serif (Libre Caslon
Text) for headlines, Manrope for body. Pill buttons, 24px+ card radius,
progress rings with rounded caps, soft diffused shadows — never hard borders.

## 7. Definition of Done for any task

1. tsc --noEmit passes 2. eslint passes 3. RTL test covers the new logic
2. Relevant Maestro flow passes 5. Loading/empty/error states exist
3. Only files in your lane changed 7. PR description filled per template
```

## 5.4 Why this works across Claude Code, Antigravity, and Codex

Each tool auto-loads a different convention file (CLAUDE.md vs AGENTS.md) — both are 3-line pointers to the same AI-CONTEXT.md, so there is exactly one contract with zero duplication drift. The ownership matrix converts "please don't conflict" into an instruction models actually follow ("do not edit paths outside your lane" + the CROSS-LANE REQUEST escape hatch). The Definition of Done means every agent self-verifies before your gates even run.

---

# Risk Register

| #   | Risk                                                                               | Likelihood | Impact | Mitigation                                                                                                                                                                                                               |
| --- | ---------------------------------------------------------------------------------- | ---------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| R1  | Schema churn breaks all three UI modules mid-Phase 1                               | High       | High   | Schema freeze after Phase 1 day 2; changes after that require a DECISIONS.md entry + Shrey approval; generated types make breakage loud at CI, not runtime                                                               |
| R2  | An AI agent edits shared files despite instructions                                | Medium     | High   | CODEOWNERS blocks the merge automatically; Antigravity ownership check in Gate 3; small commits make rollback cheap                                                                                                      |
| R3  | Shrey becomes the review bottleneck                                                | High       | Medium | Gates 1–2 automated; 400-line PR cap; twice-daily merge windows (12pm/9pm) so devs plan around them instead of waiting                                                                                                   |
| R4  | Fable 5 access ended Jul 12; Claude Pro rate limits under 4 concurrent heavy users | Medium     | Medium | Stagger heavy agent sessions; Talbia's Codex lane is independent; keep prompts scoped to one module (smaller context = fewer tokens)                                                                                     |
| R5  | Matt's London week compresses his lane                                             | High       | Medium | His module is Phase 2–3 weighted; fast-log modal (his only Phase 1 item) can be pair-built with Shrey if needed                                                                                                          |
| R6  | Intercept feature reads as judgmental in user tests (June's warning)               | Medium     | High   | Copy rules in AI-CONTEXT.md §5; test exact banner wording with the 5–8 cohort testers; soft alert only, never a lock                                                                                                     |
| R7  | Team burns time on scanning "just to try it"                                       | Medium     | High   | It's in the out-of-scope table, the PRD, and AI-CONTEXT.md §1. Scope creep dies in documentation                                                                                                                         |
| R8  | Demo-day live backend failure                                                      | Low        | High   | Demo via Expo Go QR + seeded demo account; wake the Supabase project (free tier pauses when idle) the morning of the fair; pre-build local Android APK 2 days early as backup; feed pre-seeded with @claire_pans content |

# Action Items

| Owner                     | Action                                                                                                 | Due           |
| ------------------------- | ------------------------------------------------------------------------------------------------------ | ------------- |
| Shrey                     | Create repo; commit AI-CONTEXT.md, CLAUDE.md, AGENTS.md, docs/ tree, CODEOWNERS, branch protection, CI | **Jul 15**    |
| Shrey                     | Scaffold Expo app: tab shell, theme tokens from DESIGN-TOKENS.md, mock layer                           | Jul 16        |
| Talbia                    | Draft schema migration + RLS + seed data as `schema/initial-schema` PR                                 | Jul 16        |
| Aaron / Joon / Matt       | Read AI-CONTEXT.md + WORKFLOW.md; run the app in Expo Go; post confirmation screenshot                 | Jul 16        |
| Team                      | Resolve contradictions C1–C8 (15-min sync or async thread); Shrey logs outcomes in DECISIONS.md        | Jul 16        |
| Aaron, Joon, Matt, Talbia | Phase 1 modules per §4.4                                                                               | Jul 21        |
| Talbia                    | Recruit 5–8 MBA-cohort testers via screener (from your persona doc plan)                               | Jul 22        |
| Shrey                     | Phase 2 wire-up complete; full loop demo recorded                                                      | Jul 24        |
| Team                      | Moderated user tests; measure §1.6 metrics; write up for fair                                          | Jul 28 → fair |
