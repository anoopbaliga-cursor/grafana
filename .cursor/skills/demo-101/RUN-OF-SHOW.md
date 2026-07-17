# Model Choice 101 — Live Demo Run-of-Show (~10 min)

Presenter's walkthrough for slide 8 ("Demo") of the *Model Selection + Token Efficiency*
deck. Do this in a **fresh chat** in the Grafana repo so history is clean.

**Goal of the demo:** show, hands-on, the three things the deck sets up —
1. picking the right **model** for the task,
2. **Plan Mode** vs. just executing, and
3. the three ways to **customize the agent**: rules → skills → subagents (and how they differ).

**The build:** add a **"Show border" toggle to the Stat panel** — a small **frontend-only**
change (no backend, no database migration) that the plan splits into **two parallel
subagents: implementation + tests**. It touches the Stat panel
(`public/app/plugins/panel/stat/`) and the shared `BigValue` component that actually renders
the value (`packages/grafana-ui/src/components/BigValue/`) — the agent discovers that second
part during planning, which is one of the demo's best moments.

> Tip: the agent-driven version of this exact flow is the `/demo-101` skill in this same
> folder. You can either drive it yourself with this doc, or type `/demo-101` and let the
> agent facilitate while you narrate.

---

## Pre-flight (do this before you present, ~1 min, off-screen)

- [ ] **Reset to a clean tree** so the run never conflicts with a prior run's edits:
      `bash .cursor/skills/demo-101/reset.sh` (safe to run any time, any number of times —
      it scrubs the whole feature footprint back to `main` and only leaves the `.cursor` demo
      assets). This is the fix for "the feature appears already present in the working tree."
- [ ] Fresh chat open, sidebar visible so the audience can see the **model picker** and modes.
- [ ] `.cursor/` folder visible in the file tree (so `rules/`, `skills/` are on screen).
- [ ] Zoom / font size bumped up.

> **Run it as many times as you want.** Before *every* run (the safety dry-run and each live
> take), run `reset.sh` first. If a live run flops mid-demo, instantly drop in the known-good
> result with `bash .cursor/skills/demo-101/fallback.sh` (it self-resets, then applies the
> captured `showborder-fallback.patch`).

---

## Timing at a glance

| Time | Segment | Point being made |
|------|---------|------------------|
| 0:00–1:00 | Model picker tour + pick a frontier model to plan with | Cursor is model-neutral; pick size to task; Auto keeps it simple |
| 1:00–2:00 | **Rules**: tour existing rules (`commit-style` always-on vs `frontend-react` glob-scoped) | Always-on guardrails; glob-scoped so they load exactly when relevant |
| 2:00–6:00 | **Plan** the build: invoke `/plan-feature` (skill) + tag files → the `frontend-react` rule auto-attaches → the plan splits into 2 subagents (implementation + tests) | Plan Mode; skill (user-invoked) + rule (auto) + a natural 2-way subagent split, all *during planning* |
| 6:00–9:15 | **Execute** the plan: the 2 subagents spin up in parallel on the models you assigned | Execution; rule enforced; right-size model per worker |
| 9:15–10:00 | Recap 3 tips | Model selection · Plan Mode (shift+tab) · tag context / new chat |

---

## 0:00–1:00 — Model picker tour (pick the model you'll plan with)

**Say:** "Cursor is model-neutral — the frontier leader changed 5 times in 2025. You pick
the model per task, and Auto picks for you when you don't care."

