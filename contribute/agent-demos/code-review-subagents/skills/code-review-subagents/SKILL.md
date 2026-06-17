---
name: code-review-subagents
description: Run parallel subagent code review across correctness, maintainability, and test coverage. Use for "review this branch", "subagent code review demo", or "review these files with subagents".
---

# Code Review Subagents

Orchestrate **three parallel reviewers** instead of one long review pass. Each subagent owns one lens; the parent synthesizes a single verdict.

## Step 1 — Determine scope

- User named files → read those files (and nearby callers if needed for context).
- On a feature branch → `git fetch origin main` then `git diff origin/main...HEAD`.
- User pasted a diff → use it directly.

Package for reviewers:

- The diff or full file contents
- Paths of changed files
- Any `AGENTS.md` or style-guide snippets that apply to the touched area

## Step 2 — State intent

Write one paragraph before spawning reviewers:

- What the change is trying to accomplish
- Derived from user message, commit messages, PR description, or the code itself

If intent is unclear, ask the user once, then proceed.

## Step 3 — Spawn reviewers (parallel)

Launch **all three** in a **single message** (one round trip):

| Subagent | `subagent_type` | Options |
|:---------|:----------------|:--------|
| Correctness | `correctness-reviewer` | `readonly: true` |
| Maintainability | `maintainability-reviewer` | `readonly: true` |
| Test coverage | `test-coverage-reviewer` | `readonly: true` |

Each prompt must include:

```
### Intent
<intent paragraph>

### Code under review
<diff or file contents>

### Changed paths
<comma-separated list>
```

Do **not** spawn nested subagents from reviewers unless the user asks.

## Step 4 — Synthesize

Merge the three structured outputs:

1. **Deduplicate** — same issue described differently → one finding, note all reviewers.
2. **Consensus** — flagged by 2+ reviewers → higher priority.
3. **Categorize** for the user:
   - **Act on** — correctness, security, or clear maintainability regressions
   - **Consider** — legitimate but tradeoff-dependent
   - **Noted** — valid nits or future work
   - **Dismissed** — style-only or missing context (brief rationale)

## Output format

Present:

### Intent
> [Step 2 paragraph]

### Reviewers
- correctness-reviewer: [N findings]
- maintainability-reviewer: [N findings]
- test-coverage-reviewer: [N findings]

### Act On
[Critical and high-confidence items with reviewer attribution]

### Consider
[Tradeoff-dependent items]

### Noted
[Brief list]

### Dismissed
[Filtered findings with one-line why]

### Agreement map
[Where reviewers agreed or disagreed]

## Guardrails

- Reviewers are **readonly** — they do not edit code unless the user then asks for fixes.
- Prioritize correctness and security over style.
- For Grafana Go changes, flag SQL injection, missing error handling, and handler-layer business logic.
- For Grafana frontend changes, flag XSS surfaces, missing tests, and Redux/hook anti-patterns per surrounding code.

## Demo target

To try the bundled sample without a branch diff:

```
Review contribute/agent-demos/code-review-subagents/demo/sample/user_quota.go using code-review-subagents
```
