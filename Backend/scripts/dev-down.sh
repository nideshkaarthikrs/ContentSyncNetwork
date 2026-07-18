#!/usr/bin/env bash
# Stops everything started by dev-up.sh. DB data is preserved in named
# volumes; pass -v/--volumes to also wipe it (docker compose down accepts
# that flag directly, so it's forwarded through via "$@").
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

docker compose -f docker-compose.yml -f docker-compose.dev.yml down "$@"
