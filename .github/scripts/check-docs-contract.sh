#!/usr/bin/env bash
set -euo pipefail

required_files=(
  "README.md"
  "HANDOFF.md"
  "RUNBOOK.md"
  "ops/status.json"
  "docs/DECISIONS/README.md"
  "INCIDENTS.md"
)

for f in "${required_files[@]}"; do
  if [[ ! -f "$f" ]]; then
    echo "Missing required file: $f" >&2
    exit 1
  fi
  if [[ ! -s "$f" ]]; then
    echo "Required file is empty: $f" >&2
    exit 1
  fi
done

if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required for docs contract validation" >&2
  exit 1
fi

jq -e '
  .project and
  .overallStatus and
  .lastUpdated and
  .owner and
  (.nextSteps | type=="array")
' ops/status.json >/dev/null

if ! grep -q '^## Current Status' HANDOFF.md; then
  echo "HANDOFF.md must contain section: ## Current Status" >&2
  exit 1
fi

if ! grep -q '^## Next Actions' HANDOFF.md; then
  echo "HANDOFF.md must contain section: ## Next Actions" >&2
  exit 1
fi

if ! grep -q '^## Recovery' RUNBOOK.md; then
  echo "RUNBOOK.md must contain section: ## Recovery" >&2
  exit 1
fi

echo "Documentation contract check passed."
