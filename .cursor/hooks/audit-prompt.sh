#!/bin/bash
# beforeSubmitPrompt hook: audit which rules and files were attached to each prompt.
#
# This answers the common question "how do I know which rules are actually being
# applied?" — it records the rule/file attachments Cursor sent with the prompt.
#
# Input (JSON): { "prompt": "...", "attachments": [{ "type": "file"|"rule", "file_path": "..." }] }
# Output (beforeSubmitPrompt): { "continue": bool, "user_message"?: "..." }
# This hook always allows submission (continue: true); it only observes.

set -uo pipefail

log_dir=".cursor/hooks/.logs"
log_file="$log_dir/prompt-audit.log"
mkdir -p "$log_dir"

input="$(cat)"
ts="$(date '+%Y-%m-%d %H:%M:%S')"

rules="$(printf '%s' "$input" | jq -r '[.attachments[]? | select(.type=="rule") | .file_path] | join(", ")' 2>/dev/null)"
files="$(printf '%s' "$input" | jq -r '[.attachments[]? | select(.type=="file") | .file_path] | join(", ")' 2>/dev/null)"

{
  echo "[$ts] rules_applied: ${rules:-<none>}"
  echo "[$ts] files_attached: ${files:-<none>}"
} >> "$log_file"

# Never block; just record and continue.
printf '%s\n' '{"continue": true}'
exit 0
