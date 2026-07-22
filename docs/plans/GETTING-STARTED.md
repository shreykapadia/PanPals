# PanPals — Getting Started (Plain-English Setup Guide)

**Who this is for:** Joon, Talbia, Aaron, and Matt — the teammates building PanPals.
No coding experience needed. This walks you through everything from a blank
laptop to seeing the app running on your phone.

**The single most important thing to understand:** you are not going to write
code by hand. You'll talk to an **AI assistant** in plain English, it does the
typing, and your job is to (1) paste the steps from your plan, (2) look at the
app, and (3) tell the AI what to fix. That's it. If you can describe what you
want in words and click around an app, you can do this.

Take it slow, do it once, and it stops feeling scary. Shrey set all of this up
and is happy to hop on a call if you get stuck — you will not break anything
that can't be undone.

---

## 1. How our team works (the big picture)

We're five people building one app at the same time. To avoid stepping on each
other, three ideas do all the heavy lifting:

**GitHub is a shared folder for our code.** Think Google Drive, but for the app.
It lives online. Everyone's work eventually ends up there so we all have the
same version.

**Everyone owns a different "lane."** You're each responsible for one part of the
app, and you only ever change *your* files. Because no two people touch the same
file, our work never collides. Your plan tells you exactly which files are yours.

**The AI does the coding; you steer.** You open the project in an AI coding tool,
paste a step from your plan, and the AI writes the code. You then run the app,
look at it, and say things like "the button is too small, make it bigger." You go
back and forth until it looks right.

There's one rule that matters more than any other: **only change files in your
own lane.** If the AI ever tries to edit someone else's files, stop it (your plan
explains exactly how). This one habit is what lets five people build in parallel
without a mess.

---

## 2. What to install (one time, ~30–45 minutes)

Do these in order. If any step asks a question you don't understand, just accept
the defaults (keep clicking "Next" / "Continue" / "Install").

### a) A GitHub account
- Go to **github.com** and sign up (free). Pick a username you don't mind
  teammates seeing.
- Send your username to Shrey so he can add you to the project.
- When Shrey adds you, you'll get an email invite — click **Accept**.

### b) The AI coding tool
This is where you'll actually work. **Ask Shrey which one the team is using** —
it will be one of these, and this guide works the same in all of them because
they all read our shared rulebook automatically:
- **Antigravity** (by Google) — a full app with a built-in chat panel. Good, free starting point.
- **Claude Code** — runs inside a code editor or a terminal window.
- **Codex** — similar, chat-driven.

Install the one Shrey names, then sign in with the account he tells you (we may
be sharing a paid plan — check the team chat).

### c) Node.js — "the engine that runs the app"
- Go to **nodejs.org**.
- Click the big button that says **"LTS"** (LTS = the stable version). Do **not**
  pick the "Current" one.
- Open the downloaded file and install it with all the default options.
- You don't need to understand what it does — the app simply won't run without it.

### d) GitHub Desktop — "the friendly way to sync your work" (recommended)
- Go to **desktop.github.com**, download, install, and sign in with your GitHub account.
- This gives you buttons for saving and sharing your work instead of typing
  commands. (Git, the tool underneath, comes bundled with it — nothing extra to install.)
- If your team prefers to let the AI handle syncing instead, that's fine too —
  see Section 8.

### e) The "Expo Go" app on your phone — "the window to see the app"
- On your phone, install **Expo Go** from the App Store (iPhone) or Play Store (Android).
- This is how you'll preview PanPals live while you build it. (You can also
  preview it in a web browser — Section 6 — so this is optional but nice to have.)

That's everything. You will **not** manually install app packages like React
Native or Supabase — the AI does that for you in Section 6.

---

## 3. Get the project onto your computer

"The project" is the shared folder from Section 1. Copying it to your laptop is
called **cloning** (just a fancy word for "download a synced copy").

**Easiest way — GitHub Desktop:**
1. Open GitHub Desktop.
2. **File → Clone repository.**
3. Pick **PanPals** from the list (it appears once Shrey has added you).
4. Choose where to save it (Desktop or Documents is fine) and click **Clone**.

**Or, let your AI tool do it:** open your AI tool and tell it, in plain English:
> "Clone our GitHub project called PanPals to my computer and open it."
It will ask permission to connect to GitHub the first time — say yes.

You now have a folder called `panpals-starter-kit` on your laptop. Open that
folder in your AI coding tool (usually **File → Open Folder**).

---

## 4. What are all these `.md` files? (and what to do with them)

When you open the folder you'll see a lot of files ending in `.md`. Don't panic —
**you don't have to read or edit most of them.** `.md` just means "a text
document." Here's what they are and who they're for:

