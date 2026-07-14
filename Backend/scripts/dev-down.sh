#!/usr/bin/env bash
# Stops all 13 CSN backend microservices started by dev-up.sh (Nest processes + their DB containers).
set -uo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PID_DIR="$ROOT_DIR/scripts/pids"

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
  pid_file="$PID_DIR/$svc.pid"
  if [ -f "$pid_file" ]; then
    pid="$(cat "$pid_file")"
    if kill -0 "$pid" 2>/dev/null; then
      echo "=== $svc: stopping pid $pid ==="
      kill "$pid" 2>/dev/null || true
    fi
    rm -f "$pid_file"
  fi

  svc_dir="$ROOT_DIR/$svc"
  if [ -d "$svc_dir" ]; then
    echo "=== $svc: stopping DB ==="
    (cd "$svc_dir" && docker compose stop)
  fi
done

echo "All services stopped. DB data preserved (use 'docker compose down' per service to also remove containers)."
