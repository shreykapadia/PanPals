# GEMINI-FOOTER-PLAN.md — Bottom navigation rebuild (Shrey's lane)

> **Agent:** Gemini 3.6. **Human owner:** Shrey. **Lane:** platform / navigation.
> **Scope:** replace the five-destination bottom tab bar with a four-destination bar
> plus a centre **⊕ Log** action, and move **You** off the bar.
>
> **Read before writing any code, in this order:** `AI-CONTEXT.md` (whole file),
> `docs/DESIGN-TOKENS.md` (whole file — this is the design source of truth and it
> wins over any mockup), `docs/PERSONAS.md` §"MVP priority order" + Maya, and
> `docs/PRD.md` §"Functions" (F1, F4, F8, F9) + §"Information architecture".

---

## 0. Re-audited against `main` @ `ba4c997` — 2026-07-27

This plan was first written when most lanes were still stubs. **Four lanes have shipped
since**, and five things in the original draft were wrong against the real code. They
are corrected below; this section exists so you know what changed and do not "restore"
the old advice.

| #      | Was                                                                       | Now                                                                                                                                      |
| ------ | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **C1** | ⊕ pushes to a new placeholder screen `app/log.tsx`                        | ⊕ opens **Matt's shipped `FastLogSheet`** via `/(tabs)/inventory?action=log`. Task 3 is rewritten; no `app/log.tsx` is created.          |
| **C2** | ⊕ `accessibilityLabel` = `"Log a product"`                                | **Collides** with `features/inventory/strings.ts:28`, which `.maestro/log-product.yaml` taps. Changed to `"Quick log a product"` (§5.7). |
| **C3** | Chain ends at Talbia deleting the `progress.tsx` shim                     | `ItemDetailSheet.tsx:53` hardcodes `/(tabs)/progress`. **Matt must repoint it before the shim dies** or F6 breaks — new step 4 in §3.    |
| **C4** | Placeholder house style copied from "the `app/(tabs)/inventory.tsx` stub" | That stub is gone; Matt shipped the real screen. Moot — C1 removes the placeholder entirely. (`PLAN-AUDIT.md` §3-B6 caught this.)        |
| **C5** | Tests live in `app/__tests__/`; `LogTabButton` is just a file             | No `app/__tests__/` exists — tab tests live in `app/(tabs)/__tests__/`. Also export the new component from `components/ui/index.ts`.     |

**Two facts from `PLAN-AUDIT.md` that constrain this PR:**

- **There is no mock phase left.** `lib/api/*` hits real Supabase and RLS returns `[]`
  when signed out. To click through the footer you need a signed-in session.
- **`track()` lives in `lib/analytics.ts` and throws on an unknown event name.**
  Do **not** add an analytics call to the ⊕ button — there is no allow-listed event for
  it, and inventing one fails at runtime, not at compile time.

---

## 1. What changes and why

| Before                                               | After                                                           |
| ---------------------------------------------------- | --------------------------------------------------------------- |
| `Home │ Inventory │ Progress │ Wishlist │ You`       | `Home │ Inventory │ ⊕ Log │ Wishlist │ Empties`                 |
| Logging reachable only from a Home quick-action pill | Logging reachable from every screen via a centre action         |
| Profile occupies a primary tab                       | Profile reached from the Home top app bar (`href: null` tab)    |
| "Progress" duplicates Home's donut + streak          | "Empties" names the private archive — the actual differentiator |

Grounded in the docs, not taste:

- **F1 (≤15s log) is the single most important number in the PRD**, and Maya's named
  churn moment is logging fatigue during onboarding — "if logging her first 10
  products takes an hour, she's back to her spreadsheet." Her second log currently
  requires navigating back to Home to find a pill. The centre slot goes to the action
  she repeats dozens of times.
- **D21 removed the design system's original centre "Quick Log (+)"** explicitly to
  keep the Progress tab and the file-ownership matrix intact. That was an org-chart
  decision, not a journey decision. This plan reverses it and records the reversal.
