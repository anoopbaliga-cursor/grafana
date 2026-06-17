# Cursor Demo Runbook — Grafana (101 & 201)

> **Who this is for:** a presenter who used to write code but hasn't in a while. You do
> **not** need to write any code to run this demo. You will mostly **paste text** into a
> chat box and **click buttons**. Every step tells you exactly what to type, where to
> click, and what you should see. When something can go wrong, there's an **"If it goes
> sideways"** box telling you how to recover.
>
> This demo runs on a real, very large open-source codebase (**Grafana**, ~20k files).
> That is on purpose: it shows Cursor handling a serious, production-sized project, not a
> toy app.

---

## TL;DR cheat sheet (keep this visible while presenting)

- **101 = the guided tour** (~45 min): show Cursor understanding a huge codebase and
  making a small, safe change. Audience: people new to Cursor.
- **201 = the power tools** (~50 min): many agents at once, automations, cloud agents,
  and automated code review. Audience: people who've seen the basics.
- **Login for the running Grafana app:** username `admin`, password `admin`.
- **Golden rule:** if a step looks stuck, wait ~15 seconds, then read its "If it goes
  sideways" box. The AI is not perfectly predictable — that's normal; just have a backup.
- **Pacing:** aim for ~6 topics per hour. If you're behind, skip steps marked _(optional)_.
- **Reset between sections:** start a **new chat** for each major section so the demo
  stays clean and fast.

---

## Plain-language glossary (read once before you start)

- **Agent** — the AI you chat with. It can read the code and make changes for you.
- **Agent Window** — the main Cursor screen where you talk to the agent. (There's also a
  classic "editor" view that looks like a traditional code editor; you can switch to it,
  but you won't need to.)
- **Model** — the "brain" the agent uses. You can switch brains anytime. *Thinking*
  models (e.g. Claude Opus, GPT-5.5) are best at **planning**; **Composer** is Cursor's
  own model and is fast and good at **writing code**.
- **Mode** — what the agent is allowed to do right now:
  - **Ask** — answers questions only; makes **no** changes. Safe for exploring.
  - **Plan** — writes a step-by-step plan; makes **no** changes yet.
  - **Agent** — actually makes the changes.
- **Rule** — a standing instruction the agent always follows (a *what*), e.g. "use our
  commit message style." Lives in `.cursor/rules/`.
- **Skill** — a saved, repeatable procedure you trigger by typing `/its-name` (a *how*),
  e.g. start the app. Lives in `.cursor/skills/`.
- **Hook** — an automatic background check that runs at certain moments (e.g. block a
  dangerous command, or log which rules were used). Lives in `.cursor/hooks/`.
- **Sub-agent** — a helper agent with one job and its own memory, e.g. "write the tests."
  Lives in `.cursor/agents/`.
- **Cloud agent** — an agent that runs on Cursor's servers instead of your laptop. You
  can close your laptop and it keeps working, then opens a pull request.
- **MCP** — a connector that lets the agent talk to other tools (Slack, Linear, Jira,
  Figma, etc.).
- **Bugbot** — Cursor's automated code reviewer; it comments on your pull requests.
- **Context window** — the agent's short-term memory for the current chat. When it fills
  up, start a fresh chat (quality drops as it gets full).
- **PR (pull request)** — a proposed set of code changes on GitHub that someone reviews
  before it's merged in.

> **This repo already ships a `.cursor/` folder** with example rules, skills, hooks, and
> sub-agents built for this demo. See the last section, "What's already set up in this
> repo," for the exact list and what each one does.

---

## One-time setup (do this ~30 minutes before the session)

You'll run a few commands in Cursor's built-in **terminal**, then start the Grafana app.

### A. Open a terminal inside Cursor

Top menu bar: **Terminal -> New Terminal**. A panel opens at the bottom where you can
type commands. (Paste with Cmd+V on Mac, Ctrl+V on Windows/Linux.)

### B. Install the building blocks

Paste these **one line at a time**, pressing Enter after each and waiting for it to
finish:

```bash
nvm use
```

```bash
corepack enable
```

```bash
yarn install --immutable
```

**Expected result:** the last command runs for a few minutes and ends with a line like
`Done with warnings` or `Done in ...` and no red `error:` lines. Warnings are fine.

> **If it goes sideways:**
> - `nvm: command not found` -> paste: `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash`, then close the terminal, open a new one, and start again at step B.
> - `yarn: command not found` -> re-run `corepack enable`, then try again.

### C. Start Grafana (so the UI is ready to show)

In the **chat box** on the right side of the screen, type this and press Enter:

```
/start-grafana-dev
```

(That `/` triggers a **skill** — a saved procedure that brings the app up for you.)

**Expected result:** the agent runs some commands and, after a couple of minutes, tells
you the server is running. The very first build can take ~3 minutes — be patient.

### D. Open the app

On the right sidebar, click the **Browser** tab (globe icon) and go to
`http://localhost:3000`. You should see the **Grafana login**. Log in with `admin` /
`admin`.

> **If it goes sideways:** if the page won't load, wait one more minute (first build is
> slow) and refresh. Still stuck? In the chat, paste:
> `The Grafana dev server isn't responding on localhost:3000. Please check on it and bring it back up.`

