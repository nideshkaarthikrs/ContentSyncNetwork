#!/usr/bin/env bash
# Brings up all 13 CSN backend microservices for local dev:
# docker compose (DB) -> prisma migrate dev -> nest start:dev, backgrounded per service.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="$ROOT_DIR/scripts/logs"
PID_DIR="$ROOT_DIR/scripts/pids"
mkdir -p "$LOG_DIR" "$PID_DIR"

SERVICES=(
  identity-service
  profile-service
  tune-service
  lyrics-service
  voice-service
  video-service
  project-service
  chat-service
  voting-service
  feed-service
  rights-service
  payment-service
  notification-service
)

for svc in "${SERVICES[@]}"; do
  svc_dir="$ROOT_DIR/$svc"
  if [ ! -d "$svc_dir" ]; then
    echo "skip $svc: directory not found"
    continue
  fi

  echo "=== $svc: starting DB ==="
  (cd "$svc_dir" && docker compose up -d)

  echo "=== $svc: running migrations ==="
  (cd "$svc_dir" && npx prisma migrate dev --skip-seed)

  echo "=== $svc: launching (log: $LOG_DIR/$svc.log) ==="
  (cd "$svc_dir" && nohup npm run start:dev > "$LOG_DIR/$svc.log" 2>&1 & echo $! > "$PID_DIR/$svc.pid")
done

echo
echo "All services launching in background. Tail logs with:"
echo "  tail -f $LOG_DIR/<service>.log"
echo "Check readiness with:"
echo "  grep -l 'running on port' $LOG_DIR/*.log"
