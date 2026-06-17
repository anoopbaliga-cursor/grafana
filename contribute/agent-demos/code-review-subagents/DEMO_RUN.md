# Demo run — synthesized review

This file records a live run of the **code-review-subagents** workflow against `demo/sample/user_quota.go`.

## Intent

> Demo sample code modeling a user quota helper (DB load, consumption check, status formatting, merge). Intentionally contains defects for subagent practice.

## Reviewers

- correctness-reviewer: 12 findings
- maintainability-reviewer: 11 findings
- test-coverage-reviewer: 12 finding groups (no tests exist)

## Act on

| Finding | Reviewers | Rationale |
|:--------|:----------|:----------|
| SQL injection via string-built query (`GetUserQuota:22`) | correctness | Directly exploitable when `userID` is caller-controlled |
| `rows.Close()` before iteration (`GetUserQuota:27-35`) | correctness, maintainability | Returns success with zero data; broken on every call |
| Divide-by-zero panic when `Limit == 0` (`FormatStatus:63`) | correctness, test-coverage | Runtime panic on reachable input |
| Negative `amount` bypasses quota checks | correctness, test-coverage | `CanConsume` returns true; `ApplyUsage` decrements usage |
| No unit tests for any function | test-coverage | Entire package is unverified |

## Consider

| Finding | Reviewers | Tradeoff |
|:--------|:----------|:---------|
| Missing row vs zero quota ambiguity | correctness, maintainability, test-coverage | Needs product decision: `ErrNoRows` vs default quota |
| `ApplyUsage` exceeds limit without error | correctness, maintainability | Tighter API vs caller responsibility |
| `MergeQuota` returns aliased pointers | correctness, maintainability | Copy cost vs mutation safety |
| Mixed I/O + domain + formatting in one file | maintainability | Acceptable for demo; split for production |
| `defaultQuota` constant unused | correctness, maintainability, test-coverage | Implement default path or delete |

## Noted

- Integer overflow on large `int` values (correctness)
- Multiple DB rows silently collapsed to first (correctness)
- Percent truncation in `FormatStatus` (test-coverage)
- Concurrent mutation without synchronization (test-coverage)

## Dismissed

- None for this demo sample — defects are intentional teaching targets.

## Agreement map

All three reviewers independently flagged:

1. SQL string concatenation / injection risk
2. `rows.Close()` ordering bug
3. `FormatStatus` zero-limit panic
4. Missing tests and negative-amount edge cases
5. Unused `defaultQuota` constant

Correctness and test-coverage reviewers uniquely emphasized security and concrete test names. Maintainability reviewer uniquely emphasized layering (store vs domain vs format) and API design (`TryConsume` vs split functions).

## How to reproduce

In Cursor chat:

```
Run code-review-subagents on contribute/agent-demos/code-review-subagents/demo/sample/user_quota.go
```

The parent agent should spawn `correctness-reviewer`, `maintainability-reviewer`, and `test-coverage-reviewer` in one parallel batch, then produce a synthesis like this section.