- **D13 deleted the Community sub-tab**, leaving the private empties archive as the
  only non-duplicated content on that tab. Maya's pain point is that competitor apps
  "lose history when products finish"; Sam's is that decluttered items "vanish into
  the void." The North Star metric is **empties/user/month**. Name the tab for it.
- **"You" is goals, sign out, and delete account** — matrix row 20, required, visited
  about once. It was holding 20% of primary navigation.

---

## 2. Files you may touch

Everything here is inside Shrey's lane per `AI-CONTEXT.md` §3. **Do not edit anything
else**, and in particular do not touch `app/(tabs)/index.tsx`, `features/home/*`,
`components/ProgressRing.tsx` (Aaron), `app/(tabs)/inventory.tsx`,
`features/inventory/*` (Matt), `app/(tabs)/wishlist.tsx`, `features/wishlist/*`
(Joon), `app/(tabs)/progress.tsx`, `app/(tabs)/empties.tsx`, `features/empties/*`
(Talbia). If you believe you need one of those, stop and print a `CROSS-LANE REQUEST`.

- `app/(tabs)/_layout.tsx` — the tab bar
- `app/(tabs)/you.tsx` + `app/(tabs)/you.strings.ts` — remove from the bar, keep as a route
- `components/ui/LogTabButton.tsx` — **new**, the centre button
- `components/ui/index.ts` — export the new component from the barrel
- `components/ui/Icon.tsx` — two icon names
- `theme/tokens.ts` + `tailwind.config.js` — footer height
- `docs/DESIGN-TOKENS.md`, `docs/PRD.md`, `docs/DECISIONS.md` — record the change
- `components/ui/__tests__/`, `app/(tabs)/__tests__/` — tests

**No `app/log.tsx`.** The original draft created one; C1 removed it. See §6.

## 3. Sequencing — do not merge out of order

Three other lanes are involved and `main` breaks if this lands first.

1. **Aaron merges first.** His Home top app bar gains the profile button (his Phase 5).
   Until it exists, `href: null` on the You tab makes the profile unreachable anywhere
   in the app. **As of `ba4c997` this has not shipped** — `features/home/QuickActions.tsx`
   still has the three-pill row including "Log Item".
2. **Talbia merges second.** Her PR creates `app/(tabs)/empties.tsx` and leaves a
   one-line re-export shim at `app/(tabs)/progress.tsx`, so both routes resolve.
3. **You merge third** — this plan.
4. **Matt merges fourth** — `ItemDetailSheet.tsx:53` currently pushes to
   `/(tabs)/progress`; he repoints it to `/(tabs)/empties` and adds the `action=log`
   param handling from §6. **This step did not exist in the original chain and it is
   load-bearing** (see C3).
5. **Talbia merges last** — the 2-line follow-up deleting the shim. If this jumps ahead
   of step 4, Matt's "Mark as Finished" button navigates to a dead route and F6 stops
   working in a production build.

**Before you start, verify step 2 has landed:**

```bash
git checkout main && git pull && ls "app/(tabs)/"
```

You should see **both** `empties.tsx` and `progress.tsx`. If `empties.tsx` is missing,
stop and tell Shrey — do not create it yourself, it is Talbia's file.

Then branch:

```bash
git checkout -b feat/shrey/footer-log-tab
```

---

## 4. Task 1 — `components/ui/Icon.tsx`

Add two names to `IconName` and to the `icons` map. Import `Plus` from
`lucide-react-native` alongside the existing imports; `Sparkles` is already imported.

- `log: Plus` — the centre action.
- `empties: Sparkles` — reuse the component already mapped to `progress`. Sparkles
  reads as celebration, which is the right register for a finish archive.

Keep `progress: Sparkles` in place for now. `app/(auth)/strings.ts` references
`icon: 'progress'` in two places (the onboarding value props) and removing the key
would break the build. Point those two entries at `'empties'` in the same commit, then
delete the `progress` key. Confirm nothing else references it:

