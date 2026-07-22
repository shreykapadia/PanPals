# A11Y-CHECKLIST.md — Phase 3 accessibility + privacy audit

Covers Shrey's lane only (`app/(auth)/*`, `app/(tabs)/you.tsx`, `components/ui/*`),
per AI-CONTEXT.md §3 and PRD matrix row 25. Re-run this checklist whenever one of
those files changes.

## 1. accessibilityLabel / accessibilityRole coverage

Every interactive element (`Pressable`, `Button`, `Chip`, `Switch`, `Input`) in the
audited files has an explicit `accessibilityLabel`, and every touchable has an
`accessibilityRole` (`button`, `checkbox`, or `switch`). Confirmed by direct read
of: `welcome.tsx`, `sign-up.tsx`, `sign-in.tsx`, `goal-capture.tsx`, `you.tsx`,
`EmptyState.tsx`, `LoadingState.tsx`, `ErrorState.tsx`, `ProductSearch.tsx`,
`Button.tsx`, `Chip.tsx`. No gaps found.

## 2. Touch targets (≥44×44pt)

| Component                               | Sizing                               | Result                                                                                                                           |
| --------------------------------------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| `Button`                                | fixed `h-12` (48px)                  | Pass                                                                                                                             |
| `Input`                                 | fixed `h-12` (48px)                  | Pass                                                                                                                             |
| `Chip`                                  | was padding-only (`px-4 py-2`)       | **Fixed this phase** — added `min-h-[44px]`                                                                                      |
| Reminders `Switch`                      | native control (OS-defined hit area) | Pass (platform-guaranteed)                                                                                                       |
| "Edit goals" / "Skip" text `Pressable`s | `py-2`–`py-4` wrapping short text    | Effectively ≥44px with vertical padding at default font scale; not pixel-locked, revisit if Dynamic Type/large fonts collapse it |

## 3. Contrast (WCAG AA — 4.5:1 normal text, 3:1 large text/UI components)

Computed against `theme/tokens.ts` (relative-luminance formula, not eyeballed):

| Pair                                                                              | Ratio   | AA (normal text)                                                                          |
| --------------------------------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------- |
| `dark-neutral` #333333 on `surface` #FFF8F4                                       | 12.02:1 | Pass                                                                                      |
| `dark-neutral` #333333 on `card-surface` #FFFFFF                                  | 12.63:1 | Pass                                                                                      |
| `muted-text` #666666 on `surface` #FFF8F4                                         | 5.46:1  | Pass                                                                                      |
| `muted-text` #666666 on `card-surface` #FFFFFF                                    | 5.74:1  | Pass                                                                                      |
| `error` #ba1a1a on `surface` #FFF8F4                                              | 6.15:1  | Pass                                                                                      |
| `dark-neutral` #333333 on `primary-container` #F2A2A2 (Button/Chip selected text) | 6.30:1  | Pass                                                                                      |
| `dark-neutral` #333333 on `eco-sage` #A8C69F (success Badge)                      | 6.76:1  | Pass                                                                                      |
| `on-primary-container` #713638 on `primary-container` #F2A2A2                     | 4.58:1  | Pass                                                                                      |
| `dark-neutral` #333333 on `warning-peach` #F8D7DA                                 | 9.46:1  | Pass                                                                                      |
| `outline` #857372 on `surface` #FFF8F4                                            | 4.26:1  | **Below 4.5:1** — only used for non-text outline strokes, not body text; no action needed |
| `inactive-gray` #8C857B on `card-surface` #FFFFFF (inactive nav icon)             | 3.65:1  | Below 4.5:1, but icons are UI components (3:1 threshold applies) — Pass                   |

No text/background pairing in active use fails the applicable AA threshold.

## 4. Color-only status

Checked every place status is conveyed: goal chips use selected/unselected fill
**and** an accessibility `checked` state (not color alone); warnings use the
peach `warning-peach` tone **with** copy, never a bare color swatch; errors pair
`error` red with an icon (`ErrorState`) or explicit copy, never color alone.

## 5. Privacy-by-default

- Reminders toggle (`you.tsx`) defaults to `useState(false)` — confirmed off by
  default, copy explicitly states "Off by default — you're always in control."
- `empties` stay private end-to-end: RLS owner-only (verified in
  `supabase/tests/rls_verification.sql`, Phase B5); no UI in this lane exposes
  another user's empties.
- `lib/analytics.ts` `track()` throws if a caller passes `review_text` — raw
  review text can never reach `analytics_events`.

## 6. Fixes made this phase

- `app/(tabs)/you.tsx`: removed a hardcoded `thumbColor="#FFFFFF"` on the
  reminders `Switch`, now sourced from `theme/tokens.ts` (`colors['card-surface']`).
- `app/(tabs)/you.tsx` + `you.strings.ts`: the "Total finished" caption was
  labeling `profile.longest_streak` (a streak length, not a count of finished
  products) — relabeled to "Longest streak" for accurate, non-misleading copy.
- `app/(tabs)/you.tsx`: `handleSignOut` / `handleDeleteAccount` had no error
  handling — a thrown Supabase error was an unhandled promise rejection with no
  user-facing feedback. Added inline calm error text for both paths.
- `app/(auth)/goal-capture.tsx`: `handleContinue` had no `catch` around
  `updateProfile` — same unhandled-promise gap. Added inline error text, plus
  wired the previously-unused `errorGoals`/`errorName` strings in as inline
  hints (also removing a hardcoded JSX string literal that duplicated
  `errorGoals`, per AI-CONTEXT §5's strings-file convention).
- `components/ui/Chip.tsx`: added `min-h-[44px]` so goal/age chips meet the
  touch-target baseline regardless of label length.

## 7. Known gap — not fixable in this lane

`.maestro/catalog-search.yaml` cannot pass end-to-end yet: it navigates to a
screen embedding `components/ui/ProductSearch.tsx`, but no feature lane
(Aaron/Joon/Matt/Talbia) has started building yet (`features/` doesn't exist in
the repo as of this phase) — confirmed this is because "Phase 0 DONE" hasn't
been announced to the team yet, per `SESSION-HANDOFF.md`. The flow's own header
comment already documents this as an expected failure, not a bug. Re-run once a
feature screen wires `ProductSearch` in and announce to that owner if the
selector text changes.
