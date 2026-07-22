# DECISIONS.md — append-only log

Every entry: date, decision, why, what it supersedes. This file is both our
drift-prevention tool and our design-fair process exhibit. Never delete entries;
reverse a decision with a new entry.

---

**D1 — 2026-07-14 — Persona-iteration doc + 4 mockups are the source of truth.**
The deep-research PDFs specify hard purchase locks, One-In-One-Out gating, and
a 15-item Focus Pot cap that the team explicitly rejected in the persona
iteration session. Research PDFs are background reading and stay OUT of the repo.

**D2 — 2026-07-14 — Soft alerts, no hard locks, no inventory caps.**
"Are you sure?" intercepts only; Buy Now is deprioritized, never disabled.
Honor-system % tracking. Rationale: judgment-free positioning (June's point);
caps are what competitors' paywalls do.

**D3 — 2026-07-14 — Cooling-off period = 14 days** (not the research doc's
30-day sandbox). Ship what the wishlist-intercept mockup shows.

**D4 — 2026-07-14 — Empties feed lives inside the Progress tab** as a
"Community Empties" sub-tab. Nav stays 5 tabs: Home | Inventory | Progress |
Wishlist | You.

**D5 — 2026-07-14 — No scanning/AI identification in MVP.** Log modal keeps
the "Tap to scan" zone as a camera photo-attach placeholder (Wizard-of-Oz).

**D6 — 2026-07-14 — All monetization cut from class MVP.** No affiliate links,
points-to-cash, or $5 rewards. Resolves the mission-vs-revenue contradiction
the team flagged on Jul 8; business model becomes a fair slide, not code.

**D7 — 2026-07-14 — Phone dashboard revision is canonical** (no Budget card,
no wishlist carousel on Home). Beauty categories only in UI (D of PPD pitch
generalization deferred).

**D8 — 2026-07-14 — Stack: Expo/React Native + TypeScript + NativeWind +
Zustand + TanStack Query + Supabase.** All layers $0 (verified expo.dev/pricing
Jul 2026). Demo via Expo Go; no EAS dependency; no Apple Developer account for
the class.

**D9 — 2026-07-14 — No GitHub Actions / CI for the prototype** (Shrey).
Replaced by mandatory local `npm run verify` (author) + Shrey re-running
verify + Maestro at review (Gate 2), per WORKFLOW.md. Revisit if the project
continues after the class.

**D10 — 2026-07-14 — Supabase provisioning deferred** (Shrey). Phase 1 builds
against `mocks/` fixtures typed by `mocks/types.ts` mirroring DATA-MODEL.md.
Talbia's schema work starts when Shrey provisions the project.

**D11 — 2026-07-14 — Design tokens consolidated.** `DESIGN-TOKENS.md` is the
single styling source. `panpal_design.md` retired (drifted values: sage
#a8c69f vs #A8C3A0; warning #f8d7da vs #F2C299). Resolution: sage = #A8C3A0
(container #a4bf9c per token set), warning amber = #F2C299, #f8d7da reserved
for unfilled ring track. PanPal Rose #f2a2a2 = brand accent for CTAs/rings,
per mockups.

---

**D12 — 2026-07-21 — Prior decisions confirmed at the team sync.** D1–D3, D5,
D7, D8, D9, and D11 were reviewed and stand. The PENDING Jul-16 confirmation
line is hereby resolved. D4, D6, and D10 are amended by the entries below.

**D13 — 2026-07-21 — Community Empties feed, likes, and comments deferred to
post-class.** Amends D4. The Maya Feature Matrix marks Community as excluded/
deferred. Finishing a product now writes a **private** empties archive entry
(owner-only RLS) with a repurchase verdict. The Progress tab keeps "My Progress"
only — no "Community Empties" sub-tab. Sam persona becomes a design lens (her
finish moment ships; her feed does not). Reversal path: re-enable `empty_likes`,
public read RLS on `empties`, and the feed screen — all scoped out cleanly in
DATA-MODEL.md "DEFERRED" so this is a small future add. Why: 5-person, ~1-week
build; the feed is the largest surface with the least Maya-loop value.

**D14 — 2026-07-21 — Supabase is provisioned now.** Reverses D10's "defer."
Shrey provisions the project in Phase 0; Talbia's schema/RLS/types work is the
Phase 1 critical path. The mock-first pattern still holds as the bridge until
`types/database.ts` is generated, so feature owners are never blocked. Why: the
team chose a single shared database as the primary merge-conflict defense
(everyone reads/writes one contract instead of inventing local storage).

**D15 — 2026-07-21 — No points, no badges, no reward economy.** Extends D6.
Matrix rows 10/11 specify celebration "without points or monetary rewards" and
defer "formal streak rewards." Kept: a **display-only** streak counter, because
Maya's journey 1.9 explicitly shows a maintained usage streak. Cut: `badges`
table and any unlock/reward tied to streaks or finishes.

**D16 — 2026-07-21 — The Maya Feature Matrix is the authoritative MVP scope.**
Built during the sync from Persona 1 + the journey set (1.1, 1.4, 1.5, 1.8, 1.9,
1.10, 1.11). Where the older PRD, mockups, or blueprint disagree, the matrix
wins. PRD.md and AI-CONTEXT.md were realigned to it.

**D17 — 2026-07-21 — Product catalog source = Kaggle MIT-licensed cosmetics
dataset.** Seeds a read-only `catalog_products` table (brand/name/category/
shade). Powers type-ahead search + field pre-fill for inventory and wishlist,
and the category-based duplicate intercept. Manual entry is always available
when there is no match. Retailer scraping (e.g. SkinSort) is prohibited by ToS
and out of scope. Only use datasets whose stated license permits our use.

**D18 — 2026-07-21 — Persona build scope.** Maya (Low-Tech Migrator) = P1 build
target. Claire's impulse intercept is in-scope (journey 1.8) and is the highest
**test** priority. Sam = design lens (see D13). Priya remains a design lens; the
two power users stay deferred.

**D19 — 2026-07-21 — Reminders are in-app / opt-in only; push notifications
deferred.** Matrix row 19 allows local reminders; the team keeps engagement
in-app (a "ready to reconsider" nudge inside the app) to avoid platform
notification setup for the class build.

**D20 — 2026-07-21 — Shrey owns the entire backend; all four teammates build
front-end only.** Amends the D14/blueprint split that gave Talbia the data
platform. Shrey now solely owns `supabase/*`, `types/database.ts`, all
migrations/RLS/RPCs/seed, plus the platform foundation, auth/onboarding, shared
UI kit, and the `lib/api` hooks. Rationale: one person owning the backend end to
end removes the schema-handoff coordination cost and gives the feature owners a
single, stable contract to build against. Re-assignment of the four front-end
lanes: **Aaron** = Home / Focus Pot / rings (unchanged); **Joon** = Wishlist /
intercept (unchanged); **Matt** = Inventory entry + browse/filter/edit + usage
logging (narrowed — no longer owns empties or the Progress tab); **Talbia** =
finish/celebration flow + repurchase review + **private** empties archive +
Progress tab (`features/empties/*`, `app/(tabs)/progress.tsx`). The "Mark as
Finished" button sits in Matt's inventory detail and only *navigates* to Talbia's
finish flow — no shared file edits.

**D21 — 2026-07-21 — Design source of truth = PanPal Aesthetic Design System
v2.0.0** (the uploaded `PanPalDESIGN.md`). Reverses the parts of D11 that had
changed values: **font body/labels = Inter** (was Manrope); **sage/success =
`#A8C69F`** (was `#A8C3A0`/`#a4bf9c`); **warning/intercept = `#F8D7DA`** soft
amber-peach (was `#F2C299`); **progress-ring track = `#E0D9D4`** (was `#f8d7da`
at 50%). Brand rose `#F2A2A2`, surface `#FFF8F4`, primary text `#333333`, and
Libre Caslon Text headlines are unchanged. `docs/DESIGN-TOKENS.md` now carries
this system in full and stays the single styling source (one design file, to
avoid the drift D11 warned about). **Navigation:** we kept the current five tabs
**Home | Inventory | Progress | Wishlist | You** rather than the design system's
original **Quick Log (+) / Profile** layout, so the Progress tab (Talbia's lane,
home of the private empties archive) and all ownership stay intact; the center
"Quick Log (+)" becomes a Home quick-action pill instead.

**D22 — 2026-07-21 — Body/label font = Satoshi** (not Inter). Amends the font
line in D21. Inter/Roboto/system read as the un-chosen boilerplate default;
Satoshi (Fontshare, ITF Free License) is a clean neutral grotesque that pairs
with Libre Caslon Text for a deliberate, editorial look. Headlines stay Libre
Caslon Text. Loading: Caslon via `@expo-google-fonts/libre-caslon-text`; Satoshi
is downloaded from fontshare.com/fonts/satoshi, committed to `assets/fonts/`, and
registered with `expo-font` (see SHREY-PLAN.md Phase 0).