You're ready. Take a breath. Everything below is paste-and-click.

---

# PART 1 — Cursor 101 (the guided tour, ~45 min)

> Start a **new chat** before you begin (look for a "+" or "New Chat" near the top of the
> chat panel).

## Step 1 — Show that Cursor understands a giant codebase (~5 min)

1. In the chat panel, find the **mode** selector (near the bottom of the chat box) and
   choose **Ask**.
2. Paste this prompt exactly and press Enter:

```
I'm brand new to this repository. Explain what this project is and how it's structured at a high level. Use diagrams where appropriate.
```

**Say out loud:** "This is a ~5-million-line real project. Notice it answers in seconds,
because Cursor has already indexed the whole codebase."

**Expected result:** a written summary plus one or more diagrams. **No files change** —
that's what Ask mode guarantees.

> **If it goes sideways:** if the answer is very long, click **Stop**, then paste:
> `Shorten that to 5 bullet points and one diagram.`

## Step 2 — The classic autocomplete (Tab), 2 minutes _(optional)_

1. Switch to the classic editor view: top menu **File -> "Open editor"** (or the
   editor/agent toggle in the top-right).
2. Open any TypeScript file (e.g. use Cmd/Ctrl+P, type `StatPanel.tsx`, press Enter).
3. Click at the end of a line, press Enter to make a new line, and start typing a simple
   line like `const total =`. Grey "ghost text" suggestions appear — press **Tab** to
   accept.

**Say out loud:** "This is where Cursor started — smart autocomplete. But the real power
now is the agent, so let's go back to that."

4. Return to the Agent Window (top-right toggle).

> **If it goes sideways:** no ghost text? Just describe it verbally and move on — Tab
> isn't the point of this demo.

## Step 3 — Make a small change with a Plan (~12 min) — the most important habit

1. Switch the mode to **Plan**.
2. Switch the **model** to a thinking model: click the model name (top of the chat box)
   and pick **Claude Opus** or **GPT-5.5**.
3. Paste this prompt:

```
I want to add a new optional "Description" text option to the Stat panel, shown under the value. Don't write any code yet — make a plan, and ask me any questions you have.
```

**Expected result:** the agent asks you 1–2 questions and produces a **checklist plan**
(a document with steps).

4. Answer its questions in plain English, e.g. type: `Yes, make it optional and empty by default.`
5. When the plan looks reasonable, switch the **model** to **Composer** (fast coding
   model), switch the **mode** to **Agent**, and paste:

```
The plan looks good. Implement it.
```

**Say out loud:** "Plan with the smart model, then build with the fast model. If you
remember one thing today, remember that."

**Expected result:** the agent edits a few files and explains what it changed. You can
watch the changed files appear in the **Changes** tab on the right sidebar.

> **If it goes sideways:** if it starts changing unrelated files, click **Stop** and
> paste: `Only make the changes described in the plan — nothing else.`

## Step 4 — See the change live with Design Mode (~6 min)

