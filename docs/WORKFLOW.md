# WORKFLOW.md — Git & AI Session Rules

No CI for this prototype (team decision, Jul 14 — see DECISIONS.md D9).
Verification is local and mandatory; Shrey re-verifies at review.

> **7/21 note (D14 + D20):** Supabase is provisioned now and **Shrey owns all
> backend work**, so Shrey's `schema/*` branches are active from day 1. The
> "schema PRs merge first each day" rule below is in force every day — the four
> feature owners rebase on `main` after each schema merge and re-import from the
> regenerated `types/database.ts`.

## Branching: trunk-based, short-lived branches

| Branch  | Pattern                                                                     | Created by           | Merges into   | Max lifespan |
| ------- | --------------------------------------------------------------------------- | -------------------- | ------------- | ------------ |
| `main`  | protected, always demoable                                                  | —                    | —             | permanent    |
| Feature | `feat/<owner>/<module>-<slug>` (e.g. `feat/joon/wishlist-intercept-banner`) | module owner         | `main` via PR | **2 days**   |
| Schema  | `schema/<slug>`                                                             | **Shrey only (D20)** | `main` via PR | 1 day        |
| Fix     | `fix/<owner>/<slug>`                                                        | anyone               | `main` via PR | 1 day        |
| Docs    | `docs/<slug>`                                                               | anyone               | `main` via PR | 1 day        |

A branch that can't merge in 2 days is a scope problem — shrink the task.

## Repo settings (Shrey, day 1)

1. **Make the repo public** — required-review branch protection is free on
   public repos (paid on private), and the repo doubles as the design-fair
   process exhibit.
2. Protect `main`: no direct pushes, PR required, 1 required review
   (CODEOWNERS auto-assigns Shrey), branch must be up to date before merge.
3. **Squash-merge only** — one commit = one PR = one module change.
4. PR size cap: **~400 changed lines**. Bigger → split it.
5. **Merge order rule:** schema PRs merge first each day; Shrey regenerates
   `types/database.ts` in the same PR; all open feature branches rebase on
   main before their next push.
6. Merge windows: Shrey reviews/merges **12pm and 9pm daily** — plan around
   them instead of pinging.

## PR review pipeline (4 gates)

| Gate              | What                                                                                                                                                                                               | Who/where                                                 | Pass condition                        |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------- |
| 1. Static + tests | `npm run verify` (tsc --noEmit, eslint, prettier --check, jest)                                                                                                                                    | Author, locally, before opening PR — checkbox in template | zero errors                           |
| 2. Re-verify      | Shrey pulls the branch, runs `npm run verify` + the module's Maestro flow                                                                                                                          | Shrey's machine                                           | green                                 |
| 3. AI review      | Claude Code `/review` for logic; Antigravity prompt: "verify this PR only touches paths owned by <author> per AI-CONTEXT.md §3; list any changes to shared contracts, theme, navigation, or types" | Shrey's machine                                           | no lane violations, no contract drift |
| 4. Human          | Read the diff against the PRD function named in the PR description                                                                                                                                 | Shrey                                                     | matches spec, demoable                |

## AI session hygiene (every dev, every session)

1. Start every session:
   `git checkout main && git pull && git checkout -b feat/<you>/<module>-<slug>`
   Never resume an agent on a stale branch.
2. One module, one branch, one PR. Never let an agent "also fix" another
   module — file an issue instead.
3. Commit every ~30 minutes of agent work — small commits are your undo button.
4. Agents never: `git push --force`, merge, touch `main`, edit
   `supabase/migrations/` (Shrey only), or edit shared contract files
   (`AI-CONTEXT.md`, `docs/*`, `theme/*`, `lib/*`, `mocks/*`) without a
   Shrey-flagged PR.
5. Agent wants a file outside your lane? **Stop.** Post the CROSS-LANE
   REQUEST in the team channel for Shrey to route.
6. End of session: push the branch even if unfinished — unpushed work on a
   laptop is a bus-factor risk.
