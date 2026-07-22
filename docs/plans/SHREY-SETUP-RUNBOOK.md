# Shrey's Setup Runbook — GitHub, Supabase & AI Tools (Phase 0 groundwork)

Everything you (Shrey) do **once**, before the team starts, so the shared repo,
the backend, and **both** your AI tools (Claude Code + Gemini in Antigravity) are
wired up. Do the parts in order — later parts depend on earlier ones. Budget
~60–90 minutes.

This is the "accounts + wiring" layer. The actual **building** (scaffold, schema,
RPCs) lives in `SHREY-PLAN.md` — this runbook gets you to the point where you can
start Phase 0 there.

**Quick map of what you'll set up:**
1. GitHub repo (public) + branch protection + invite the four
2. Supabase project + keys
3. Access tokens for the MCP servers
4. MCP servers in **Claude Code** (Supabase + GitHub)
5. MCP servers in **Antigravity** (Supabase + GitHub)
6. Security guardrails + final verification

> Exact menu labels and command flags in these tools shift version to version. If
> a step looks slightly different on your screen, the linked official docs at the
> bottom are the source of truth — the concepts here won't change.

---

## Part 1 — GitHub repository

### 1.1 Create the repo
1. Go to **github.com/new**.
2. Name it `panpals` (or `panpals-app`). Description optional.
3. Set visibility to **Public**. *Why: required-review branch protection is free
   on public repos (paid on private), and the repo doubles as your design-fair
   process exhibit. No app secrets live in the repo — those go in `.env`, which is
   ignored.*
4. **Do not** add a README/.gitignore/license from GitHub — our starter kit
   already has them. Click **Create repository**.

### 1.2 Push the starter kit into it
The `panpals-starter-kit` folder on your machine is the code — put it on GitHub.

