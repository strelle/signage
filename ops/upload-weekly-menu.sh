#!/usr/bin/env bash
set -euo pipefail

API_BASE="${SIGNAGE_API_BASE:-https://signage.strelle.at}"
UPLOAD_PATH="${WEEKLY_UPLOAD_PATH:-/api/weekly-menu/customer-upload}"
UPLOAD_TOKEN="${WEEKLY_UPLOAD_TOKEN:-}"
PDF_FILE="${WEEKLY_MENU_FILE:-/Users/openclaw/.openclaw/workspace/signage_content/inbox/latest/weekly_menu_current.pdf}"
CALENDAR_WEEK="${WEEKLY_MENU_KW:-$(date +%V | sed 's/^0*//')}"
TITLE="${WEEKLY_MENU_TITLE:-Wochenmenu KW ${CALENDAR_WEEK}}"
VALID_FROM="${WEEKLY_MENU_VALID_FROM:-}"
VALID_TO="${WEEKLY_MENU_VALID_TO:-}"
TEASER_TEXT="${WEEKLY_MENU_TEASER_TEXT:-}"

if [[ -z "${UPLOAD_TOKEN}" ]]; then
  echo "ERROR: WEEKLY_UPLOAD_TOKEN is not set." >&2
  exit 1
fi

if [[ ! -f "${PDF_FILE}" ]]; then
  echo "ERROR: PDF file not found: ${PDF_FILE}" >&2
  exit 1
fi

if ! [[ "${CALENDAR_WEEK}" =~ ^[0-9]+$ ]] || (( CALENDAR_WEEK < 1 || CALENDAR_WEEK > 53 )); then
  echo "ERROR: Invalid calendar week '${CALENDAR_WEEK}'. Use 1-53." >&2
  exit 1
fi

API_URL="${API_BASE%/}${UPLOAD_PATH}"

curl -fsS -X POST "${API_URL}" \
  -H "x-upload-token: ${UPLOAD_TOKEN}" \
  -F "file=@${PDF_FILE};type=application/pdf" \
  -F "calendarWeek=${CALENDAR_WEEK}" \
  -F "title=${TITLE}" \
  ${VALID_FROM:+-F "validFrom=${VALID_FROM}"} \
  ${VALID_TO:+-F "validTo=${VALID_TO}"} \
  ${TEASER_TEXT:+-F "teaserText=${TEASER_TEXT}"}

echo
echo "OK: Weekly menu upload completed."
