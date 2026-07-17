# Cost Optimization + Model Selection — Live Demo Script (~10 min)

A repeatable, copy-paste run-of-show. Follow it top to bottom. Every prompt you need is in a
fenced block — copy it straight into Cursor. Nothing here is a skill or an auto-facilitator;
**you** drive, the prompts do the work.

**The one message:** you pay per token, so **right-size the model to the task**. You decide the
whole token budget *in Plan mode, before spending a single execution token* — and Cursor's
**Auto** router right-sizes for you when you don't want to think about it.

**The build:** on the **Service Uptime** dashboard, make each Stat metric **clickable so it
generates a graph of that metric over the last 30 days** — a drill-down from a single KPI value
into its trend. It's a **frontend-only** change that naturally splits into **three parallel
subagents**: a wiring worker (panel option + plumbing), an FE-changes worker (the click handler +
the drill-down graph), and a test worker. Each runs on a different, right-sized model — that
split *is* the cost story.

**Before / after (open these):**
- Starting point: [before dashboard](./uptime-before.html) — three static KPIs, no way to see the trend.
- Finished feature: [after dashboard](./uptime-after.html) — click any metric to generate its 30-day graph.

---

## Pre-flight (off-screen, ~1 min)

- [ ] Reset to a clean tree so a prior run can't conflict:

```bash
bash .cursor/skills/demo-101/reset.sh
```

- [ ] Open a **fresh chat** in the Grafana repo (clean history).
- [ ] Sidebar visible so the audience sees the **model picker** and the **mode** indicator.
- [ ] `.cursor/` expanded in the file tree so `rules/` is on screen.
- [ ] Have the [before dashboard](./uptime-before.html) open in a browser tab, ready to show.
- [ ] Zoom / font size bumped up.

> Run it as many times as you like. Reset before **every** take. If the live run flops mid-demo,
> your safety net is the finished mockup — just open the [after dashboard](./uptime-after.html)
> and click a metric.

---

## Timing at a glance

| Time | Segment | Point |
|------|---------|-------|
| 0:00–1:00 | Model picker + **Auto/router** | Pay per token; right-size the model; Auto routes for you |
| 1:00–2:00 | Rules tour | Automatic guardrails — always-on vs glob-scoped |
| 2:00–6:00 | **Plan** (invoke `/plan-feature`) | Skill (invoked) + rule (auto) + a 3-way subagent split, all in Plan mode |
| 6:00–9:15 | **Execute** (3 subagents in parallel) | Right-size model per worker = the cost lever |
| 9:15–10:00 | Recap | Model selection (Auto if unsure) · plan before you spend · scope each worker |

---

## 0:00–1:00 — Model picker + Auto/router

**Say:** "Cursor is model-neutral. You pay per token, so the lever is picking the right-sized
model for each task. The biggest, smartest models are worth it for hard reasoning — and overkill
(and pricey) for boilerplate."

**Do:** show the [before dashboard](./uptime-before.html) — *"Here's our Service Uptime board.
Three KPIs, but if I want to know how uptime **trended** this month, I'm stuck. Let's make each
metric clickable so it draws its own 30-day graph."*

**Do:** open the model dropdown and point at three tiers without reading the whole list:
- a **top frontier** model — long-horizon, complex reasoning,
- **Composer 2.5 / Composer 2.5 Fast** — Cursor's own, fast, a fraction of frontier cost,
- **Auto** — "when you don't care, the router picks a cost-effective model for you. Zero effort,
  and it right-sizes automatically."

**Do:** select a **top frontier model now.** *"For planning a change I care about I want the
smartest model — this is the reasoning step. I'll hand the grunt work to cheaper models, and to
Auto, in a minute."*

**Cost lens:** "Big model for the plan, right-sized models for the grind. That single habit is
most of your token savings."

---

## 1:00–2:00 — Rules tour (automatic guardrails)

**Say:** "First way to customize the agent: **rules** — guardrails it follows automatically. I
never invoke them; they just apply."

**Do:** open `.cursor/rules/` and show the two shapes:
- `commit-style.mdc` → point at `alwaysApply: true`. *"Always loaded, kept tiny."*
- `frontend-react.mdc` → point at `globs: public/app/**` + `packages/*/src/**`. *"Scoped — only
  loads when I touch frontend files: `t()` for strings, theme colors via `useStyles2`, no
  `console.log`, colocated tests."*
- `go-backend.mdc` → *"There's a Go rule too — but this change is frontend-only, so watch: it
  **won't** load. Scoped rules only appear when they're relevant."*

**Cost lens:** "Scoped rules keep context lean — you only pay for the guardrails you're actually
using on this file."

---

## 2:00–6:00 — Plan the build (skill + rule + subagent split, all in Plan mode)

Everything until execution stays in **Plan mode** — shape one plan, then run it. No edits yet.

**Do:** press **Shift+Tab** → **Plan**. Call out the indicator: *"Read-only. It proposes, it
doesn't touch files."*

**Prompt 1 — invoke the planning skill and give context** (no need to tag files — let the plan
find them):