1. Open the **Browser** tab (`http://localhost:3000`) — the app you started in setup.
2. The frontend rebuilds automatically; give it ~30 seconds after Step 3.
3. _(Optional design-mode flourish)_ In the browser toolbar inside Cursor, turn on
   **Design mode** (the cursor/select icon), click on a piece of the UI, and paste a
   small instruction such as:

```
Increase the padding above this heading slightly and make the text easier to read with proper contrast.
```

**Say out loud:** "Non-engineers can use this too — point, click, describe the change in
words."

> **If it goes sideways:** the dev server sometimes needs a nudge. In chat, paste:
> `The frontend doesn't show my change yet — please make sure the dev server picked it up.`

## Step 5 — Rules: teach Cursor your standards (~5 min)

1. In the right sidebar **Files** tab, open the folder `.cursor/rules/`. Open
   `frontend-react.mdc`.

**Say out loud:** "A **rule** is a standing instruction. Notice the top of this file: it
only applies to frontend files (`public/app/**`), so it doesn't clutter the AI's memory
when we're working on the backend."

2. Open `commit-style.mdc` and point out it says **always apply** — that's a rule that's
   true everywhere (how we write commit messages).

**Talking point:** "Rules are the *what*. Skills, which we'll see next, are the *how*."

3. _(Optional, live creation)_ In the chat box, type `/` and choose **Create rule** (or
   just paste): `Create a rule that all new React components must be function components, applied only to .tsx files.` Watch it create a new `.mdc` file.

> **If it goes sideways:** if `/` doesn't show a "Create rule" option, just narrate using
> the two existing rule files — they make the point well.

## Step 6 — Skills + Canvas: a reusable report (~6 min)

1. In the chat, paste:

```
/test-coverage-canvas public/app/plugins/panel/stat
```

**Say out loud:** "A **skill** is a saved procedure I trigger with a slash command. This
one runs our tests and draws a visual coverage report on a **Canvas** — nicer than a wall
of text."

**Expected result:** the agent runs tests for that folder and renders a visual report.

2. Point out the other shipped skills in the **Files** tab under `.cursor/skills/`
   (`start-grafana-dev`, `run-frontend-tests`, `add-panel-option`).

> **If it goes sideways:** coverage can take a minute. If it stalls, paste:
> `Just summarize current test coverage for that folder as a short list instead.`

## Step 7 — Hooks: guardrails and auditing (~4 min)

**Say out loud:** "A common question is *how do I know which rules are actually being
applied, and how do I stop the AI from doing something dangerous?* That's what **hooks**
are for."

1. In the **Files** tab, open `.cursor/hooks.json` and show the three hooks listed.
2. Explain in plain words:
   - `guard-shell.sh` — blocks dangerous commands (like `rm -rf` or a force push) before
     they run.
   - `scan-secrets.sh` — checks edited files for things that look like leaked passwords
     or keys, and logs them.
   - `audit-prompt.sh` — records which rules were attached to each request, so you have
     an audit trail.

> **If it goes sideways:** nothing to run live here — this is a "show and explain" step.

## Step 8 — Commit, open a PR, and let Bugbot review (~5 min)

1. In the right sidebar, open the **Changes** (source control) tab. You'll see the files
   changed in Step 3.
2. Click **Commit & Push** (or "Create PR"). When asked, let Cursor create a **new
   branch** and a **pull request** on GitHub.
3. Open the PR on GitHub (Cursor gives you a link). If Bugbot is enabled (see appendix),
   comment `bugbot run` on the PR.

**Say out loud:** "Now an automated reviewer checks the change — this is how teams keep
up when lots of code is generated."

**Expected result:** Bugbot posts a review comment within a minute or two.

> **If it goes sideways:** if Bugbot isn't set up yet, skip the `bugbot run` part and just
> show the PR. See the appendix to enable Bugbot before the session.

**End of 101.** Recap line: "We toured a huge codebase, planned and built a change safely,
saw our standards enforced with rules/skills/hooks, and shipped it with an automated
review."

---

# PART 2 — Cursor 201 (the power tools, ~50 min)

> Start a fresh **new chat**.

## Step 1 — Model selection, briefly (~3 min)

Show the model picker. **Say out loud:** "Two-step habit: a **thinking** model
(Opus / GPT-5.5) to make the plan, then **Composer** to write the code. Cheaper and
faster, same quality."

