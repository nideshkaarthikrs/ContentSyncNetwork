# feed-service — CLAUDE.md

### feed-service controller layout
`FeedController` at `/feed` — all three endpoints require JWT, backed by a real
`FeedItem` model:
- `GET /feed/home` — home feed (paginated, `?page=1&pageSize=20`)
- `GET /feed/trending` — same reverse-chronological page as home for now; true
  engagement-based ranking would need vote-count joins across services with no
  shared event bus at MVP — documented follow-on, not built
- `GET /feed/recommended` — same reverse-chronological page as home for now, same reason
- `InternalFeedController` at `/internal/feed-items` — `POST /` (service-to-service
  only, guarded by `InternalAuthGuard` checking `x-internal-secret` against
  `INTERNAL_SERVICE_SECRET`, not JWT). Called fire-and-forget by tune-service (on
  tune creation), video-service (on video upload), and project-service (on project
  creation) — each via a small `postInternal()` helper in that service's
  `src/shared/internal-http.client.ts` that only logs on failure and never throws,
  so a downed feed-service never blocks the primary action. Voting-service is
  intentionally not wired — a vote is engagement on content that's already a feed
  item, not new content itself.

### FeedItemId format
- `feedItemId` in responses = `"FED" + (12000 + sequenceNumber)` → e.g. `FED12001`, `FED12002`

### Local development
DB on port 5441, reachable at `http://localhost:${GATEWAY_PORT:-8080}/feed/` through the gateway. Run via the root Compose stack (see `Backend/CLAUDE.md`) — no per-service `docker-compose.yml`.
