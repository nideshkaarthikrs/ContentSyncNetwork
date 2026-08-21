# voting-service — CLAUDE.md

### VoteId format
- `voteId` in responses = `"VOT" + (7000 + sequenceNumber)` → e.g. `VOT7001`, `VOT7002`
- No path-param parsing needed (votes are cast by body; results queried by entityId, not voteId)

### voting-service controller layout
Single `VoteController` at `/votes`:
- `POST /votes` — cast a vote (JWT required); body `{ entityType, entityId }`
- `GET /votes/results/:entityId` — get vote count + rank (JWT required)
- One-vote-per-user enforced by DB unique constraint `(voterId, entityId, entityType)`; P2002 → 409 `CSN-VOTE-001`
- Account-age check (< 7 days) deferred — `registeredAt` not in JWT at MVP
- IP-based rate limiting deferred — no Redis infrastructure at MVP
- Rank = 1 + count of distinct entityIds of same entityType with a higher vote count

### Local development
DB on port 5440, reachable at `http://localhost:${GATEWAY_PORT:-8080}/voting/` through the gateway. Run via the root Compose stack (see `Backend/CLAUDE.md`) — no per-service `docker-compose.yml`.
