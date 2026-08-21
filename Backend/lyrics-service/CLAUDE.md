# lyrics-service — CLAUDE.md

### LyricsId format
- `lyricsId` in responses = `"LYR" + (2000 + sequenceNumber)` → e.g. `LYR2001`, `LYR2002`
- Path params use the display ID; service parses: strip `LYR`, parseInt, subtract 2000, query by `sequenceNumber`

### Approve endpoint auth pattern (MVP)
lyrics-service `POST /lyrics/:lyricsId/approve` gates on `COMPOSER` role from JWT **and** verifies the caller owns the tune via a synchronous `getInternal()` call to tune-service's `/internal/tunes/:tuneId/owner` (fail closed — an unreachable tune-service refuses the approval, 403 `CSN-4004` on mismatch).

### Local development
DB on port 5435, reachable at `http://localhost:${GATEWAY_PORT:-8080}/lyrics/` through the gateway. Run via the root Compose stack (see `Backend/CLAUDE.md`) — no per-service `docker-compose.yml`.
