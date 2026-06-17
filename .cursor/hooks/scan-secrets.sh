#!/bin/bash
# afterFileEdit hook: scan newly written text for secret-looking strings.
#
# Input (JSON): { "file_path": "...", "edits": [{ "old_string": "...", "new_string": "..." }] }
# afterFileEdit supports no output fields, so this hook is observe-and-log only:
# any findings are appended to .cursor/hooks/.logs/secret-scan.log and echoed to stderr
# for the transcript. It never blocks (the edit already happened).

set -uo pipefail

log_dir=".cursor/hooks/.logs"
log_file="$log_dir/secret-scan.log"
mkdir -p "$log_dir"

input="$(cat)"
file_path="$(printf '%s' "$input" | jq -r '.file_path // "unknown"' 2>/dev/null)"
new_text="$(printf '%s' "$input" | jq -r '[.edits[]?.new_string] | join("\n")' 2>/dev/null)"

[ -z "$new_text" ] && exit 0

# Heuristic patterns for common leaked credentials.
patterns=(
  'AKIA[0-9A-Z]{16}'                         # AWS access key id
  'gh[pousr]_[A-Za-z0-9]{20,}'               # GitHub tokens
  'sk-[A-Za-z0-9]{20,}'                      # OpenAI-style secret keys
  'xox[baprs]-[A-Za-z0-9-]{10,}'             # Slack tokens
  '-----BEGIN [A-Z ]*PRIVATE KEY-----'       # private keys
  '(secret|password|passwd|api[_-]?key|token)[[:space:]]*[:=][[:space:]]*["'\''][^"'\'' ]{8,}'
)

found=0
for p in "${patterns[@]}"; do
  if printf '%s' "$new_text" | grep -Eqi -e "$p"; then
    found=1
    ts="$(date '+%Y-%m-%d %H:%M:%S')"
    echo "[$ts] possible secret in $file_path (pattern: $p)" >> "$log_file"
  fi
done

if [ "$found" -eq 1 ]; then
  echo "WARNING (hook): possible secret detected in $file_path. Review before committing; see $log_file." 1>&2
fi

exit 0
