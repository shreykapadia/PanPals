# PanPals

A mobile app that helps people finish the cosmetics they own before buying more.

**Core loop:** Log a product (catalog search or manual) → prioritize (Focus Pot,
max 5) → track depletion (progress rings) → intercept impulse buys (soft alert,
14-day cooling-off wishlist) → finish → private "empty" archive and repurchase
verdict.

Full spec: [`docs/PRD.md`](docs/PRD.md). Primary user persona: **Maya, the
Low-Tech Migrator** — [`docs/PERSONAS.md`](docs/PERSONAS.md).

---

## Start here: read this first

Before touching any code, read **[`AI-CONTEXT.md`](AI-CONTEXT.md)** in full. It
is the single source of truth for this repo — scope, stack, the file-ownership
matrix, data model summary, conventions, and Definition of Done. If you use an
AI coding agent (Claude Code, Antigravity/Gemini, Codex), it auto-loads
`CLAUDE.md` / `AGENTS.md` / `GEMINI.md`, which all point straight back at
`AI-CONTEXT.md`. Everything below is a quick-start layer on top of it — when
in doubt, `AI-CONTEXT.md` wins.

## Who owns what

This is a 5-person team building in parallel without stepping on each other's
files. **Never edit a path outside your lane** — see the full matrix in
[`AI-CONTEXT.md` §3](AI-CONTEXT.md#3-file-ownership--do-not-cross-lanes).

| Owner      | Lane                                                                                                                                                    |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Shrey**  | Platform + entire backend: scaffold, auth, navigation, Supabase, `lib/*`, `theme/*`, `mocks/*`, `components/ui/*`, `docs/*`. Reviews & merges every PR. |
| **Aaron**  | Home dashboard, Focus Pot, progress rings, streak display                                                                                               |
| **Joon**   | Wishlist, impulse intercept, 14-day cooling-off, purchase→inventory conversion                                                                          |
| **Matt**   | Inventory entry (fast-log), browse/filter/edit, usage logging                                                                                           |
| **Talbia** | Finish/celebration flow, repurchase review, private empties archive, Progress tab                                                                       |

If a task needs a change outside your lane, **don't make it** — stop and post a
`CROSS-LANE REQUEST` (see [`AI-CONTEXT.md` §3](AI-CONTEXT.md)) for Shrey to route.

**The mock-first bridge:** the four feature owners never call Supabase
directly. All data comes from the `lib/api/*` hooks (`useProducts`,
`useWishlist`, `useDashboard`, `useEmpties`, `useCatalogSearch`), which already
serve realistic fixtures typed by `mocks/types.ts` — build your screen against
those now, the swap to real data happens underneath you with no signature
changes.

## Prerequisites

- **Node 20 LTS** (`node -v` → v20.x)
- **Expo tooling**: Xcode (iOS Simulator) and/or Android Studio, or the
  **Expo Go** app on your phone for the fastest preview
- **Maestro** (E2E, only needed if you're running/writing `.maestro/` flows):
  `curl -Ls "https://get.maestro.mobile.dev" | bash`
- **Supabase CLI + Docker** — only required if you're touching `supabase/*`
  (Shrey's lane). Everyone else just needs the two env vars below.

## Setup

```bash
git clone https://github.com/shreykapadia/PanPals.git
cd PanPals
npm install
```

Use `npm` (not `yarn`/`pnpm`) — the repo commits `package-lock.json`, so
`npm install` resolves everyone to the exact same dependency versions. If
something looks off after installing (a native module warning, a version
mismatch after pulling someone else's PR), run:

```bash
npx expo-doctor
```

It flags dependencies that drifted out of sync with the installed Expo SDK.

Copy `.env.example` to `.env` and fill in the two public values (ask Shrey for
the project URL/anon key — the anon key is safe to share, RLS protects the
data):

```bash
cp .env.example .env
```

```
EXPO_PUBLIC_SUPABASE_URL=<project-url>
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

Never request or commit the service-role key — it isn't needed by the app and
never enters `.env` or the repo.

Run the app:

```bash
npx expo start
```

Then press `i` (iOS simulator), `a` (Android emulator), or scan the QR code
with Expo Go.

## Everyday scripts

| Command                | Does                                                                           |
| ---------------------- | ------------------------------------------------------------------------------ |
| `npm run typecheck`    | `tsc --noEmit`                                                                 |
| `npm run lint`         | `eslint . --max-warnings 0`                                                    |
| `npm run format:check` | `prettier --check .`                                                           |
| `npm test`             | Jest + React Native Testing Library                                            |
| `npm run verify`       | All four of the above, in order — **must pass before every PR, no exceptions** |

There is no CI. `npm run verify` passing locally is the only gate — see
[`docs/TESTING.md`](docs/TESTING.md) for the full test strategy (unit tests,
Maestro E2E flows, RLS security tests).

## Making a change

1. **Branch from `main`**, one module per branch:
   ```bash
   git checkout main && git pull
   git checkout -b feat/<you>/<module>-<slug>
   ```
2. Build inside your lane only. Commit every ~30 minutes.
3. `npm run verify` locally before opening a PR.
4. Open a PR (≤ ~400 changed lines) using the template — it'll prompt for the
   PRD function touched, verify checklist, and a lane-diff check.
5. Shrey reviews and squash-merges at the **12pm / 9pm** daily windows.

Full branching conventions, PR size limits, and the 4-gate review pipeline are
in [`docs/WORKFLOW.md`](docs/WORKFLOW.md).

## Design system

Styling comes exclusively from **NativeWind** classes mapped to
[`docs/DESIGN-TOKENS.md`](docs/DESIGN-TOKENS.md) — never hardcode a hex color,
font, or radius in a component. Design ground truth (when a mockup and the
tokens doc disagree, the tokens doc wins): `docs/mockups/*.png`.

## Docs map

| Doc                                                        | What's in it                                                       |
| ---------------------------------------------------------- | ------------------------------------------------------------------ |
| [`AI-CONTEXT.md`](AI-CONTEXT.md)                           | The shared contract — read this first, always wins on conflicts    |
| [`docs/PRD.md`](docs/PRD.md)                               | Full product spec, F1–F9 feature matrix                            |
| [`docs/DATA-MODEL.md`](docs/DATA-MODEL.md)                 | Tables, RPCs, event dictionary                                     |
| [`docs/DESIGN-TOKENS.md`](docs/DESIGN-TOKENS.md)           | Colors, type scale, spacing, component specs                       |
| [`docs/PERSONAS.md`](docs/PERSONAS.md)                     | Primary user persona (Maya)                                        |
| [`docs/WORKFLOW.md`](docs/WORKFLOW.md)                     | Branching, PR size limits, the 4-gate review pipeline              |
| [`docs/TESTING.md`](docs/TESTING.md)                       | Unit test strategy, Maestro flows, RLS security tests              |
| [`docs/A11Y-CHECKLIST.md`](docs/A11Y-CHECKLIST.md)         | Accessibility + privacy-by-default audit (contrast, touch targets) |
| [`docs/CATALOG-PROVENANCE.md`](docs/CATALOG-PROVENANCE.md) | Where the seeded catalog data comes from and its license           |
| [`docs/DECISIONS.md`](docs/DECISIONS.md)                   | Decision log (D1, D2, ... ) — why things changed over time         |
| [`docs/plans/`](docs/plans/)                               | Per-person implementation plans with copy-pasteable agent prompts  |

## Not building (yet)

Scanning/AI product identification, barcode lookup, payments, affiliate links,
hard purchase locks, budget tracking, push notifications, and — deferred as of
the 7/21 team sync — the Community Empties feed, likes, follows/comments,
badges, points, or any reward economy. Finishing a product creates a **private**
archive entry, not a public post. See `AI-CONTEXT.md` for the full list and
`docs/DECISIONS.md` for why.
