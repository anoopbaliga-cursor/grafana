#!/bin/bash
# beforeShellExecution hook: gate destructive shell commands.
#
# Reads the proposed command from stdin (JSON: { "command": "..." }) and denies a
# small set of obviously destructive operations. Everything else is allowed.
#
# Output contract (beforeShellExecution):
#   { "continue": bool, "permission": "allow"|"deny"|"ask",
#     "user_message": "...", "agent_message": "..." }
# Exit code 0 = use the JSON output. Fail-open on unexpected errors.

set -uo pipefail

input="$(cat)"
command="$(printf '%s' "$input" | jq -r '.command // empty' 2>/dev/null)"

deny() {
  jq -n --arg msg "$1" --arg agent "$2" \
    '{continue: true, permission: "deny", user_message: $msg, agent_message: $agent}'
  exit 0
}

allow() {
  printf '%s\n' '{"continue": true, "permission": "allow"}'
  exit 0
}

# No command parsed -> don't get in the way.
[ -z "$command" ] && allow

# Destructive patterns we never want an agent to run unprompted.
if printf '%s' "$command" | grep -Eq 'rm[[:space:]]+(-[a-zA-Z]*[rf][a-zA-Z]*[[:space:]]+)+(/|~|\*|\.)'; then
  deny "Blocked a recursive/forced 'rm' targeting a broad path." \
       "A hook blocked this 'rm -rf' style command because it targets a broad path. Delete specific files explicitly, or ask the user to confirm."
fi

if printf '%s' "$command" | grep -Eq 'git[[:space:]]+push[[:space:]].*(--force|-f([[:space:]]|$))'; then
  deny "Blocked a force push." \
       "A hook blocked this force push. Per repo policy, do not force-push unless explicitly instructed."
fi

if printf '%s' "$command" | grep -Eq 'git[[:space:]]+reset[[:space:]]+--hard'; then
  deny "Blocked 'git reset --hard'." \
       "A hook blocked 'git reset --hard' to avoid discarding work. Stash or commit first, or ask the user."
fi

if printf '%s' "$command" | grep -Eq ':\(\)\{|mkfs|dd[[:space:]]+if=|>[[:space:]]*/dev/sd'; then
  deny "Blocked a potentially destructive system command." \
       "A hook blocked a command that could damage the system. Re-scope it to the project workspace."
fi

allow