## Step 2 — Skills do the boring setup (~2 min)

If Grafana isn't already running, paste `/start-grafana-dev`.

**Say out loud:** "Instead of the AI re-figuring-out how to start the app every time, we
saved it as a skill. Deterministic and cheap."

## Step 3 — The "wow": many agents at once (~12 min)

1. Turn on **Multitask** mode (the toggle near the chat box that lets multiple agents run
   at once).
2. Paste this — it's a real cleanup task across this codebase:

```
Replace direct console.log / console.warn / console.error calls under public/app/plugins with our structured logger from @grafana/runtime (logInfo, logWarning, logError, or createMonitoringLogger). Split the work across the codebase and keep each change small. Use the test-writer sub-agent to add or update tests, and the docs-writer sub-agent to summarize what changed.
```

**Say out loud:** "There are dozens of these across the plugins folder. Watch Cursor spin
up **several agents working in parallel** — each with its own memory — plus specialized
**sub-agents** for tests and docs."

**Expected result:** two or more agents appear at the bottom of the screen, each working
a different area at the same time. Click between them to show independent progress.

> **If it goes sideways:** this touches many files and can run long. To keep it tight,
> narrow it: click **Stop** and paste:
> `Just do the files under public/app/plugins/panel/geomap for now.`

## Step 4 — Sub-agents have roles (~4 min)

1. In the **Files** tab, open `.cursor/agents/` and show the three sub-agents:
   `test-writer.md`, `code-reviewer.md`, `docs-writer.md`.

**Say out loud:** "A sub-agent is like hiring a specialist — give it a clear role and its
own context. The `code-reviewer` is read-only, so it reviews but never edits."

2. _(Optional)_ Run the reviewer on your current changes:

```
/code-reviewer review my current changes
```

## Step 5 — Automations: scheduled and event-driven work (~6 min)

These are set up on the Cursor website (see appendix for exact clicks). For the demo,
**show** an existing automation rather than building one live:

1. Go to `cursor.com` -> **Automations**.
2. Show two examples:
   - A **scheduled** automation (e.g. a daily accessibility/WCAG sweep over `public/app`).
   - An **event-driven** automation (e.g. "fix a bug reported in Slack" triggered by a
     Slack message).
3. Point out the success/failure history so it's not a black box.

**Say out loud:** "A **skill** is something I trigger; an **automation** runs on a
schedule or when something happens in another system."

> **If it goes sideways:** if you haven't created any automations yet, just walk through
> the **Templates** screen — it tells the story on its own.

## Step 6 — Cloud agents: close your laptop, get a PR (~8 min)

1. Show a cloud agent you started **before** the session (cloud agents take time). In
   Cursor, open the cloud agents view (the cloud icon) and show the finished run: it has
   its own machine, checked out the code, implemented a feature, and opened a **PR**.
2. To start a fresh one live, click the **cloud** icon, pick this repo, and paste a task:

```
Add a new optional "Subtitle" text option to the Stat panel, with a test, then open a pull request.
```

**Say out loud:** "This runs on Cursor's servers. I can close my laptop. When it's done it
opens a PR — and the machine is torn down afterward, which matters for security."

> **If it goes sideways:** cloud agents aren't instant. Don't wait for it live — show the
> one you prepared earlier and let the new one finish in the background.

## Step 7 — Bugbot review + the metrics dashboard (~6 min)

1. Open one of the PRs from Step 3 or Step 6 on GitHub. Comment `bugbot run`.
2. Show Bugbot's findings (it's good at catching issues in lots of generated code).
3. Go to `cursor.com/dashboard` -> **Bugbot** and show the 30-day metrics (PRs reviewed,
   issues found, fixes merged).

**Say out loud:** "When agents write a lot of code, review becomes the bottleneck. Bugbot
gives reviewers a short, prioritized list instead of thousands of lines."

> **If it goes sideways:** if Bugbot finds nothing on your PR, use the **seeded** PR (the
> presenter prep below adds an obvious issue) so there's always something to show.

## Step 8 — The CLI and self-hosted, in one line each (~3 min) _(optional)_

- **CLI:** "Prefer the terminal or another editor? `cursor` works from the command line
  with the same models and modes."