```bash
grep -rn "'progress'" --include='*.ts' --include='*.tsx' app components features lib
```

## 5. Task 2 — `components/ui/LogTabButton.tsx` (the centre button)

This is the visual centrepiece of the change. It must not look like a plain tab.

**Every colour comes from `theme/tokens.ts` by key. Never type a hex literal** — the
one exception is the pure-white sheen overlay described below, which is an opacity
gradient rather than a brand colour; give it a named local constant and a comment.

### 5.1 Geometry and tap target

| Property               | Value                     | Reason                                                                                        |
| ---------------------- | ------------------------- | --------------------------------------------------------------------------------------------- |
| Circle diameter        | 64pt                      | Comfortably above the 44pt iOS / 48dp Android minimum. This is the primary action of the app. |
| `hitSlop`              | 12                        | Effective target ≈ 88pt, so the overhanging top edge is never a near-miss.                    |
| Overhang above the bar | −18pt                     | Lifts the button out of the row so it reads as an action, not a fifth destination.            |
| Tab bar height         | 88pt                      | Was 80. Needed for a 64pt circle plus the label without crowding. Update the token (Task 6).  |
| Icon glyph             | 26pt, `strokeWidth={2.5}` | Within the 1.5–2pt line-icon range once scaled; reads confidently at 64pt.                    |
| Label                  | 11pt Satoshi-Medium       | Matches the other four tab labels exactly.                                                    |

The overhang needs `overflow: 'visible'` on `tabBarStyle` (Task 3). On Android,
`overflow: 'visible'` combined with `elevation` is unreliable. Render, look at it on an
Android emulator, and **if the top of the circle is clipped, reduce the overhang to
−10 via `Platform.select` and leave iOS at −18.** Do not skip this check.

### 5.2 The fill — a rose gradient, drawn in SVG

Do **not** add `expo-linear-gradient`. `react-native-svg@15.12.1` is already a
dependency and `AI-CONTEXT.md` §2 says not to introduce alternatives to the stack.

```
<Svg width={64} height={64} viewBox="0 0 64 64">
  <Defs>
    {/* vertical rose gradient: light at the top, brand rose at the bottom */}
    <LinearGradient id="logFill" x1="0" y1="0" x2="0" y2="1">
      <Stop offset="0"   stopColor={colors['inverse-primary']} />   {/* #ffb3b3 */}
      <Stop offset="1"   stopColor={colors['primary-container']} /> {/* #F2A2A2 — PanPal Rose */}
    </LinearGradient>

    {/* soft off-centre sheen, as if lit from the upper left */}
    <RadialGradient id="logSheen" cx="34%" cy="26%" r="64%">
      <Stop offset="0" stopColor={SHEEN} stopOpacity="0.5" />
      <Stop offset="1" stopColor={SHEEN} stopOpacity="0" />
    </RadialGradient>
  </Defs>

  <Circle cx="32" cy="32" r="32" fill="url(#logFill)" />
  <Circle cx="32" cy="32" r="32" fill="url(#logSheen)" />
</Svg>
```

`SHEEN` is a local `const SHEEN = '#FFFFFF'` with a comment noting it is a light
overlay, not a palette colour. The two circles together read as a soft rose pebble
rather than a flat disc — that is the whole trick, and it is two extra lines.

### 5.3 The lift — a soft rose shadow, never black

`DESIGN-TOKENS.md` §4: _"soft diffused shadows — never hard borders or pure-black
shadows."_ Put this on the `Animated.View` wrapping the SVG:

```
shadowColor: colors.primary,   // #8c4c4d — deep rose, NOT black
shadowOffset: { width: 0, height: 6 },
shadowOpacity: 0.28,
shadowRadius: 14,
elevation: 8,
borderRadius: 32,              // so the Android elevation shadow is round
```

No border on the circle. Separation comes from the shadow and the tonal difference
against the white bar, exactly as the design system prescribes.