```
/plan-feature Grafana is an observability platform; the Service Uptime dashboard shows KPIs
(uptime, response time, incidents) as Stat panels.

Add the ability to click a Stat metric to generate a graph of that metric over the last 30 days — a drill-down from the single value into its trend. Frontend only — no backend or database migration. Plan the change and propose how to split the work across THREE parallel subagents: one for FE changes, one for wiring and one test.
```

**What to expect / point at — this is slide-7's three layers, live:**
- **Skill (on-demand workflow):** *"I just invoked `/plan-feature` with a slash command — same
  structured plan every time."*
- **Rule (automatic guardrail):** expand the applied-rules / context indicator —
  `frontend-react.mdc` attached on its own, and `go-backend.mdc` did **not** (no Go files).
  *"I invoked neither; scoped rules load from the frontend files the plan touches — I didn't even
  tag them. That's why the plan uses `t()`, pulls colors from the theme, and colocates tests."*
- **The money moment:** the plan researches the render path — the value is drawn by the shared
  **`grafana-ui` `BigValue` component**, so the click target and the drill-down graph belong in
  `grafana-ui`, not just the Stat panel. *"Planning with a good model caught the real scope before
  we wrote a line — that's the point of Plan mode."*
- **Subagents:** the plan should split into **three workers** — two feature, one test.

**Prompt 2 — assign a right-sized model per subagent** (still Plan mode):

```
Assign models to the three subagents, right-sized for cost:
- Wiring subagent (panel plumbing: add an "Enable drill-down" option in panelcfg.cue + regen
  panelcfg.gen.ts, addBooleanSwitch with t() in module.tsx, pass the option + metric/time-range
  through StatPanel.tsx) -> Cursor Grok 4.5 (mid).
- FE-changes subagent (the real work: make the value clickable in the shared BigValue component
  and render the 30-day drill-down time series with useStyles2/theme) -> Auto, and let Cursor's
  router pick the cost-effective model for it.
- Test subagent (colocated tests: BigValue interaction test + the stat panel test) -> Composer 2.5 Fast.
Update the plan with those models before we run.
```

**Say:** "Three workers, each right-sized — a mid model on the wiring, **Auto** on the interactive
render so the router picks for me, and the cheapest/fastest on the tests. And the entire token
budget was decided **in the plan**, before a single execution token was spent."

---

## 6:00–9:15 — Execute (3 subagents in parallel)

**Do:** **Shift+Tab** → **Agent**, approve.

**Prompt 3 — run it:**

```
Looks good — run the plan. Spin up all three subagents in parallel on the models I assigned,
each scoped to its own files (wiring: panel plumbing; FE-changes: BigValue click + drill-down
graph; test: tests). They touch non-overlapping files, so run them together.
```

**Do:** point at the **three separate subagent runs** in the sidebar, each tagged with its model.
Narrate over them:
- *"Wiring subagent on Grok is adding the option and passing the metric + time range down through
  the Stat panel."*
- *"FE-changes subagent on **Auto** is doing the real work — the router picked the model, and it's
  making the value clickable and drawing the 30-day drill-down graph in the shared `BigValue`
  component."*
- *"Test subagent on Composer is writing the colocated tests — the mechanical part, on the cheap
  fast lane."*
- *"Same `frontend-react` rule enforces on all three — `t()`, theme colors, no `console.log`."*

**Cost lens (say it slowly):** "One frontier model doing *all* of this would pay premium tokens
for boilerplate and tests. Splitting lets ~2/3 of the work run cheap and fast — frontier
reasoning only where it earns its keep. That's the token-efficiency lever, in one move."

**When the run finishes — show the payoff:** open the [after dashboard](./uptime-after.html) and
click **Uptime**, then **Avg Response Time**, then **Incidents** — each generates its own 30-day
graph. *"From three static numbers to a clickable drill-down — and every metric now tells its
story over time."*

> **Timing note:** a full parallel run can exceed the slot. Send Prompt 3 around ~7:00 and
> narrate over it. If it lags, just open the [after dashboard](./uptime-after.html) — that's the
> finished feature, guaranteed.

---

## 9:15–10:00 — Recap: 3 cost tips

1. **Right-size the model** — frontier for hard reasoning, cheap/fast for grunt work, **Auto**
   when you don't want to choose.
2. **Plan before you spend** — Plan Mode (Shift+Tab) decides the whole token budget before any
   execution tokens are burned.
3. **Scope each worker** — subagents with narrow context (a few files, not the whole chat) are
   cheaper and faster.

**Close:** "Right-size the model, plan before you spend, scope each worker. Rules, skills, and
subagents let you bake all three cost habits into the repo so the whole team gets them for free."

---

## Reset / re-run / fallback

```bash
# Before EVERY run — clean tree (idempotent, safe any time):
bash .cursor/skills/demo-101/reset.sh
```

- `reset.sh` returns the Grafana source to a clean state; it never touches `.cursor/` or `demo/`.
- **Safety net:** the finished feature always works as a static mockup — open
  [after dashboard](./uptime-after.html) if the live run misbehaves.
- Do **not** `git push`, commit to `main`, or `reset --hard`. Do not author rules live — the
  demo shows them *firing*, not being written.
