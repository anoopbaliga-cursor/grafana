---
name: demo-101
description: Facilitate the ~10 minute "Model Choice 101" live demo in the Grafana repo — model selection, Plan Mode vs executing, and the three ways to customize the agent (rules, skills, subagents). Use when the presenter types /demo-101 or asks to run the model-selection 101 demo.
---

# Model Choice 101 — demo facilitator

You are co-presenting a ~10 minute live demo for slide 8 of the *Model Selection + Token
Efficiency* deck. A human is narrating to an audience; **you move at their pace**. The full
human script lives next to this file in `RUN-OF-SHOW.md` — this skill is the agent-side
version of that same flow.

**The build:** add a **"Show border" toggle to the Stat panel** — a small **frontend-only**
change (no backend, no database migration) so the plan naturally splits into **two parallel
subagents: implementation + tests**. It spans the Stat panel
(`public/app/plugins/panel/stat/`) and the shared `BigValue` component that renders the value
(`packages/grafana-ui/src/components/BigValue/`). The border lives in `BigValue`, not the panel
— the panel only passes a `showBorder` prop down. Surfacing that during planning is a
highlight, not a problem.

## How to behave during the demo

- **Wait for the presenter between segments.** After each step, stop and say what's next in
  one line; do not steamroll through all segments at once.
- **Narrate lightly, act clearly.** Keep prose short and let the visible actions (mode
  switches, applied-rules indicator, subagent runs) do the talking.
- **Never wander the codebase.** The anchor files are listed below; let the plan discover the
  rest.
- **Start from a clean tree, every time.** Before beginning (and between repeat runs), run
  `bash .cursor/skills/demo-101/reset.sh` — it idempotently scrubs the feature footprint
  (`stat/`, `BigValue/`, `locales/`) back to `main` so a prior run's edits can't conflict or
  make the feature "appear already present." If a live run fails, run
  `bash .cursor/skills/demo-101/fallback.sh` to drop in the known-good result.

The demo is one coherent build: **tour the existing rules → make ONE plan (skill + rules + a
natural subagent split all surface while planning) → execute that plan once.** Do not jump to
"implement" during planning — everything until Segment 4 stays in Plan mode. Rules already
exist in `.cursor/rules/`; the demo shows them *firing*, it does not author them live.

## Segment 1 — Model selection (~1 min)

Explain, don't click for them: Cursor is model-neutral; pick a big model for hard reasoning, a
cheap fast model (Composer 2.5) for grunt work, Auto to keep it simple. Tell the presenter to
**select a top frontier model now** because the next step is planning. Payoff (right-sizing a
model per worker) shows up in Segment 4.

## Segment 2 — Tour the existing rules (~1 min)

Do **not** author a rule — they already exist. Show the shapes in `.cursor/rules/`:
- `commit-style.mdc` → `alwaysApply: true` (always loaded, kept tiny).
- `frontend-react.mdc` → glob-scoped to `public/app/**/*.{ts,tsx}` (loads for frontend files).
- `go-backend.mdc` → glob-scoped to `pkg/**/*.go` — point out it **won't** load here, because
  this change is frontend-only. Good proof that scoped rules only appear when relevant.

Point: rules are **always-on guardrails**, global (`alwaysApply`) or glob-scoped, never
invoked — they just apply. This change touches only React `.tsx` files, so **only**
`frontend-react.mdc` (plus the always-on `commit-style.mdc`) will load during planning.

## Segment 3 — Plan the build; skill + rules + a natural subagent split all surface here (~4 min)

Presenter presses **Shift+Tab** into **Plan** mode. Stay read-only for this whole segment.

**Plan prompt (presenter manually invokes a skill):** the presenter types `/plan-feature`,
gives a sentence of Grafana context (observability platform; the Stat panel shows a single big
value like a KPI), tags the three stat-panel files (`@public/app/plugins/panel/stat/StatPanel.tsx`,
`@public/app/plugins/panel/stat/module.tsx`, `@public/app/plugins/panel/stat/panelcfg.cue`),
and asks you to plan adding a **"Show border" toggle** (frontend only — no backend or DB
migration), telling you the three tagged files are a starting point and to pull in any shared
component the change needs, then to propose how to split the work across **two parallel
subagents**. Produce a **plan only** — no code.

**Do the research first (this is the highlight):** trace where the value is rendered. The Stat
panel only passes props to the shared `BigValue` component; the border must be declared in
`packages/grafana-ui/src/components/BigValue/BigValueTypes.ts` and drawn in
`BigValueLayout.tsx`. Point this out explicitly — planning with a capable model catches that
editing only the three tagged files would pass a prop `BigValue` doesn't accept (a TypeScript
error, no visible border). This is the value of Plan mode, not a scope violation.

The plan should land on two workstreams:
- **Implementation:** `showBorder: bool | *false` in `panelcfg.cue` (regenerate
  `panelcfg.gen.ts`), an `addBooleanSwitch` with `t()` in `module.tsx`, pass the prop through
  `StatPanel.tsx`, declare it in `BigValueTypes.ts`, and render the themed border in
  `BigValueLayout.tsx` via the theme.
- **Tests:** the colocated tests (stat panel + `BigValueLayout.test.tsx`).

No migration — panel options live in the dashboard JSON and default `false` keeps existing
panels unchanged; call this out.

Point at each layer of slide 7's table as it appears in this one plan — do not force it:
- **Skills** — the presenter *manually evoked* `/plan-feature`; it supplied the structured
  plan format. (On-demand workflow, user-invoked.)
- **Rules** — the plan follows conventions the presenter never asked for: `t()`, theme colors
  via `useStyles2`, default `false`, colocated test (`frontend-react.mdc`), auto-attached from
  the tagged `.tsx` files. `go-backend.mdc` did **not** attach (no Go files). Point at the
  applied-rules/context indicator.
- **Subagents** — the plan split *itself* into implementation + tests; the presenter assigns
  models next.

**Model-specification prompt (still Plan mode):** the presenter **assigns a model per
subagent**: the **implementation** subagent on **Cursor Grok 4.5** (the substantive logic) and
the **tests** subagent on **Composer 2.5 Fast** (mechanical). Reflect the chosen models in the
updated plan and wait. Emphasize: orchestration and model assignment are decided in the plan,
before any execution tokens are spent.

## Segment 4 — Execute the plan (~3 min, the punchline)

Presenter switches to Agent and approves. Spin the **two subagents up in parallel** on the
models the presenter chose, each scoped to its area (implementation / tests). During execution,
call out that the `frontend-react` rule enforces on both workers (`t()`, theme colors, no
`console.log`), and that the model is right-sized per worker — a stronger model on the logic, a
cheap/fast one on the mechanical tests. Warn a full parallel run can exceed the slot; suggest
starting it early and narrating over it, with the pre-run twin file as the fallback.

## Segment 5 — Recap (~45 s)

Three tips: (1) right-size the **model**, (2) **Plan Mode** + be specific (Shift+Tab),
(3) **tag context** with @-mentions and open a **new chat** when work doesn't depend on prior
history. Close on the three-layer contrast: **guardrail (rule) · procedure (skill) · worker
(subagent)**.

## Do NOT

- Do not run `git push`, commit to `main`, or reset with `--hard` (a hook blocks it).
- Do not author rules live — the rules already exist; the demo shows them *firing*.
- Do not force the subagent split with named agents — let it emerge from the plan
  (implementation / tests).
- Do not jump to executing during Segment 3 — keep refining the single plan in Plan mode until
  the presenter approves and switches to Agent in Segment 4.
- Do not delete `.cursor/skills/anoop-demo/` — it is a demo asset.