- **Self-hosted cloud agents:** "Regulated environment? The agent's machine can run inside
  your own network; only the model calls go out."

**End of 201.** Recap line: "Parallel agents and sub-agents, automations, cloud agents
that open PRs, and automated review with a dashboard — that's Cursor as a control plane
for lots of agents, not just an editor."

---

## Presenter prep checklist (do these before going live)

- [ ] Ran the **One-time setup** and confirmed `http://localhost:3000` shows the login.
- [ ] Logged in with `admin` / `admin`.
- [ ] Confirmed `/start-grafana-dev` and `/test-coverage-canvas` appear when you type `/`.
- [ ] (For 201) Started a **cloud agent** ~30+ min early so a finished PR is ready.
- [ ] (For Bugbot) Enabled Bugbot on the repo (appendix) and, optionally, created the
      **seeded issue** branch so a review always has something to flag.
- [ ] (Optional) Connected an **MCP** integration (Slack/Linear/Jira) if you'll show it.
- [ ] Closed unrelated chats and started a clean **new chat** for each Part.

---

## Appendix A — Dashboard click-paths (things you set up on the website, not in code)

These can't be created from inside the repo; they live in your Cursor account.

### Enable Bugbot
1. Go to `cursor.com/dashboard` -> **Bugbot**.
2. Select this repository.
3. Set **Trigger** to **Manual** (so it only runs when you comment).
4. On any PR, comment `bugbot run` to trigger a review.

### Create an automation
1. Go to `cursor.com` -> **Automations** -> **New**.
2. Pick a template:
   - **Scheduled:** choose a cron-like schedule (e.g. daily at 9am) and give it agent
     instructions like "Scan `public/app` for accessibility (WCAG) regressions and open a
     PR with fixes."
   - **Event-driven:** choose the **Slack** (or Linear/PagerDuty) trigger, point it at a
     channel, and describe what to do when triggered.
3. Choose a model (a cheaper model is fine for routine tasks) and save.

### Start a cloud agent
1. In Cursor, click the **cloud** icon (cloud agents).
2. Pick this repository and the base branch.
3. Paste your task and click **Run**. Close your laptop if you like; check back for the PR.

### Connect an MCP integration (optional)
1. Top-left **marketplace/plugins** area in Cursor.
2. Click an integration (e.g. **Slack**, **Linear**, **Jira**, **Figma**) -> **Install**
   -> **Authenticate** in the browser tab that opens.
3. Back in a chat, you can now ask things like "show me my open Linear issues."

---

## Appendix B — What's already set up in this repo (`.cursor/`)

You can open any of these in the **Files** tab to show the audience.

- **Rules** (`.cursor/rules/`) — standing instructions:
  - `frontend-react.mdc` — frontend conventions; applies only to `public/app/**` and
    package source (glob-scoped).
  - `go-backend.mdc` — Go backend conventions; applies only to `pkg/**` and `apps/**`.
  - `commit-style.mdc` — commit/PR conventions; **always applied**.
- **Skills** (`.cursor/skills/`) — slash-command procedures:
  - `/start-grafana-dev` — build and run Grafana, wait for `localhost:3000`.
  - `/run-frontend-tests` — run Jest correctly (no watch-mode hang).
  - `/test-coverage-canvas` — visual coverage report on a Canvas.
  - `/add-panel-option` — end-to-end recipe for adding a panel option.
- **Hooks** (`.cursor/hooks.json` + `.cursor/hooks/`) — automatic guardrails/auditing:
  - `guard-shell.sh` — blocks destructive shell commands.
  - `scan-secrets.sh` — logs secret-looking strings in edits.
  - `audit-prompt.sh` — records which rules were applied to each prompt.
- **Sub-agents** (`.cursor/agents/`) — specialists with their own memory:
  - `test-writer` — writes and runs tests until green.
  - `code-reviewer` — read-only "mini-Bugbot" reviewer.
  - `docs-writer` — writes change summaries / handoff notes.

The repo also has `AGENTS.md` files (at the root and in some folders). Those are the
canonical, always-on project instructions Cursor reads automatically — a good thing to
mention when you talk about rules.
