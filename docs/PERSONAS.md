# PERSONAS.md — Canonical User Personas & Journeys

**Status:** Consolidates and supersedes both prior sets — the deep-research
plan's 4 personas (Dopamine Collector, Practical Panner, Mindful Minimalist,
Neurodivergent Curator) and the persona-iteration doc's 5 archetypes
(Dopamine-Chasing Hauler, Low-Tech Migrator, Zero-Waste Eco-Purist,
Subscription Box Overloader, Project Pan Purist). See "Why we consolidated"
at the end.

> **7/21 scope update (D13, D16, D18):** the go-forward build follows the Maya
> Feature Matrix. **Maya is the P1 build target.** Claire's impulse intercept is
> in scope (highest test priority). **Sam is now a design lens, not a build
> target** — her finish moment ships as a _private_ empties archive, but the
> Community Empties feed, likes, and badges that completed her loop are
> **deferred**. Read Sam's section for the emotional "why" behind the finish
> moment; ignore its feed/likes/badge mechanics for this build.

---

## MVP priority order

| Priority                          | Persona                                         | Why this rank                                                                                                                                                       | Owning module                         |
| --------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| **P1 — build & retain**           | Maya, the Low-Tech Migrator                     | Only persona validated by primary evidence (subreddit screenshots of paper/spreadsheet/notes-app trackers). Powers the daily retention loop. Lowest build risk      | Home & rings (Aaron), fast-log (Matt) |
| **P2 — test hardest**             | Claire, the Dopamine-Chasing Hauler             | The impulse intercept is our differentiator AND our riskiest assumption — the feature most likely to cause churn if the tone is wrong. Test it, don't just build it | Wishlist & intercept (Joon)           |
| **P3 — delight**                  | Sam, the Zero-Waste Eco-Purist                  | The finish/share moment is the emotional payoff of the whole loop, but it depends on P1's tracking existing first                                                   | Empties & feed (Matt)                 |
| **Design lens, not build target** | Priya, the Visual Curator                       | Her needs (visual-first, minimal taps, gentle alerts) are design principles we apply everywhere now; her dedicated features (color grids, widgets) are post-class   |
| **Deferred**                      | Subscription Box Overloader, Project Pan Purist | Power-user extensions of P1 (batch logging, weight tracking). Post-class                                                                                            |

---

## P1 — Maya, the Low-Tech Migrator (primary)

**Who:** Active r/ProjectPan member. Tracks her pan progress today with a
notes app, a spreadsheet, or literally paper and tape with daily tally marks.
Knows exactly what Project Pan is; has opinions about it.

**Core motivation:** See her progress. The 10→9→8 pantry feeling — watching
the stash shrink is the reward.

**Current tool (our real competitor):** Spreadsheet / notes app / notebook.
Not Beautistics — most of this community never adopted the existing apps
because of item caps and logging fatigue.

**Pain points:** Manual tracking is tedious and invisible (no visuals, no
celebration); competitor apps cap free tiers at 5–30 items and lose history
when products finish; scanning features crash.

**What PanPals gives her (MVP):** F1 fast-log (≤15s), F2 3-tap ring check-in,
F3 Focus Pot, F4 rings/donut, F8 streak, F9 in-store stash check. No caps,
ever (D2).

**Churn moment to design against:** Onboarding. If logging her first 10
products takes an hour, she's back to her spreadsheet. This is why F1's 15s
spec is the single most important number in the PRD.

**Journey (MVP-true):**

1. Sees a PanPals empties post linked in r/ProjectPan → downloads.
2. Logs 8 products she's actively panning — photo, brand, name, category,
   format, status. Under 2 minutes total.
3. Pins 5 to her Focus Pot. Home now shows her rings.
4. Each morning: opens app, taps a ring, slides 5%. Five seconds. Streak ticks.
5. Three weeks in, her lip balm hits 0% → finish celebration → her first
   empty → badge.
6. Shares the empty to the feed; screenshots it for the subreddit. (Organic
   growth loop — she is also our distribution.)

**Validation question (user test):** does she describe the daily check-in as
something she'd do unprompted every morning? Target: log ≤15s median.

---

## P2 — Claire, the Dopamine-Chasing Hauler (secondary; highest test priority)

