---
name: plan-feature
description: Produce a high-quality implementation plan for a change before writing any code. Use in Plan mode, or when asked to plan/scope a feature, bug fix, or refactor. Keeps plans concrete, ordered, and reviewable.
---

# Plan a feature (before touching code)

A repeatable workflow for turning a request into a plan a reviewer can approve at a glance.
Produce the plan only — **do not edit files**. Keep it tight; no code dumps.

## Steps

1. **Goal & scope.** One or two sentences: what the change does and, explicitly, what it does
   *not* touch. Call out anything intentionally out of scope.

2. **Affected files, by layer.** List the exact files you'll change and why, grouped by layer
   (data model / schema → API or UI → render/behavior → tests → generated files). Prefer the
   files the user tagged; don't go hunting beyond them without saying so.

3. **Ordered steps.** Numbered, smallest-safe-change first. For each step name the file and
   the concrete edit. Surface the decisions a reviewer cares about:
   - **Defaults & backwards-compatibility** — new options/flags should default to preserve
     current behavior; note whether a migration is needed.
   - **Generated code** — if a schema drives generated files, note the regen command instead
     of hand-editing the generated output.
   - **User-facing strings** — flag anything that needs i18n.

4. **Tests.** State exactly which tests you'll add or update (colocated, named) and how you'll
   run them. A change isn't "planned" without its test.

5. **Verification.** The exact commands to prove it works (build, typecheck, focused tests).

6. **Risks & decisions.** Bullet any assumptions, alternatives you rejected, and anything the
   reviewer should look at closely.

## Definition of a good plan

- A teammate could execute it without asking follow-up questions.
- Every file touched has a reason; defaults, migrations, i18n, and tests are all addressed.
- No code is written yet — this is the align-before-execute step.
