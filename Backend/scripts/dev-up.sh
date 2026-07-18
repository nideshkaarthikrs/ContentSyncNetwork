#!/usr/bin/env bash
# Brings up all 13 CSN backend microservices, their Postgres DBs, and the
# nginx gateway for local dev via Docker Compose (hot reload courtesy of
# docker-compose.dev.yml). Everything is reachable through one port --
# see docker-compose.yml / Backend/nginx/nginx.conf for the routing.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build

echo
echo "Gateway:     http://localhost:${GATEWAY_PORT:-8080}"
echo "Status:      docker compose -f docker-compose.yml -f docker-compose.dev.yml ps"
echo "Tail logs:   docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f [service]"
