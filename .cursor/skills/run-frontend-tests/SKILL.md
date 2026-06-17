---
name: run-frontend-tests
description: Run Grafana frontend Jest tests correctly (without watch mode hanging the terminal). Use when you need to run, target, or update frontend tests.
paths: public/app/**/*.{ts,tsx},packages/*/src/**/*.{ts,tsx}
---

# Run frontend tests

The repo's `yarn test` script includes `--watch`, which never exits and will hang an
agent or CI run. Always run Jest in non-watch mode.

## Run a single file (fastest, preferred while iterating)

```bash
yarn jest --no-watch <path-to-test-file>
```

Example:

```bash
yarn jest --no-watch public/app/plugins/panel/stat/StatMigrations.test.ts
```

## Run by test name pattern

```bash
yarn jest --no-watch -t "pattern"
```

## Update snapshots

```bash
yarn jest --no-watch -u <path>
```

## Full suite (slow — avoid unless necessary)

```bash
yarn jest --no-watch
```

## Tips

- Always pass `--no-watch` (or `--watchAll=false`) so the command exits.
- Keep tests colocated next to the component as `ComponentName.test.tsx`.
- If a test needs a new string, remember user-facing strings go through `t()` and may
  require `make i18n-extract`.
