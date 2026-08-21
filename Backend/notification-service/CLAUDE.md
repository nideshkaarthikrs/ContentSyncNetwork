# notification-service — CLAUDE.md

### NotificationId format
- `notificationId` in responses = `"NOT" + (16000 + sequenceNumber)` → e.g. `NOT16001`, `NOT16002`
- Path params use the display ID; service parses: strip `NOT`, parseInt, subtract 16000, query by `sequenceNumber`

### notification-service controller layout
`NotificationController` at `/notifications` — JWT required:
- `GET /notifications?page=1&pageSize=20` — paginated list for the caller (`recipientUserId` from JWT), includes `unreadCount`
- `POST /notifications/read-all` — marks all of the caller's notifications read
- `PATCH /notifications/:notificationId/read` — marks one notification read; 404 `CSN-NOTIF-001` if not found (or not owned by the caller)
- `InternalNotificationController` at `/internal/notifications` — `POST /` (service-to-service
  only, guarded by `InternalAuthGuard`). Body `{ recipientUserId, type, title, sourceId? }`.
  `NotificationType` enum: `FOLLOW | INVITE | VOTE_RECEIVED | MARKETPLACE_SALE | COPYRIGHT_CLAIM | SYSTEM`.
  Called fire-and-forget by:
  - profile-service, on a successful follow (`FOLLOW`)
  - project-service, on collaborator invite (`INVITE`)
  - rights-service, on purchase completion (`MARKETPLACE_SALE`) and on copyright claim submission (`COPYRIGHT_CLAIM`, best-effort — only fires if an `AVAILABLE` listing still exists for the asset, since `findListingByAssetId` doesn't match `SOLD` listings)
  - voting-service, on vote cast for a `TUNE` entity (`VOTE_RECEIVED`) — see the exception noted in `Backend/CLAUDE.md` ("Internal service-to-service auth")

### Local development
DB on port 5444, reachable at `http://localhost:${GATEWAY_PORT:-8080}/notification/` through the gateway. Run via the root Compose stack (see `Backend/CLAUDE.md`) — no per-service `docker-compose.yml`.