**Easiest — GitHub Desktop:** File → **Add local repository** → choose the
`panpals-starter-kit` folder → **Publish repository** (uncheck "keep private" so
it's public) → pick the repo you just made.

**Or command line** (run inside the folder):
```bash
cd panpals-starter-kit
git init
git add -A
git commit -m "PanPals starter kit"
git branch -M main
git remote add origin https://github.com/<your-username>/panpals.git
git push -u origin main
```

**Before your first push, confirm secrets are ignored.** Open `.gitignore` and
make sure it contains `.env`. It must **never** contain your keys — only
`.env.example` (the blank template) belongs in the repo.

### 1.3 Fill in the real GitHub usernames
Open `.github/CODEOWNERS` and replace the placeholders
(`@shrey-github-handle`, `@talbia-github-handle`, etc.) with everyone's real
GitHub usernames. Commit and push. This is what auto-assigns you as reviewer on
every PR and enforces the lanes.

### 1.4 Invite the four teammates
Repo → **Settings → Collaborators and teams → Add people**. Add Joon, Talbia,
Aaron, and Matt by GitHub username, role **Write**. They'll get an email invite.

### 1.5 Protect the `main` branch
Repo → **Settings → Branches → Add branch ruleset** (or "Add rule") targeting
`main`. Turn on:
- ✅ **Require a pull request before merging** → require **1** approval.
- ✅ **Require review from Code Owners** (uses your CODEOWNERS file).
- ✅ **Require branches to be up to date before merging.**
- ✅ **Block force pushes.**
- ✅ **Restrict deletions** (don't allow deleting `main`).
- ❌ Leave "require status checks" **off** — we have no CI by design (DECISIONS D9);
  verification is local `npm run verify` + your review.

Then repo → **Settings → General → Pull Requests**:
- Allow **Squash merging** only (uncheck merge commits + rebase).
- ✅ **Automatically delete head branches** after merge.

> **Phase 0 exception:** your first push and the initial scaffold/schema PRs seed
> `main`. If the "require PR" rule blocks you before anyone can review, either
> temporarily allow yourself to bypass, or have a teammate approve. Re-tighten
> once the repo is seeded.

### 1.6 Verify Part 1
Try to push a change directly to `main` — it should be **rejected**. Confirm all
four invitations show as accepted under Collaborators.

---

## Part 2 — Supabase project

### 2.1 Create the project
1. Go to **supabase.com** → **New project**. Pick your org, name it `PanPals`,
   set a strong **database password** (save it in your password manager), choose
   the region closest to the team. Wait ~2 min for it to provision.

### 2.2 Collect the keys
Project → **Settings → API**, copy:
- **Project URL** (e.g. `https://abcd1234.supabase.co`)
- **anon public** key (safe for the app/client)
- **service_role** key (secret — server/admin only, never ships in the app)
- **Project ref / Project ID** (the `abcd1234` part — you'll need this for MCP)

### 2.3 Put them in `.env` (never in the repo)
Copy `.env.example` to `.env` and fill in the values:
```bash
cp .env.example .env
```
```
EXPO_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>   # local tooling only
```
Confirm `.env` is listed in `.gitignore` (Part 1.2). The app reads only the
`EXPO_PUBLIC_*` values through `lib/supabase.ts`.

### 2.4 Link the Supabase CLI (for the real build)
```bash
supabase login
supabase link --project-ref <project-ref>
supabase start          # local Postgres in Docker, for building migrations
```
From here, the schema/RLS/RPC work happens as **versioned migrations** in
`supabase/migrations/` — see `SHREY-PLAN.md` Phases B1–B6. Don't hand-edit tables
in the dashboard; everything goes through migration files so it's reviewable and
repeatable.

---

## Part 3 — Tokens for the MCP servers

"MCP" is the bridge that lets your AI tools *directly* read your Supabase database
and manage GitHub (list PRs, open branches, etc.) instead of you copy-pasting. You
need two tokens.

### 3.1 Supabase Personal Access Token (PAT)
Supabase → **Account → Access Tokens → Generate new token**. Name it
`PanPals MCP`. Copy it now (you can't see it again). *This is different from the
anon/service keys — it's what the MCP server authenticates with.*

### 3.2 GitHub access
Two options — pick one:
- **Recommended: OAuth via the remote GitHub MCP server** (no token to manage —
  you approve access in the browser when you first connect). Use this unless you
  have a reason not to.
- **Or a token:** GitHub → **Settings → Developer settings → Personal access
  tokens → Fine-grained tokens → Generate**. Restrict **Repository access** to
  just `panpals`. Permissions: **Contents: Read and write**, **Pull requests:
  Read and write**, **Issues: Read and write**, **Metadata: Read**. Copy it.

### 3.3 Store tokens as environment variables (so config files stay secret-free)
On macOS/Linux, add to `~/.zshrc` (or `~/.bashrc`):
```bash
export SUPABASE_ACCESS_TOKEN="sbp_...your-supabase-pat..."
export GITHUB_PAT="github_pat_...your-github-token..."   # only if you chose the token route
```
Then reload: `source ~/.zshrc`. Now your MCP configs can reference `$SUPABASE_ACCESS_TOKEN`
instead of containing the raw secret.

---

## Part 4 — Wire MCP into **Claude Code**

Run these in a terminal (any folder for user scope, or inside the repo for local scope).

### 4.1 Supabase MCP (read-only, scoped to this project)
```bash
claude mcp add supabase \
  -e SUPABASE_ACCESS_TOKEN=$SUPABASE_ACCESS_TOKEN \
  -- npx -y @supabase/mcp-server-supabase@latest --project-ref=<project-ref> --read-only
```
- `--project-ref` limits the server to the PanPals project only (not your whole account).
- `--read-only` means the agent can **inspect schema and run read queries but cannot
  silently change your database.** Keep it this way — all schema changes go through
  your reviewed migration files, not ad-hoc agent writes. This protects the shared
  contract everyone builds against.

### 4.2 GitHub MCP (remote, OAuth)
```bash
claude mcp add --transport http github https://api.githubcopilot.com/mcp/
```
Then start Claude Code and run `/mcp` → select **github** → **Authenticate**, and
approve in the browser. *(Prefer a token instead? Add
`--header "Authorization: Bearer $GITHUB_PAT"` to the command above and skip the
OAuth step.)*

### 4.3 Verify Claude Code
```bash
claude mcp list        # both 'supabase' and 'github' should show ✓ connected
```
Then in a Claude Code chat, ask: *"Using the Supabase MCP, list my tables"* and
*"Using the GitHub MCP, list open pull requests on panpals."* Both should return
real data.

> **Sharing GitHub MCP with the team (optional):** you can commit a `.mcp.json` at
> the repo root that defines the GitHub server using `${GITHUB_PAT}` (Claude Code
> expands `${VAR}` from each person's shell, so no secret is committed). The four
> mostly won't need Supabase MCP — they build against the mock hooks — so keep the
> Supabase server personal to you.

---

## Part 5 — Wire MCP into **Antigravity** (Gemini)

### 5.1 Open the raw MCP config
In Antigravity: the **"..."** menu at the top of the agent side panel → **MCP
Servers** → **Manage MCP Servers** → **View raw config**. This opens
`mcp_config.json` (global path `~/.gemini/config/mcp_config.json`, or per-workspace
`.agents/mcp_config.json`).

### 5.2 Add both servers
Paste this, filling in your project ref and token(s). *(Note: Antigravity uses
`serverUrl` for remote servers, and `command`/`args`/`env` for local ones.)*
```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y", "@supabase/mcp-server-supabase@latest",
        "--project-ref=<project-ref>",
        "--read-only"
      ],
      "env": { "SUPABASE_ACCESS_TOKEN": "<your-supabase-pat>" }
    },
    "github": {
      "serverUrl": "https://api.githubcopilot.com/mcp/",
      "headers": { "Authorization": "Bearer <your-github-pat>" }
    }
  }
}
```
Save the file, then back in the MCP store toggle the two servers **on** / hit
refresh.

> This file lives in your **home folder, not the repo**, so the tokens here don't
> get pushed to GitHub — but still treat it as a secret file. If you'd rather not
> paste the GitHub token, some Antigravity versions support the same one-click
> OAuth as Claude Code for the remote GitHub server — use that if offered.

### 5.3 Verify Antigravity
In an Antigravity chat with Gemini, ask the same two checks: *"list my Supabase
tables"* and *"list open PRs on panpals."* Both tools now manage the same repo and
database.

---

## Part 6 — Security & guardrails (read once)

- **Never commit secrets.** `.env` is git-ignored; the MCP config files live
  outside the repo. Only `.env.example` (blank) is committed.
- **Keep the Supabase MCP `--read-only`.** Real schema changes flow through
  versioned migrations + PR (SHREY-PLAN B1–B6), never ad-hoc agent writes. This is
  what keeps `types/database.ts` and the team's data contract trustworthy.
- **Scope tokens tightly.** Supabase PAT is limited to the linked project; the
  GitHub fine-grained token (if you used one) is limited to the `panpals` repo;
  prefer OAuth so there's no stored GitHub token at all.
- **Rotate if leaked.** Revoke at Supabase → Account → Access Tokens, or GitHub →
  Developer settings. Then regenerate and update your env vars.
- **The lane rules still apply.** Even though the agents can now touch the live DB
  and GitHub, they still only edit files in the current lane, and you still review
  and merge every PR. MCP power doesn't override the file-ownership matrix.

---

## Final checklist

- [ ] Public `panpals` repo created and starter kit pushed
- [ ] `.env` confirmed git-ignored; real keys only in `.env`
- [ ] CODEOWNERS handles filled in
- [ ] Four teammates invited (Write) and accepted
- [ ] `main` protected (PR + Code Owner review, no force push, squash-only, auto-delete branches)
- [ ] Direct push to `main` is rejected (tested)
- [ ] Supabase project created; URL/anon/service keys + project-ref saved
- [ ] Supabase CLI linked; `supabase start` runs locally
- [ ] Supabase PAT + GitHub access created; tokens exported as env vars
- [ ] Claude Code: `supabase` + `github` MCP connected and verified
- [ ] Antigravity: `supabase` + `github` MCP connected and verified

Once every box is ticked, you're ready to start **SHREY-PLAN.md Phase 0**.

---

## Reference links (if a step looks different on your screen)
- Supabase MCP: https://supabase.com/docs/guides/ai-tools/mcp
- GitHub MCP server: https://docs.github.com/en/copilot/how-tos/provide-context/use-mcp-in-your-ide/set-up-the-github-mcp-server
- Claude Code MCP: https://code.claude.com/docs/en/mcp
- Antigravity MCP: https://antigravity.google/docs/mcp
