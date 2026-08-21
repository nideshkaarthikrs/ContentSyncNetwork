# tune-service — CLAUDE.md

### TuneId format
- `tuneId` in responses = `"TUN" + (1000 + sequenceNumber)` → e.g. `TUN1001`, `TUN1002`
- Path params use the display ID; service parses: strip `TUN`, parseInt, subtract 1000, query by `sequenceNumber`

### Local development
DB on port 5434, reachable at `http://localhost:${GATEWAY_PORT:-8080}/tune/` through the gateway. Run via the root Compose stack (see `Backend/CLAUDE.md`) — no per-service `docker-compose.yml`.