**The one file you live in:**
- **`docs/plans/YOUR-NAME-PLAN.md`** (e.g. `JOON-PLAN.md`). This is *your* step-by-step
  plan. It's the only file you'll actively follow. It contains ready-made
  instructions you copy and paste to the AI, in order.

**Files the AI reads automatically (you don't do anything with them):**
- **`AI-CONTEXT.md`** — the team rulebook: what we're building, the design rules,
  and the all-important list of who owns which files. Your AI tool reads this on
  its own before it writes anything. You don't need to open it, but it's why the
  AI already "knows" our project.
- **`CLAUDE.md` / `AGENTS.md`** — tiny reminder files that point the AI at the
  rulebook. Ignore them.

**Reference material (open only if you're curious or your plan points you there):**
- `docs/PRD.md` — the full feature list.
- `docs/DESIGN-TOKENS.md` — the exact colors, fonts, and shapes for the app's look.
- `docs/DATA-MODEL.md` — the list of information the app stores (Shrey's area).
- `docs/mockups/*.png` — picture references of what screens should look like.
- `docs/WORKFLOW.md`, `docs/TESTING.md`, `docs/DECISIONS.md` — the house rules,
  how we check our work, and a log of decisions.
- `docs/plans/README.md` — the one-page team overview.

**So, practically:** open **your plan**, and let the AI handle the rest. The other
files exist so that when the AI writes your code, it automatically matches
everyone else's style, colors, and structure.

**Do not edit files that aren't in your lane** (your plan lists your files
clearly). If you think you need to, that's a signal to stop and ask Shrey — your
plan shows you how to file a quick "cross-lane request."

---

## 5. Starting a work session

Every time you sit down to work, follow this same short routine. Your plan spells
it out too, but here it is in plain terms.

**Step 1 — Get the latest version.** Before starting anything, grab everyone's
latest changes so you're not building on an old copy.
- In GitHub Desktop: make sure the top says the **main** branch, then click
  **Fetch / Pull origin**.
- Or tell the AI: *"Switch to the main branch and pull the latest changes."*

**Step 2 — Make your own copy to work in (a "branch").** You never build directly
on the shared version. You make your own copy, called a **branch**, so your
half-finished work can't disturb anyone. Your plan gives you the exact name to
use (something like `feat/joon/wishlist-add-item`).
- Easiest: paste the first step from your plan — it usually tells the AI to
  create the branch for you.
- Or tell the AI: *"Create a new branch called `feat/joon/wishlist-add-item` and switch to it."*

**Step 3 — Paste the first step from your plan.** Your plan is a series of ready
prompts. Copy the first one, paste it into the AI's chat, and send it. The AI
will start writing files. Let it finish.

**Step 4 — Check its work** (next section), then move to the next step in your plan.

Work through your plan one step at a time. Don't paste three steps at once —
finish and check each before the next.

---

## 6. Running the app to see what you built

After the AI writes some code, you'll want to actually see it. The first time,
you also need to install the app's building blocks (this happens once per
project, and the AI does it for you).

**First time only — install the building blocks.** In the AI chat, type:
> "Install the project's packages (run `npm install`), then start the app."

("Packages" are the pre-made pieces the app is built from — things like the
screen framework and the styling tools. `npm install` downloads them all
automatically. You don't choose them; they're already listed in the project.)

**Start the app.** The AI will run `npx expo start`. You'll see a block of text
and a **QR code** appear. To view the app:
- **On your phone:** open **Expo Go** (Android) or your **Camera** (iPhone) and
  scan the QR code. PanPals opens on your phone.
- **In a web browser:** press the **`w`** key in the window where it's running,
  and it opens as a website. (Great for quick checks.)

**Play with it like a normal user.** Tap buttons, open screens, type things.
You're looking for two things: does it do what your plan's step said, and does it
look right?

If nothing shows up or you see a red error screen, don't worry — copy the error
text, paste it to the AI, and say *"I got this error, please fix it."* That's a
normal part of the process.

---

## 7. Giving feedback and fixing things

This back-and-forth is the actual job, and it's all plain English:
- **Something looks off?** Take a screenshot, drag it into the AI chat, and say
  what's wrong: *"The 'Add to Wishlist' button is too small and the wrong color —
  make it the big pink pill button like the rest of the app."*
- **Something doesn't work?** Describe it: *"When I tap Save, nothing happens."*
- **Want it to match the design?** Say: *"Compare this to `docs/mockups/wishlist-intercept.png`
  and make it match."*

The AI changes the code; you refresh the app (it usually updates on its own) and
look again. Repeat until you're happy. There's no limit to how many times you can
ask — that's expected.

---

## 8. Saving and sharing your finished work

When a step is done and looks right, you "save" it and eventually send it to
Shrey to fold into the shared version. Three plain-English actions:

**Save your progress often ("commit").** A commit is a saved checkpoint — your
undo button. Do it every 20–30 minutes.
- GitHub Desktop: type a short note in the box (e.g. "add wishlist item form")
  and click **Commit to `feat/...`**.
- Or ask the AI: *"Commit my changes with the message 'add wishlist item form'."*

**Send it up to GitHub ("push").** This uploads your branch so it's backed up and
Shrey can see it.
- GitHub Desktop: click **Push origin**.
- Or ask the AI: *"Push my branch."*
- **Always push before you stop for the day**, even if you're not finished —
  work sitting only on your laptop can be lost.

**Ask Shrey to merge it in ("Pull Request," or PR).** When a feature is complete,
you open a Pull Request — a polite request that says "my work is ready, please add
it to the shared version." Shrey reviews it and merges it.
- GitHub Desktop shows a **"Create Pull Request"** button after you push — click it,
  fill in the short template (what you built + confirm you checked it), and submit.
- Then message Shrey in the team chat so he knows to review it.

**One quality check before every PR.** Your plan asks you to run one command first:
> "Run `npm run verify` and fix anything it complains about."
This automatically checks your code for basic mistakes. If it comes back clean,
you're good to open the PR. If not, paste what it says to the AI and let it fix it.
We don't have an automatic checker, so this step is how we keep the app working
for everyone.

---

## 9. The five rules that keep us out of trouble

1. **Only edit files in your lane.** (Your plan lists them.) If the AI wants to
   touch someone else's file, stop and file a "cross-lane request" — your plan
   shows the exact wording. This is the #1 way we avoid conflicts.
2. **Never work directly on `main`.** Always make your own branch first (Section 5).
3. **Get the latest before you start** each session, and after Shrey merges
   anything (he'll say in chat) — pull again so you stay in sync.
4. **Run `npm run verify` before every Pull Request.**
5. **Push your branch before you stop for the day.**

Follow these and it's very hard to cause a real problem.

---

## 10. When you get stuck (this is normal)

- **A red error screen or a scary message in the chat.** Copy the whole message,
  paste it to the AI, and say "please fix this and explain simply." 90% of the
  time it just fixes it.
- **The app won't start.** Ask the AI: *"The app won't start — check what's wrong
  and fix it."* Common cause the first time: packages didn't install — tell it to
  run `npm install` again.
- **The AI wants to change a file that isn't yours.** Don't let it. Tell it:
  *"That file isn't in my lane. Instead, write me a CROSS-LANE REQUEST."* Then post
  that in the team chat for Shrey.
- **You're just lost.** Message the team chat. Shrey (or whoever's around) can hop
  on a call — the first setup is the only genuinely confusing part, and it's much
  easier once someone shows you once.

---

## 11. Plain-English glossary

- **Repo (repository):** the project folder that lives on GitHub. Our shared code home.
- **Clone:** download a synced copy of the repo to your laptop.
- **Branch:** your own private copy of the project to work in, so you don't disturb others.
- **`main`:** the master, always-working version everyone shares. We never edit it directly.
- **Commit:** a saved checkpoint of your work (your undo button).
- **Push:** upload your branch to GitHub so it's backed up and visible.
- **Pull / Fetch:** download the latest changes from GitHub to your laptop.
- **Pull Request (PR):** a request for Shrey to add your finished work into `main`.
- **Merge:** Shrey combining your work into the shared `main` version.
- **Package / dependency:** a pre-made piece of software the app is built from;
  `npm install` downloads them all for you.
- **IDE / coding tool:** the app you work in (Antigravity, Claude Code, or Codex).
- **Terminal:** a text window where commands run. Your AI tool usually handles this;
  when this guide shows `something in code font`, you can paste it there or just
  ask the AI to run it.
- **Expo / Expo Go:** the system that lets us preview the app instantly on your
  phone or in a browser.
- **`.md` file:** a plain text document (like these instructions).

---

## 12. Your first-day checklist

- [ ] Created a GitHub account and sent my username to Shrey
- [ ] Accepted the email invite to the PanPals project
- [ ] Installed the AI coding tool the team chose (and signed in)
- [ ] Installed Node.js (the **LTS** version)
- [ ] Installed GitHub Desktop (and signed in)
- [ ] Installed **Expo Go** on my phone
- [ ] Cloned the project and opened the folder in my AI tool
- [ ] Found and opened **my** plan (`docs/plans/<MY-NAME>-PLAN.md`)
- [ ] Created my first branch and pasted the first step
- [ ] Got the app running (scanned the QR code or pressed `w` for web)
- [ ] Made a first commit and pushed my branch

Once you've ticked these, you're fully set up — from here, it's just working
through your plan one step at a time. You've got this.
