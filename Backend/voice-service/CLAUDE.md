# voice-service — CLAUDE.md

### PerformanceId format
- `performanceId` in responses = `"PER" + (3000 + sequenceNumber)` → e.g. `PER3001`, `PER3002`
- Path params use the display ID; service parses: strip `PER`, parseInt, subtract 3000, query by `sequenceNumber`

### Local development
DB on port 5436, reachable at `http://localhost:${GATEWAY_PORT:-8080}/voice/` through the gateway. Run via the root Compose stack (see `Backend/CLAUDE.md`) — no per-service `docker-compose.yml`.
