#!/usr/bin/env bash
# Apply the known-good "Show border" implementation instantly, if a live run flops.
# Self-cleaning: always resets the feature areas first, so it never conflicts.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

PATCH=".cursor/skills/demo-101/showborder-fallback.patch"

# Always start from a clean feature footprint so the patch applies cleanly.
bash .cursor/skills/demo-101/reset.sh >/dev/null

# --3way lets it apply even if HEAD has drifted a little.
git apply --3way "$PATCH"
echo "Applied fallback. Changed files:"
git status --short
