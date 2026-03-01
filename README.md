# Strelle Signage

Monorepo: Strapi (backend) + Web (frontend).

## Repo Contract (Agent-Handoff Standard)

This repository is required to stay handoff-ready for any agent/human takeover.

Mandatory files:

- `HANDOFF.md`
- `RUNBOOK.md`
- `INCIDENTS.md`
- `ops/status.json`
- `docs/DECISIONS/README.md`

CI enforces this contract via:

- `.github/workflows/ci.yml`
- `.github/scripts/check-docs-contract.sh`

## Canonical Ops Paths

- Project handoff (canonical):
  `/Users/openclaw/Library/Mobile Documents/com~apple~CloudDocs/Synology Configurator/docs/projects/signage/ops/HANDOFF.md`
- Project handoff (workspace mirror):
  `/Users/openclaw/.openclaw/workspace/docs/projects/signage/ops/HANDOFF.md`
- Automation state:
  `/Users/openclaw/Library/Mobile Documents/com~apple~CloudDocs/Synology Configurator/docs/projects/signage/ops/AUTOMATION_STATE.json`

## Content Intake

- Intake manifest:
  `/Users/openclaw/.openclaw/workspace/signage_content/inbox/INTAKE_MANIFEST.json`
- Stable weekly menu alias:
  `/Users/openclaw/.openclaw/workspace/signage_content/inbox/latest/weekly_menu_current.pdf`

## Weekly Menu Upload Flow

Customer-facing upload:

- Page: `/weekly-upload.html`
- API endpoint: `POST /api/weekly-menu/customer-upload`
- Auth: `x-upload-token` header (or `Authorization: Bearer <token>`)
- Required form fields:
  - `file` (PDF)
  - `calendarWeek` (1-53)
- Optional form fields:
  - `title`
  - `validFrom` (`YYYY-MM-DD`)
  - `validTo` (`YYYY-MM-DD`)
  - `teaserText`

Environment variable required on Strapi runtime:

- `WEEKLY_UPLOAD_TOKEN=<strong-random-token>`

OpenClaw automation helper:

- Script: `ops/upload-weekly-menu.sh`
- Default intake source:
  `/Users/openclaw/.openclaw/workspace/signage_content/inbox/latest/weekly_menu_current.pdf`
