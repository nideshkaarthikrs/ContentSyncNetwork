# identity-service — CLAUDE.md

### UserId format
- PostgreSQL PK: UUID (`@id @default(uuid())`)
- Human-readable display ID: `USR` + zero-padded `sequenceNumber` (auto-increment). E.g. `USR100001`.
- The `displayId` is computed in the service layer: `"USR" + sequenceNumber.toString().padStart(6, "0")`. It is returned in all API responses as `userId`.

### Change password
`identity-service` has `PATCH /auth/change-password` (JWT required), body `{ currentPassword, newPassword }` — verifies the current password against the stored bcrypt hash (401 `CSN-1004` if it doesn't match), then re-hashes and stores the new one.

### Local development
DB on port 5432, reachable at `http://localhost:${GATEWAY_PORT:-8080}/identity/` through the gateway. Run via the root Compose stack (see `Backend/CLAUDE.md`) — no per-service `docker-compose.yml`.