**Who:** Beauty-TikTok native. The rush is in researching, ordering, and
unboxing — then guilt and a cluttered vanity. "Last Supper" hauls before
every attempted no-buy. Saves products to folders she never reopens.

**Core motivation:** Wants to _feel in control_ of her buying without being
policed. She's not quitting beauty — this "isn't like someone looking to quit
smoking" (persona-iteration doc, decision on soft alerts).

**Pain points:** Buys near-duplicates of shades she owns; retailer wishlists
are designed to make her buy more, not less; hard-blocker apps feel like
punishment and get deleted.

**What PanPals gives her (MVP):** F5 impulse intercept — adding a blush to
her wishlist when she owns 4 similar ones triggers the calm "Hold on"
banner showing _her own inventory_, with a 14-day cooling-off CTA (D3).
Confrontation with her own data, not a lecture. F6 finish moments retrain
the dopamine hit from buying → finishing (rewards never come from purchases).

**Churn moment to design against:** The intercept itself. One shaming word
and she uninstalls. Copy rules in AI-CONTEXT.md §5 exist because of her.

**Journey (MVP-true):**

1. Late-night TikTok → new Rare Beauty blush → opens PanPals to add it to
   her wishlist (habit we're building: wishlist first, checkout never-first).
2. Intercept: "You already have 4 very similar blushes in active rotation" +
   grid of her Glossier/NARS/Westman/Ilia. Buy Now visually deprioritized,
   never disabled (D2).
3. She adds it to the 14-day cooling-off list. The urge passes tonight either way.
4. Day 14: item unlocks to "ready." Half the time she no longer wants it and
   removes it — that removal is the product working.
5. Her wishlist becomes her in-store list: she buys what she actually wanted
   six months ago instead of what the endcap showed her.

**Validation question (user test):** does the banner read as supportive or
judgmental? Target: ≥1 of 5–8 testers says it would change a real purchase
decision; zero testers use the word "judged."

**Lifecycle note:** Claire is designed to _evolve into Maya_. The reward
system (finishing earns, buying never earns) is the transition mechanism —
confirmed in the persona-iteration session.

---

## P3 — Sam, the Zero-Waste Eco-Purist (tertiary)

**Who:** Motivated by waste, not money. Keeps a shoebox of the year's
empties. Star-and-photograph-then-toss ritual. Anxious at a crowded vanity;
guilty discarding products that didn't work.

**Core motivation:** The gratification of the finish, witnessed. "It's the
satisfaction" — the empties ritual is the single strongest emotional signal
in all our research.

**Pain points:** Finishing a product is invisible in every existing tool;
decluttered items vanish into "the void" in competitor apps; no community
celebrates _using up_ rather than _buying_.

**What PanPals gives her (MVP):** F6 finish celebration with months-in-use +
repurchase verdict, F7 Community Empties feed with likes, eco-styled badges
(sage tokens). Post-class: Mindful Toss / purge log (deferred — D of PRD
out-of-scope; the honor system makes it low-stakes to defer).

**Churn moment to design against:** An empty feed at launch. Seed it
(@claire_pans, @minimal_maya demo content per R8) before any tester opens it.

**Journey (MVP-true):**

1. Finishes a serum → taps "Log an Empty" → celebration animation, "3 months"
   chip, Repurchase: Yes, photo of the scraped-out jar.
2. Post appears in Community Empties; collects likes; earns First Empty badge.
3. Browsing the feed, she sees a product she's curious about → taps "add to
   wishlist" → Claire's intercept flow catches any duplicate risk. (This is
   the deliberate answer to "won't a feed trigger shopping?" — the feed feeds
   the wishlist, and the wishlist has guardrails.)
4. Her repurchase verdicts accumulate into a personal "worth it / not worth
   it" history — the seed of the post-class review feature.

**Validation question (user test):** does she call the finish moment
"motivating"? Does she understand the repurchase verdict without explanation?

---

## P4 — Priya, the Visual Curator (design lens now, build target later)

**Who:** Neurodivergent; out of sight is out of mind. A drawer of products
she forgets she owns, so she rebuys duplicates, then feels overwhelmed AND
like she has nothing to use.

