# PanPals — MVP PRD

**Status:** Active spec. Supersedes the deep-research PDFs (D1) and, as of the
**2026-07-21 team sync**, is aligned to the **Maya Feature Matrix**. Where this
doc and any older mockup/decision disagree, the matrix wins (D12–D19).
**Design ground truth:** `docs/mockups/*.png` + `docs/DESIGN-TOKENS.md`.
**Deadline context:** class design fair, ~1 week out. The fair grades process,
not feature count — cut features before cutting user testing.

## Problem

Project Pan participants track consumption with notebooks, tape, spreadsheets,
and notes apps. Existing apps (Beautistics, Makeup Shelf, Project Pan Journey)
cap free tiers at 5–30 items, crash on scanning, hide wishlists from inventory,
and track without changing purchase behavior. Nobody connects the full chain:
**Log → prioritize → track → confront duplicates → finish → purchase intentionally.**

## Core loop

Log a product (catalog search or manual) → pin to Focus Pot (max 5) → update %
remaining via ring → impulse intercept on wishlist adds → finish → **private
empty archive + repurchase verdict.** (Community sharing is deferred — D13.)

## Functions, Attributes, Specifications

Per class rules: functions are verbs; "easy to use" is a banned phrase;
every attribute gets a number. Each function maps to a Maya Feature Matrix row.

| # | Function (verb) | Attribute | Specification | Matrix rows |
|---|-----------------|-----------|---------------|-------------|
| F1 | Log a product | Fast | ≤15s, ≤6 fields (photo, brand, name, category, format, status, PAO). Catalog type-ahead pre-fills brand/name/shade/category; manual entry always available — matches `log-modal.png` | 4, 5, 23 |
| F2 | Update usage / % remaining | Frictionless, honor-system | ≤3 taps from Home via Today's Focus ring; slider in 5% steps; each log is a separate row (history preserved) | 9 |
| F3 | Prioritize a Focus Pot | Small, non-judgmental | Up to 5 pinned products; **no cap on total inventory** | 8 |
| F4 | Visualize depletion | Glanceable | Ring per product (rounded caps, 8px+ stroke); dashboard donut of status counts; days-since-last-use label. No predictive finish date unless clearly labeled | 10 |
| F5 | Intercept an impulse | Gentle, data-driven | Wishlist add in a category with ≥3 active owned items → "Hold on" banner listing them; CTA = add to 14-day cooling-off. Soft alert only; Buy Now is deprioritized, never disabled. Warning language scales with match confidence (never call a category-only match a "duplicate") | 6, 7, 22 |
| F6 | Finish a product | Gratifying, private | "Log an Empty": ring-close/confetti moment, months-in-use chip, repurchase Yes/No, optional photo + 1-line review. Sets status=finished, moves to a **private** empties archive; **no points, no badges** | 11, 12 |
| F7 | Reconsider a wishlist item | Intentional | On day 14 the item flips to "ready"; detail shows days-on-list, priority, count of similar owned items; actions = Buy externally / Keep waiting / Remove. Buying converts the wishlist item into an inventory product (no re-entry) | 13, 17, 18, 19 |
| F8 | Sustain a streak | Motivating (display only) | Daily-log streak counter + weekly checkmark row on Home. **Display only — no badges, no rewards** (D15). Journey 1.9 keeps the streak visible; the reward economy is deferred | 9, 10 |
| F9 | Check stash in-store | Fast recall | Inventory search/filter by category and status (active/focus/finished) in <1s | 16 |

**Cross-cutting (Shrey-owned, apply everywhere):** account creation + goal capture
(matrix 1), primary navigation/IA (15), home dashboard shell (14), profile &
account controls incl. delete (20), empty/loading/offline/error states (21),
analytics event tracking (24), accessibility & privacy baseline (25).

The log modal keeps its "Tap to scan" zone as a **visual placeholder** that
opens the camera for a photo attach — Wizard-of-Oz, no identification logic.

## In-scope / Out-of-scope

| ✅ In-Scope | ❌ Out-of-Scope / Deferred |
|---|---|
| Email/password auth (Supabase) + goal capture | Social login, follower profiles |
| Catalog type-ahead search + pre-fill (Kaggle dataset) | AI shade scanning / barcode identification |
| Manual fast-log with photo attach | CSV import, weight tracking, per-pump ml estimation |
| Inventory list + category/status filters + edit | Budget tracking card |
| Focus Pot + rings + dashboard donut | AI photo-based progress estimation |
| Manual % slider updates (history preserved) | — |
| Wishlist + intercept + 14-day cooling-off + reconsideration | Affiliate links, checkout, points-to-cash, $5 rewards |
| Duplicate confrontation by category count + confidence-tiered language | Shade-similarity / computer-vision matching |
| Private empties archive + repurchase verdict | **Community feed, likes, comments, follows (deferred — D13)** |
| Streak **display** | **Badges, points, reward economy (deferred — D15)** |
| Wishlist→inventory purchase conversion | Order tracking, receipts, refunds |
| In-app reminders/nudges (opt-in) | **Push notifications (deferred — D19)** |
| Analytics events (product learning) | Ad/advertising profiling |
| Accessibility + privacy-by-default baseline | Formal certification, legal workflows |
| Beauty categories only | Pantry/grocery generalization |

## Personas served

Full detail in `docs/PERSONAS.md`. **Maya, the Low-Tech Migrator** is the P1
build target (the daily log→ring→finish loop). **Claire, the Dopamine-Chasing
Hauler** is served by the F5 intercept (matrix journey 1.8) and is our highest
**test** priority. **Sam, the Zero-Waste Eco-Purist** becomes a **design lens**
for this build — her finish moment ships as the private empties archive, but the
Community feed that completed her loop is deferred (D13). Deferred power users:
Project Pan Purist (weight tracking), Subscription Box Overloader (batch logging).

## Information architecture

Bottom tabs: **Home | Inventory | Progress | Wishlist | You**.
Progress tab = "My Progress" (rings, donut, streak) + a **private** empties
archive. No Community sub-tab (deferred — D13). No 6th tab.

## Success metrics (design fair)

| Metric | Target |
|---|---|
| Time to log a product (moderated, 5–8 MBA-cohort testers) | ≤15s median |
| Intercept effect | ≥1 tester says the banner would change a purchase decision; 0 testers say "judged" |
| Finish moment | Described as "motivating," not "restrictive" |
| Funnel (instrumented) | account → first log → focus pin → warning shown → warning decision → finish; % of Focus Pot panned |