### 5.4 The glyph

The `Plus` icon in **`colors['dark-neutral']` (#333333), not white.** This is both the
on-system choice — `DESIGN-TOKENS.md` §4 specifies rose CTAs carry `#333333` text —
and the accessible one: charcoal on `#F2A2A2` is about **6.3:1**, while white on the
same rose is about **2.0:1** and fails WCAG 1.4.11 for graphical objects.

Centre it absolutely over the SVG.

### 5.5 The label

Render `Log` beneath the circle in 11pt `Satoshi-Medium`, `colors['dark-neutral']`.
It stays charcoal in every state — this is an action, so it has no active/inactive
colour the way the four destinations do.

**Align its baseline with the other four tab labels.** The numbers above are a starting
point, not a guarantee: open the app, look at the row, and adjust the wrapper's `top`
and the label's `marginTop` until the five labels sit on one line. State in your final
message what values you settled on.

### 5.6 Press feedback

`Pressable`, with an `Animated.spring` scaling the wrapper `1 → 0.93` on `pressIn` and
back on `pressOut`. Use `useNativeDriver: true`.

Respect reduce-motion via the existing shared hook — `import { useReducedMotion } from
'../../lib/useReducedMotion'` (already used by `components/ui/RingMark.tsx`). When
reduce-motion is on, skip the scale animation entirely; do not substitute a different
one.

On Android also pass `android_ripple={{ color: colors['on-primary-container'], borderless: true, radius: 32 }}`.

### 5.7 Accessibility

```
accessibilityRole="button"
accessibilityLabel="Quick log a product"
```

`accessibilityRole="button"`, not `tab` — it opens a flow, it does not select a
destination, and announcing it as a tab would be a lie to a screen-reader user.

**The label must not be `"Log a product"` (C2).** That exact string is already
`features/inventory/strings.ts:28`, the label on Matt's add button, and
`.maestro/log-product.yaml:17` taps it by name. Since the ⊕ is on _every_ screen
including Inventory, reusing the string gives that selector two matches and Matt's
flow starts failing intermittently. `"Quick log a product"` is distinct under Maestro's
case-sensitive matching, and it tells a screen-reader user what is different about this
control. Verify after you ship:

```bash
grep -rn "Log a product" features/ components/ app/ .maestro/
```

Exactly one non-Maestro hit, in `features/inventory/strings.ts`.

### 5.8 Props

```ts
interface LogTabButtonProps {
  onPress: () => void;
  accessibilityLabel?: string; // defaults to "Quick log a product"
}
```

Keep the component presentational. Navigation lives in the layout. Export it from
`components/ui/index.ts` alongside the other primitives — the barrel is how every other
lane imports shared UI.

## 6. Task 3 — the ⊕ destination (**rewritten — C1**)

**Do not create `app/log.tsx`.** The original draft did, and it was wrong: Matt has
since shipped the whole F1 fast-log as `FastLogSheet`, a modal rendered _inside_
`app/(tabs)/inventory.tsx` and driven by an `isLogOpen` state that already exists at
line 25. A separate `/log` screen would either duplicate that form or dead-end on a
placeholder at the design fair — for the one action this entire redesign is built
around.

**Route to the sheet instead:**

```ts
router.push({ pathname: '/(tabs)/inventory', params: { action: 'log' } });
```

Three reasons this is the right call and not a shortcut:

- **It reuses shipped, tested code.** `FastLogSheet` already does catalog search,
  manual entry, and `useCreateProduct`. Nothing is rebuilt.
- **It matches the codebase's existing convention.** `ItemDetailSheet.tsx:53` already
  passes `params: { finishProductId }` across a lane boundary exactly this way. You are
  following a precedent, not inventing one.
- **It keeps the tab bar visible.** A pushed route outside the tab group would cover
  it; landing on Inventory with a sheet over it does not.

The param handling is **~4 lines in Matt's file**, so it is his to write. Put this in
your PR description verbatim so Shrey can route it — and note that `PLAN-AUDIT.md` §4
records that Matt was **never sent** the original version of this request, so confirm
it actually reaches him:

```
CROSS-LANE REQUEST — to Matt (+ Shrey to route)
The new centre ⊕ Log tab pushes to:
    router.push({ pathname: '/(tabs)/inventory', params: { action: 'log' } })
so it opens your existing FastLogSheet rather than a second log screen. Needed in
app/(tabs)/inventory.tsx, roughly 4 lines:
    const { action } = useLocalSearchParams<{ action?: string }>();
    useEffect(() => { if (action === 'log') setIsLogOpen(true); }, [action]);
plus clearing the param (router.setParams({ action: undefined })) when the sheet
closes, so re-tapping ⊕ from Inventory reopens it.
Same PR, please also repoint the finish seam: ItemDetailSheet.tsx:53 pushes to
'/(tabs)/progress', which becomes '/(tabs)/empties'. Talbia's shim keeps the old path
alive only until she deletes it — after that, F6 breaks in a production build.
Follow-up (not now): true modal presentation would need app/_layout.tsx to move from
<Slot /> to <Stack />. Post-fair.
```

**Until Matt's PR lands**, the ⊕ still does something sensible — it navigates to
Inventory, where the "Log a product" button is the first thing on screen. Degraded, not
broken. Say so in your PR description so nobody files it as a bug.

## 7. Task 4 — `app/(tabs)/_layout.tsx`

Rewrite the tab list. Declaration order is render order.

1. `index` — Home, icon `home`. Unchanged.
2. `inventory` — Inventory, icon `inventory`. Unchanged.
3. **the centre action** — this slot has **no route of its own** (C1). It is a button
   painted into the bar, not a destination:
   - Render it via `options.tabBarButton` on a `Tabs.Screen`, with
     `onPress={() => router.push({ pathname: '/(tabs)/inventory', params: { action: 'log' } })}`.
   - `options.tabBarLabel: () => null` — the button draws its own label.
   - Because there is no backing file, expo-router 6.0.24 may warn about a
     `Tabs.Screen` with no matching route. Two clean ways out: pair `tabBarButton` with
     `href: null`, or skip the `Tabs.Screen` entirely and inject the button with a
     custom `tabBar` renderer. **Try the first; if it still warns, use the second.**
     Do not ship a build that logs a router warning on every mount.
4. `wishlist` — Wishlist, icon `wishlist`. Unchanged.
5. **`empties`** — label `Empties`, icon `empties`,
   `tabBarAccessibilityLabel: 'Empties Archive Tab'`. Replaces the `progress` entry.
6. **`you`** — keep the `Tabs.Screen`, add **`href: null`**. The route stays reachable
   at `/you` from Aaron's header button; it just leaves the bar.

`screenOptions` changes:

- `tabBarStyle.height: 88` (from 80) — read it from `spacing['footer-height']` rather
  than typing the number, once Task 6 updates the token.
- `tabBarStyle.overflow: 'visible'` — required for the overhang.
- Everything else — the `rounded-t-3xl` corners, the `border-warm` hairline, the
  `card-surface` background, the soft `dark-neutral` shadow, the active
  `primary-container` / inactive `inactive-gray` tints, `Satoshi-Medium` 11pt labels —
  stays exactly as it is. This is the design system's nav spec and it is correct.

## 8. Task 5 — `app/(tabs)/you.tsx`

The screen keeps working; it is simply no longer a tab. It currently assumes a tab
context, so add a back affordance: a header row with an `arrow-left` icon button
(`router.back()`) above the existing content. `useRouter` is already imported at line 4.

**Copy goes in `app/(tabs)/you.strings.ts`** — that file exists and the screen imports it
as `s`; do not inline the label. Add a `backAccessibilityLabel` key and use it.

Change nothing else about the profile, goals, sign-out, or delete-account flows.

`app/(tabs)/__tests__/you.test.tsx` exists with four cases and must stay green. Add a
fifth asserting the back control renders and calls `router.back()`.

## 9. Task 6 — Tokens and documentation

Record the change; do not let the docs drift (D11's warning).

**`theme/tokens.ts`** — `spacing['footer-height']: 88`.
**`tailwind.config.js`** — `'footer-height': '88px'`.

> **Do not touch the type scale while you are in these files.** `DESIGN-TOKENS.md`
> carries a 2026-07-26 revision (body 14→16, muted 12→14, button 14→16, badge 11→12)
> that `PLAN-AUDIT.md` §3-B6 found is applied in **zero** files. The tab labels are
> 11px today and this plan keeps them at 11px so the ⊕ label matches its neighbours.
> Applying the revision is a separate app-wide sweep — doing half of it here leaves two
> scales fighting inside one component.

**`docs/DESIGN-TOKENS.md`:**

- §3 spacing block: `footer-height: 5.5rem # h-22 (88px)` with a trailing comment
  noting the centre action needs the extra height.
- §5 "Navigation & shell": replace the bottom-tabs line and the D21 nav note with the
  new IA — four destinations plus a centre action; describe the button per §5 of this
  plan (64pt, rose gradient, soft rose shadow, charcoal glyph, "Log" label); state
  that You is reached from the Home app bar.
- §6 screen ground truth table: add a row noting that `home-dashboard.png` still shows
  the **old** five-destination footer and the three-pill quick-action row, and that
  **this file wins** — the mockup is stale on both points. Do not edit the PNG.

**`docs/PRD.md`** §"Information architecture": replace the bottom-tabs line, note that
the Progress tab is now Empties, that the donut and streak live on Home only (which is
what F4 and F8 always said), and that the centre ⊕ serves F1. Still no 6th destination.

**`docs/DECISIONS.md`** — append. **This is now a correctness fix, not bookkeeping:**
`docs/plans/README.md` and this plan already cite **D23** as though it exists, and
`PLAN-AUDIT.md` §3-B6 flags the dangling reference. Do not skip it.

```
**D23 — 2026-07-27 — Bottom nav = Home | Inventory | ⊕ Log | Wishlist | Empties.**
Partially reverses D21's navigation clause and restores the design system's original
centre "Quick Log (+)". Why: D21 kept five destinations to protect the ownership
matrix, which is an org reason, not a user one. An audit against PERSONAS.md and PRD.md
found (a) F1's ≤15s log — "the single most important number in the PRD" — had no
persistent entry point, while Maya's named churn moment is logging fatigue; (b) after
D13 removed the Community sub-tab, "Progress" duplicated Home's F4 donut and F8 streak
and hid the private empties archive, which is the differentiator two personas name and
which the North Star metric (empties/user/month) measures; (c) the You tab held 20% of
primary nav for a once-per-user destination. "You" moves to a profile button in the
Home top app bar (href: null, route intact). The Home "Log Item" quick-action pill is
removed as a duplicate path; Scan and Search remain. Ownership is unchanged: Talbia
still owns the last tab (renamed empties.tsx), Aaron still owns Home. Footer height
80 → 88px to seat the 64pt centre button (DESIGN-TOKENS §3).
```

## 10. Task 7 — Tests

Add `components/ui/__tests__/LogTabButton.test.tsx` (there is an existing
`components/ui/__tests__/ui.test.tsx` — match its setup style):

- Renders with the default `accessibilityLabel` "Quick log a product" and
  `accessibilityRole="button"` (not `tab`).
- Calls `onPress` once when pressed.
- Renders the "Log" label.
- With `useReducedMotion` mocked to `true`, pressing does not start an animation.

Add a tab-layout test in **`app/(tabs)/__tests__/`** — that is where
`wishlist.test.tsx` and `you.test.tsx` live. **There is no `app/__tests__/` directory**
(C5); do not create one.

- Exactly four destination tabs render: Home, Inventory, Wishlist, Empties.
- No tab labelled "You" and none labelled "Progress" appears in the bar.
- The centre button renders between Inventory and Wishlist.
- Pressing it routes to `/(tabs)/inventory` with `params.action === 'log'`.

---

## 11. Verify

```bash
npm run verify
```

Zero errors — TypeScript, ESLint, Prettier, and Jest. There is no CI; this command is
the gate.

```bash
npx expo start     # press w for web, i for iOS simulator, a for Android
```

**Sign in first.** There is no mock phase left — `lib/api/*` hits real Supabase and RLS
returns `[]` when signed out, so an unauthenticated pass tells you nothing about whether
the tabs load their content.

Check all of these by looking at the app, not by reasoning about the code:

- [ ] Five slots: Home, Inventory, ⊕, Wishlist, Empties. No "You," no "Progress."
- [ ] The ⊕ is a rose **gradient** disc with a visible sheen toward the upper left — not a flat circle.
- [ ] It sits **above** the bar's top edge and casts a soft rose shadow, no hard border.
- [ ] The plus glyph is charcoal, not white.
- [ ] The "Log" label sits on the same line as the other four labels.
- [ ] Pressing it scales it down and lands on Inventory — with `FastLogSheet` open if Matt's PR has merged, otherwise on the plain Inventory list. Either is expected right now.
- [ ] Tapping ⊕ **while already on Inventory** still opens the sheet (this is the case the param-clearing in §6 exists for — check it once Matt lands).
- [ ] The tab bar's rounded top corners are intact and nothing is clipped — **check Android specifically**, this is where `overflow: 'visible'` breaks.
- [ ] The circle is easy to hit with a thumb, including near its top edge.
- [ ] The Empties tab opens Talbia's archive.
- [ ] From Home, the profile button reaches `/you`, and the new back control returns you.
- [ ] With reduce-motion on, pressing the ⊕ still works and simply does not animate.
- [ ] A screen reader announces the ⊕ as a button called "Quick log a product."
- [ ] `maestro test .maestro/log-product.yaml` still passes — it taps `'Inventory Tab'` then `'Log a product'`, and the ⊕ must not have made that second selector ambiguous (C2).

---

## 12. Guardrails

- **Never hardcode a hex, font, or radius.** Everything comes from `theme/tokens.ts`.
  The single exception is the `SHEEN` white overlay in the SVG gradient, which is a
  light effect rather than a palette colour — name it and comment it.
- **No new dependencies.** The gradient is `react-native-svg`, already installed.
  Do not reach for `expo-linear-gradient`, and do not introduce a styling library —
  NativeWind only (`AI-CONTEXT.md` §2).
- **Stay in the lane in §2.** If a change seems to require another lane's file, stop
  and print a `CROSS-LANE REQUEST`. Prove the PR is clean with
  `git diff --name-only main`.
- **Do not restructure `app/_layout.tsx`.** It still renders `<Slot />`; the
  `<Slot />` → `<Stack />` migration for modal presentation is a separate, post-fair change.
- **Do not build, duplicate, or re-scaffold the fast-log form.** It is Matt's, it is
  already shipped as `FastLogSheet`, and the ⊕ routes to it (§6). Creating
  `app/log.tsx` is the single most likely wrong turn in this plan.
- **Do not add a `track()` call to the ⊕.** `track()` lives in `lib/analytics.ts` and
  throws on an unknown event name — there is no allow-listed event for this button.
- **Do not edit `docs/mockups/*.png`.** Note the drift in `DESIGN-TOKENS.md` §6 instead.
- **Do not add a sixth destination**, and do not add badges, points, counts-as-rewards,
  or a notification bell to the bar (D15, D19).
- **Never `git push --force`, never merge, never commit to `main`.** Branch, PR, and
  fill in `.github/pull_request_template.md`.
- Keep the PR under ~400 changed lines. If the doc updates push it over, split them
  into a second PR.