**Why she's not a build target for the class MVP:** her dedicated features —
auto color-family grids, home-screen widgets, shade-similarity matching —
depend on color AI and native widget work that are out of scope.

**Why she still matters now (adopt as design principles):**

- Visual-first: photos and rings over text lists, everywhere.
- Minimal taps: her 1-tap tolerance is why F2 is specced at ≤3 taps.
- Gentle, non-alarming alerts: soft amber, never red — she's the reason.
- F9's category filter is her in-store duplicate check, v0.

**Post-class backlog:** color-coded inventory grid, home-screen widget,
PAO "getting old" nudges with use-it-up suggestions.

---

## Deferred power users (post-class)

**Subscription Box Overloader** — batch-log 5 minis in <30s. Extension of
F1; requires a batch wizard we don't need for 5–8 testers.
**Project Pan Purist** — weight-based tracking, per-pump ml estimation
(0.1ml/pump), multi-project challenges ("10 by Summer"), Hall of Fame
archive. She's Maya with a lab notebook; serve Maya first. These two are the
premium tier if PanPals continues (per persona-iteration monetization
decision).

## Anti-personas (we do not build for these)

1. **The Shelf Cataloguer** — wants a beautiful digital display of everything
   they own, with no consumption goal. That's Beautistics's user; serving
   them turns PanPals into a collection app and reintroduces the
   overconsumption tension.
2. **The Hard-Stop Seeker** — wants the app to _forbid_ purchases
   (quit-smoking model). We decided honor system + soft alerts (D2); this
   user will be disappointed by design.

---

## Persona → screen → metric traceability

| Persona | Mockup/flow                       | Maestro flow                | Fair metric                                           |
| ------- | --------------------------------- | --------------------------- | ----------------------------------------------------- |
| Maya    | home-dashboard.png, log-modal.png | log-product, focus-and-ring | ≤15s median log                                       |
| Claire  | wishlist-intercept.png            | wishlist-intercept          | ≥1 changed purchase decision; 0 "judged"              |
| Sam     | empties-feed.png                  | finish-and-feed             | finish = "motivating"; North Star: empties/user/month |

## Screener questions (recruiting 5–8 MBA-cohort testers)

1. Do you know what "Project Pan" is / have you ever tried to finish products
   on purpose? (→ Maya)
2. In the last 3 months, did you buy a makeup/skincare product similar to one
   you already owned? (→ Claire)
3. Do you keep or photograph empties, or feel guilt tossing unfinished
   products? (→ Sam)
4. Do you currently track products in a spreadsheet, notes app, or notebook?
   (→ Maya, strongest signal)
   Recruit at least 2 Mayas, 2 Claires, 1 Sam. Screen out pure Shelf Cataloguers.

---

## Why we consolidated (evaluation of the prior sets)

**What was strong:** both sets were behaviorally grounded in real community
evidence (r/ProjectPan, r/MakeupRehab), and the persona-iteration session
correctly stress-tested friction vs. churn, killed the item cap, and chose
the four highest-risk flows to wireframe.

**What was broken, now fixed:**

1. _Two unreconciled taxonomies (9 personas for a 5-person class project)._
   Dopamine Collector ≈ Dopamine-Chasing Hauler (merged → Claire); Practical
   Panner ≈ Project Pan Purist (merged → deferred power user; her
   "structured tracker" core absorbed into Maya); Mindful Minimalist ≈
   Zero-Waste Eco-Purist (merged → Sam).
2. _Journeys were feature tours, not decision journeys._ The deep-research
   journeys exist to justify features (AI scanner, CSV import, Stash
   Roulette, PanScore tiers, 30-day sandbox, locked purchase links) — five of
   which the team later cut or reversed. Rewritten journeys only use MVP
   features and match D1–D8.
3. _No failure paths._ Every original journey ends happily. Each persona now
   carries an explicit churn moment, which is what user testing must probe.
4. _The best-evidenced persona was the least developed._ The subreddit
   screenshots (paper/tape/spreadsheet trackers) validate Maya — yet she had
   the thinnest write-up. She is now P1.
5. _No anti-personas._ Added two, both of which directly protect standing
   decisions (D2, D6).
