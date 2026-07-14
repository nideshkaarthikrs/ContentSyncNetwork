#!/usr/bin/env bash
# Brings up all 13 CSN backend microservices for local dev:
# docker compose (DB) -> prisma migrate dev -> nest start:dev, backgrounded per service.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="$ROOT_DIR/scripts/logs"
PID_DIR="$ROOT_DIR/scripts/pids"
mkdir -p "$LOG_DIR" "$PID_DIR"

# Parallel arrays (not an associative array -- the system bash here is the
# macOS-stock 3.2, which predates bash 4's `declare -A`). SERVICES[i],
# PORTS[i] and READY[i] always refer to the same service.
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
READY=()

launch_service() {
  local svc="$1"
  local svc_dir="$ROOT_DIR/$svc"
  (cd "$svc_dir" && nohup npm run start:dev > "$LOG_DIR/$svc.log" 2>&1 & echo $! > "$PID_DIR/$svc.pid")
}

# nest start --watch intermittently self-triggers a spurious rebuild (an
# upstream race, not a config issue in this repo) that can crash a service
# without cleanly releasing its port. Killing whatever is bound to the port
# clears the crashed process, but npm doesn't forward signals to the `nest
# start --watch` child it spawns, so that watcher can survive independently
# and later respawn a new process on the same port -- kill it directly by
# its service directory too, so a relaunch starts from a truly clean slate.
kill_service() {
  local svc="$1"
  local port="$2"
  local svc_dir="$ROOT_DIR/$svc"
  local pid
  pkill -f "$svc_dir/node_modules/.bin/nest start" 2>/dev/null || true
  pid="$(lsof -ti tcp:"$port" -sTCP:LISTEN 2>/dev/null || true)"
  if [ -n "$pid" ]; then
    kill $pid 2>/dev/null || true
    sleep 0.3
    pid="$(lsof -ti tcp:"$port" -sTCP:LISTEN 2>/dev/null || true)"
    if [ -n "$pid" ]; then
      kill -9 $pid 2>/dev/null || true
    fi
  fi
}

is_ready() {
  local svc="$1"
  local port="$2"
  grep -q 'running on port' "$LOG_DIR/$svc.log" 2>/dev/null && lsof -ti tcp:"$port" -sTCP:LISTEN >/dev/null 2>&1
}

for i in "${!SERVICES[@]}"; do
  svc="${SERVICES[$i]}"
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
  launch_service "$svc"

  # Stagger launches so 13 cold TS compiles don't all thrash CPU/IO at once
  # -- the leading suspect for nest-cli's watch-restart race firing spuriously.
  sleep 2
done

echo
echo "=== Waiting for services to report ready (up to 60s each) ==="
for i in "${!SERVICES[@]}"; do
  svc="${SERVICES[$i]}"
  port="${PORTS[$i]}"
  waited=0
  READY[$i]=0
  while [ "$waited" -lt 60 ]; do
    if is_ready "$svc" "$port"; then
      READY[$i]=1
      break
    fi
    sleep 2
    waited=$((waited + 2))
  done
done

echo
echo "=== Settling (20s) to catch delayed post-startup crashes ==="
sleep 20
for i in "${!SERVICES[@]}"; do
  svc="${SERVICES[$i]}"
  port="${PORTS[$i]}"
  if [ "${READY[$i]}" = "1" ] && ! is_ready "$svc" "$port"; then
    echo "=== $svc: was ready but is down now ==="
    READY[$i]=0
  fi
done

for i in "${!SERVICES[@]}"; do
  svc="${SERVICES[$i]}"
  port="${PORTS[$i]}"
  if [ "${READY[$i]}" != "1" ]; then
    attempt=1
    max_attempts=3
    while [ "${READY[$i]}" != "1" ] && [ "$attempt" -le "$max_attempts" ]; do
      echo "=== $svc: not ready, retry $attempt/$max_attempts ==="
      kill_service "$svc" "$port"
      launch_service "$svc"
      waited=0
      while [ "$waited" -lt 45 ]; do
        if is_ready "$svc" "$port"; then
          READY[$i]=1
          break
        fi
        sleep 2
        waited=$((waited + 2))
      done
      attempt=$((attempt + 1))
    done
  fi
done

echo
echo "=== Startup summary ==="
healthy=0
failed=0
for i in "${!SERVICES[@]}"; do
  svc="${SERVICES[$i]}"
  port="${PORTS[$i]}"
  if [ "${READY[$i]}" = "1" ]; then
    echo "PASS  $svc (port $port)"
    healthy=$((healthy + 1))
  else
    echo "FAIL  $svc (port $port) -- see $LOG_DIR/$svc.log"
    failed=$((failed + 1))
  fi
done

echo
echo "$healthy/${#SERVICES[@]} services healthy"
if [ "$failed" -gt 0 ]; then
  echo "WARNING: $failed service(s) failed to start after retries. Check the logs above."
fi
echo "Tail any log with: tail -f $LOG_DIR/<service>.log"
