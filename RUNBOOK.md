# RUNBOOK

Minimal operating runbook for this repository.

## Daily Ops

1. Check CI status (`ci`, `build-publish`, `deploy`).
2. Confirm project status in `ops/status.json`.
3. Sync any NAS/runtime fixes back into git.

## Deploy

1. Push to `main` (or manually trigger workflows).
2. Verify `build-publish` success.
3. Verify `deploy` success and service health at target runtime.

## Recovery

1. If deployment fails, inspect failing GitHub Action logs first.
2. Roll back to the previous known-good image/tag if runtime is impacted.
3. Update `INCIDENTS.md` with timestamp, impact, root cause, and remediation.
4. Update `ops/status.json` and `HANDOFF.md` after recovery.

## Ownership

- Primary owner: `strelle`
- Agents may execute but must leave evidence in repo/docs.
