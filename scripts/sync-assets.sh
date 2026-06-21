#!/usr/bin/env bash
# Sync shared assets to Azure Blob Storage ($web container).
# Usage: ./scripts/sync-assets.sh [--dry-run]
#
# Prerequisites:
#   - az CLI logged in
#   - Storage account "dfnassets" exists (created by Terraform)
#
# This uploads to the $web container (static website hosting), making assets
# available at: https://dfnassets.z19.web.core.windows.net/shared-assets/...
#
# Assets are uploaded in parallel with content-type detection and cache headers.

set -euo pipefail

STORAGE_ACCOUNT="dfnassets"
CONTAINER='$web'
SOURCE_DIR="$(cd "$(dirname "$0")/../public/shared-assets" && pwd)"
DEST_PATH="shared-assets"

DRY_RUN=""
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN="--dry-run"
  echo "=== DRY RUN (no uploads) ==="
fi

echo "Source: $SOURCE_DIR"
echo "Destination: $STORAGE_ACCOUNT / $CONTAINER / $DEST_PATH"
echo ""

# Sync with appropriate cache headers:
# - Fonts/CSS: 1 year (immutable, versioned by content)
# - Images: 1 week (archival content, rarely changes)
# - Videos: 1 year (large, never change)

echo "=== Syncing fonts (cache: 1 year) ==="
az storage blob upload-batch \
  --account-name "$STORAGE_ACCOUNT" \
  --destination "$CONTAINER" \
  --source "$SOURCE_DIR" \
  --destination-path "$DEST_PATH" \
  --pattern "*/fonts/*" \
  --content-cache-control "public, max-age=31536000, immutable" \
  --overwrite false \
  $DRY_RUN 2>/dev/null || true

echo "=== Syncing CSS (cache: 1 week) ==="
az storage blob upload-batch \
  --account-name "$STORAGE_ACCOUNT" \
  --destination "$CONTAINER" \
  --source "$SOURCE_DIR" \
  --destination-path "$DEST_PATH" \
  --pattern "*/css/*" \
  --content-cache-control "public, max-age=604800" \
  --overwrite false \
  $DRY_RUN 2>/dev/null || true

echo "=== Syncing images (cache: 1 week) ==="
az storage blob upload-batch \
  --account-name "$STORAGE_ACCOUNT" \
  --destination "$CONTAINER" \
  --source "$SOURCE_DIR" \
  --destination-path "$DEST_PATH" \
  --pattern "*/images/*" \
  --content-cache-control "public, max-age=604800" \
  --overwrite false \
  $DRY_RUN 2>/dev/null || true

echo "=== Syncing videos (cache: 1 year) ==="
az storage blob upload-batch \
  --account-name "$STORAGE_ACCOUNT" \
  --destination "$CONTAINER" \
  --source "$SOURCE_DIR" \
  --destination-path "$DEST_PATH" \
  --pattern "*/videos/*" \
  --content-cache-control "public, max-age=31536000, immutable" \
  --overwrite false \
  $DRY_RUN 2>/dev/null || true

echo ""
echo "=== Done ==="
echo "Assets available at: https://$STORAGE_ACCOUNT.z19.web.core.windows.net/$DEST_PATH/"