**Do:**
- Open the model dropdown. Point out a few tiers without reading the whole list:
  - a **top frontier** model (long-horizon, complex reasoning),
  - **Composer 2.5** (Cursor's own — fast, fraction of frontier cost),
  - **Auto** (let Cursor route).
- **Select a top frontier model now.** *"For planning a change I care about, I want the
  smartest model — this is the reasoning step. I'll hand the grunt work to cheaper models in
  a minute."*

**Land it:** "Big model for the plan, right-sized models for the grind — you'll see me assign
those at the end."

---

## 1:00–2:00 — Tour the RULES that already exist (guardrails)

**Say:** "Three ways to customize the agent. First: **rules** — guardrails the agent follows
automatically. I already have a few here; let me show you the two shapes."

**Do:** Open `.cursor/rules/` in the tree.
- Open `commit-style.mdc` → point at `alwaysApply: true`. *"Always loaded — every chat, every
  task. Kept tiny so it doesn't bloat context."*
- Open `frontend-react.mdc` → point at `globs: public/app/**/*.{ts,tsx}`. *"Scoped — only loads
  when I touch frontend files. i18n via `t()`, theme colors via `useStyles2`, no `console.log`,
  colocated tests."*
- Open `go-backend.mdc` → *"There's a Go rule too — but this change is frontend-only, so watch:
  it **won't** load. Scoped rules only show up when they're relevant."*

**Say:** "So rules are either **always on** or **scoped to file globs**, and I never invoke
them — they just apply when they match."

---

## 2:00–6:00 — PLAN the build (one plan; rule + skill + subagents all surface here)

Everything from here until execution stays in **Plan mode** — we shape one plan, then run it.
No edits happen yet.

**Do:** Press **Shift+Tab** → **Plan** mode. Call out the indicator: *"Read-only. It proposes,
it doesn't touch files. Shift+Tab toggles it."*

**Prompt 1 — invoke the planning SKILL, give product context, then the task (tag the files):**
type `/plan-feature`, then the prompt. (Type `@` for each file so the picker shows.)

   > /plan-feature Grafana is an observability platform; the Stat panel shows a single big
   > value like a KPI. Add a "Show border" toggle to the Stat panel so users can draw a themed
   > border around the value. Frontend only — no backend or database migration. The three
   > tagged files are your starting point; pull in any shared component the change actually
   > needs. Plan the change and propose how to split the work across two parallel subagents.
   > @public/app/plugins/panel/stat/StatPanel.tsx
   > @public/app/plugins/panel/stat/module.tsx @public/app/plugins/panel/stat/panelcfg.cue

The `plan-feature` skill returns a structured plan — goal & scope, files by layer, ordered
steps, tests, verify commands, risks — with **no code written**. Expect the plan to: add
`showBorder` (default `false`) to `panelcfg.cue` (regenerate `panelcfg.gen.ts`), an
`addBooleanSwitch` with `t()` in `module.tsx`, pass the prop through `StatPanel.tsx`, and —
because the value is actually rendered by the **shared `BigValue` component in `grafana-ui`** —
declare the prop in `BigValueTypes.ts` and draw the themed border in `BigValueLayout.tsx`, plus
colocated tests. No migration (panel options live in the dashboard JSON; default `false` keeps
existing panels unchanged).

> **This is the money moment — call it out.** In Plan mode the agent *researched the render
> path* and found the border can't live in the Stat panel alone; it belongs in the shared
> `grafana-ui/BigValue` component (the panel only passes a `showBorder` prop down). A weaker
> flow would have edited the three tagged files, passed a prop `BigValue` doesn't accept, and
> shipped a TypeScript error with no visible border. **Say:** "Planning with a good model
> caught the real scope *before* we wrote code — that's the whole point of Plan mode." The
> prompt tags three files as a starting point but explicitly lets the agent pull in what it
> needs, so expanding into `grafana-ui` is correct, not a violation.

**This is slide 7's table, live — point at all three layers in the one plan:**
- **Skills (on-demand workflows)** — *you just used one.* *"I evoked my `plan-feature` skill
  with a slash command — the 'user manually evokes' path. Same structured plan every time."*
- **Rules (always-on guardrails)** — expand the response's **applied-rules / context
  indicator**: `frontend-react.mdc` attached on its own (and `go-backend.mdc` did **not** —
  no Go files). *"I invoked neither; scoped rules load from what I touch. That's why the plan
  already defaults to `false`, uses `t()`, and pulls the border color from the theme."*
- **Subagents (specialized workers)** — *"and the plan split itself into two workers — one to
  implement, one to test. I'll pick a model for each next."*

Also: *"I tagged the exact files with `@` so it didn't have to hunt."* (`@` also tags folders,
rules, skills, Git, past chats.)

**Prompt 2 — YOU assign a model per subagent (still Plan mode):**

   > Assign models to the two subagents: run the **implementation** subagent on **Cursor Grok
   > 4.5** and the **tests** subagent on **Composer 2.5 Fast** — the implementation is the
   > substantive work, the tests are more mechanical. Update the plan with those models before
   > we run.

Point at the plan: two workers, each with **the model you assigned**. **Say:** "This is model
selection in one move — a stronger model on the real logic, a cheap fast one on the mechanical
tests. And it's all decided *in the plan*, before a token is spent executing."

---

## 6:00–9:15 — EXECUTE the plan (2 subagents run in parallel on the models you assigned)

**Prompt 3 — approve and run on the models you already chose (Shift+Tab → Agent):**

   > Looks good — run the plan. Spin the two subagents up in parallel on the models I picked,
   > each scoped to its area (implementation / tests).

**Do:** point at the **two separate subagent runs** in the sidebar, each tagged with the model
you chose. Narrate *during execution*:
- *"Implementation worker on Grok is wiring the schema and toggle in the Stat panel and the
  actual border render in the shared `grafana-ui/BigValue` component; the tests worker on
  Composer is writing the colocated tests."*
- *"Same `frontend-react` rule is enforcing as they write — `t()`, theme colors, no
  `console.log`."*
- *"Right-size the model per worker — stronger where the logic is, cheap and fast on the
  mechanical part. That's the token-efficiency lever."*

> **Timing note:** the parallel run can still exceed the slot. Best move: send Prompt 3 around
> ~7:00 and narrate over it, then come back to results. If you have a pre-run twin file, fall
> back to it if the live run lags.

**Land the three-layer contrast (say this slowly):**
> "Rules = *always-on guardrails*. Skills = *on-demand workflows*. Subagents = *specialized
> workers with their own model and context*. Guardrail, procedure, worker. And you just watched
> all three show up **while planning** and again **while executing**."

---

## 9:15–10:00 — Recap: 3 need-to-know tips (slide 9)

1. **Model selection** — right-size the model to the task (Auto if unsure).
2. **Plan ahead** — use Plan Mode and be specific; **Shift+Tab** toggles it.
3. **Tag context / fresh chats** — @-mention specific files; open a new chat whenever the
   work doesn't depend on earlier history.

**Close:** "Rules, skills, and subagents let you bake all three habits into the repo so the
whole team gets them for free."

---

## Reset / re-run / fallback (repeatable, conflict-free)

Everything you need to run the demo over and over lives in this folder:

```bash
# Before EVERY run — return the tree to a clean "before" state (idempotent, safe any time):
bash .cursor/skills/demo-101/reset.sh

# If the live run flops — apply the known-good result instantly (self-resets first):
bash .cursor/skills/demo-101/fallback.sh
```

- `reset.sh` scrubs the entire feature footprint (`public/app/plugins/panel/stat/`,
  `packages/grafana-ui/src/components/BigValue/`, `public/locales/`) back to `main`, so it
  doesn't matter which exact files a run created — no leftovers, no conflicts. It never touches
  the `.cursor/` demo assets or anything outside those areas.
- `fallback.sh` re-applies `showborder-fallback.patch` (a captured good run) with `--3way`.
- Recommended rhythm: **reset → dry-run once (safety) → reset → live run**. Repeat reset before
  each additional take.
