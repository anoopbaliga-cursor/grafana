#!/usr/bin/env bash
# Reset the working tree to a clean "before" state so the demo can be run again
# from scratch with ZERO conflicts. Safe to run at any time, any number of times.
#
# It scrubs the entire feature footprint (whole directories), so it doesn't matter
# which exact files a given run created or edited — the areas are returned to HEAD.
# The .cursor/ demo assets and everything outside these areas are left untouched.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

# Directories/files the "Show border" build can touch:
AREAS=(
  "public/app/plugins/panel/stat"
  "packages/grafana-ui/src/components/BigValue"
  "public/locales"          # in case an i18n-extract ran
)

# 1) Discard tracked modifications in those areas.
git restore --source=HEAD --staged --worktree -- "${AREAS[@]}" 2>/dev/null || true

# 2) Remove any untracked files a run added inside those areas (name-agnostic).
git clean -fdq -- "${AREAS[@]}" 2>/dev/null || true

echo "Clean. Remaining changes (should be only .cursor demo assets):"
git status --short
