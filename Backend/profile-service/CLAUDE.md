# profile-service — CLAUDE.md

### Profile bootstrapping
Profile-service auto-creates a `Profile` record on the first `GET /profiles/:userId` call when the caller is the owner (JWT `userId` matches path param). Name and roles are seeded from JWT claims. Subsequent public GETs read from DB.

### Profile settings fields
`Profile` also carries `primaryRole` (nullable, one of the user's existing `roles`), `publicProfile` (default `true`), and `pushNotificationsEnabled` (default `true`) — all settable via the existing `PUT /profiles/:userId`. `pushNotificationsEnabled` currently only persists intent (there's no push channel to gate yet); `publicProfile` persists but doesn't yet enforce visibility on `GET /profiles/:userId` — that enforcement is a separate, not-yet-built follow-on. `FollowController`'s `POST /users/:userId/follow` also fires a fire-and-forget internal call to notification-service (`FOLLOW`) after a successful follow, looking up the follower's name from the same DB (no cross-service call needed for that part).

### Local development
DB on port 5433, reachable at `http://localhost:${GATEWAY_PORT:-8080}/profile/` through the gateway. Run via the root Compose stack (see `Backend/CLAUDE.md`) — no per-service `docker-compose.yml`.
