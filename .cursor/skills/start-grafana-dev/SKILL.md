---
name: start-grafana-dev
description: Start the Grafana development environment (backend + frontend) and wait until it is reachable at http://localhost:3000. Use whenever you need a running Grafana instance to test changes, demo the UI, or use design mode.
---

# Start the Grafana dev environment

A deterministic, repeatable way to bring Grafana up locally. Prefer running these steps
exactly rather than re-deriving them each time.

## Prerequisites (run once per shell)

```bash
nvm use            # selects Node from .nvmrc (v24.11.0)
corepack enable    # enables the bundled Yarn 4.x
```

If frontend dependencies have never been installed in this checkout:

```bash
yarn install --immutable
```

## Start the backend

The backend builds and runs with hot reload (air) and serves on port 3000.

```bash
make run
```

- First build takes ~3 minutes (debug symbols). Subsequent reloads are faster.
- No external database is needed; Grafana uses embedded SQLite by default.
- Default login is `admin` / `admin`.

## Start the frontend (in a second terminal)

```bash
yarn start
```

The webpack dev server watches for changes; the backend proxies to it. First compile
takes ~45 seconds.

## Confirm it is up

Grafana is ready when `http://localhost:3000` returns the login page:

```bash
curl -sf -o /dev/null -w "%{http_code}\n" http://localhost:3000/login
```

A `200` means it is reachable. If you get a connection error, wait and retry — the first
build/compile is slow.

## Notes

- Run the backend and frontend in separate long-lived terminals (use tmux for
  background/long-running processes).
- Do not commit local config changes made just to get the server running.
