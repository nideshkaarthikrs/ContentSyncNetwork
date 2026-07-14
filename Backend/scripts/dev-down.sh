#!/usr/bin/env bash
# Stops all 13 CSN backend microservices started by dev-up.sh (Nest processes + their DB containers).
set -uo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PID_DIR="$ROOT_DIR/scripts/pids"

# Parallel arrays (not an associative array -- the system bash here is the
# macOS-stock 3.2, which predates bash 4's `declare -A`). SERVICES[i] and
# PORTS[i] always refer to the same service.
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
PORTS=(
  3001
  3002
  3003
  3004
  3005
  3006
  3007
  3008
  3009
  3010
  3011
  3012
  3013
)

# Each service's `npm run start:dev` runs `nest start --watch`, which spawns
# the real port-listening process (`node dist/main`) as a grandchild. Killing
# only the top-level pid recorded by dev-up.sh leaves that grandchild running,
# orphaned and reparented to init. Killing whatever is actually bound to the
# service's port is the only reliable way to stop it regardless of how many
# process layers are in between.
for i in "${!SERVICES[@]}"; do
  svc="${SERVICES[$i]}"
  port="${PORTS[$i]}"

  svc_dir="$ROOT_DIR/$svc"

  pid_file="$PID_DIR/$svc.pid"
  if [ -f "$pid_file" ]; then
    pid="$(cat "$pid_file")"
    if kill -0 "$pid" 2>/dev/null; then
      echo "=== $svc: stopping pid $pid ==="
      kill "$pid" 2>/dev/null || true
    fi
    rm -f "$pid_file"
  fi

  # npm doesn't forward SIGTERM to the child it spawns, so the recorded pid's
  # `nest start --watch` child (and its own `node dist/main` grandchild) can
  # survive the kill above. Target the watcher directly by its service
  # directory, then anything still bound to the port, so nothing is left
  # alive to respawn and re-bind it later.
  pkill -f "$svc_dir/node_modules/.bin/nest start" 2>/dev/null || true

  pid_on_port="$(lsof -ti tcp:"$port" -sTCP:LISTEN 2>/dev/null || true)"
  if [ -n "$pid_on_port" ]; then
    echo "=== $svc: killing leftover process on port $port (pid $pid_on_port) ==="
    kill $pid_on_port 2>/dev/null || true
    sleep 0.3
    pid_on_port="$(lsof -ti tcp:"$port" -sTCP:LISTEN 2>/dev/null || true)"
    if [ -n "$pid_on_port" ]; then
      kill -9 $pid_on_port 2>/dev/null || true
    fi
  fi

  if [ -d "$svc_dir" ]; then
    echo "=== $svc: stopping DB ==="
    (cd "$svc_dir" && docker compose stop)
  fi
done

echo
echo "=== Verifying all ports are free ==="
all_clear=true
for i in "${!SERVICES[@]}"; do
  svc="${SERVICES[$i]}"
  port="${PORTS[$i]}"
  if lsof -ti tcp:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "STILL UP  $svc (port $port)"
    all_clear=false
  else
    echo "PASS      $svc (port $port)"
  fi
done

echo
if $all_clear; then
  echo "All services stopped. DB data preserved (use 'docker compose down' per service to also remove containers)."
else
  echo "WARNING: one or more services are still running on their port after stop attempts. See STILL UP entries above."
fi
