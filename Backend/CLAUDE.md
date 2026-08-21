# CSN Backend — CLAUDE.md

## Conventions & Patterns Established

### Source of truth
REST API contracts (`CSN REST APIs.pdf`) are authoritative. If the context PDF and the contracts conflict, always follow the contracts.

### Response envelope
All endpoints return the standard CSN envelope:
```json
{ "status": "SUCCESS", "message": "...", "data": {} }
{ "status": "ERROR",   "errorCode": "CSN-XXXX", "message": "..." }
```
Exceptions: register/login responses place top-level fields (userId, token, etc.) directly in the root per the contract.

### JWT payload
All services sign/validate JWTs with: `{ sub: uuid, userId: "USR000001", name: "Arun Kumar", roles: [...] }`.
The `name` field was added to identity-service in the profile-service iteration to support profile bootstrapping.

### JWT guard pattern
- `JwtAuthGuard` — required auth, returns 401 if no/invalid token
- `OptionalJwtAuthGuard` — passes through if no token; sets `req.user` if valid token present. Use on public GET endpoints that need owner-context (e.g., auto-bootstrap).

### Local development (all services)
All 13 services now run behind a single nginx gateway instead of 13 separate
ports, via Docker Compose (`docker-compose.yml` + `docker-compose.dev.yml` for
hot reload):
```bash
cd Backend
./scripts/dev-up.sh     # docker compose up -d --build (all 13 services + DBs + nginx)
./scripts/dev-down.sh   # docker compose down
```
Everything is reachable at `http://localhost:${GATEWAY_PORT:-8080}/<service>/...`
(e.g. `/identity/auth/login`, `/chat/projects/:id/messages`), routed by
`Backend/nginx/nginx.conf`. There is no per-service `docker-compose.yml`
anymore — Postgres + the app container for every service live in the root
`docker-compose.yml`. Each service's `.env` still supplies its secrets
(`JWT_SECRET`, `INTERNAL_SERVICE_SECRET`, etc.) via `env_file`; only
`DATABASE_URL` and inter-service `*_SERVICE_URL` vars are overridden in
Compose to point at the other containers by Docker DNS name instead of
`localhost`. Per-service DB ports and API conventions live in each
`Backend/<service>/CLAUDE.md`.

## Pending Decisions

- **OTP (mobile verification)**: Mentioned in context PDF but not in REST API contracts. Not built. Needs contract before implementation.
- **Social OAuth (Google login)**: Mentioned in context PDF but not in REST API contracts. Not built. Needs contract before implementation.
- **Photo storage**: profile-service and tune-service currently use multer disk storage (`uploads/`) as a placeholder. Real implementation needs AWS S3 + CDN URL.

### Internal service-to-service auth
There's no message queue or event bus anywhere in this backend — all 13 services
are fully isolated with their own DB. Where one service needs to notify another
(feed-service ingesting new content, payment-service recording a marketplace sale),
the caller makes a synchronous, fire-and-forget HTTP call using a small
`postInternal()` helper (`src/shared/internal-http.client.ts`, copy-pasted per
calling service) built on the global `fetch` (Node 20+, no extra dependency). The
call is never `await`ed by the caller and its own try/catch only logs on failure —
a downed receiving service can never block or fail the primary action. The
receiving endpoint is guarded by `InternalAuthGuard` (`src/auth/internal-auth.guard.ts`),
which checks an `x-internal-secret` header against `INTERNAL_SERVICE_SECRET`
(same shared-value convention as `JWT_SECRET` — every service's `.env` must agree).
This is deliberately not JWT-based since there's no end user in these calls.
Current wiring: tune-service/video-service/project-service → feed-service
(`POST /internal/feed-items`), rights-service → payment-service
(`POST /internal/transactions`), profile-service/project-service/rights-service/
voting-service → notification-service (`POST /internal/notifications`).

**One deliberate exception**: voting-service has no local record of who owns a
voted-on entity, so notifying "your tune got a vote" needs to resolve ownership
before it can notify — a fire-and-forget POST alone can't do that. Voting-service
makes a **synchronous** `GET /internal/tunes/:tuneId/owner` call to tune-service
(also guarded by `InternalAuthGuard`, via a small `getInternal()` helper added
alongside `postInternal()` in voting-service's `src/shared/internal-http.client.ts`)
to resolve the `ownerUserId`/title, then fires the notification. This whole chain
is itself invoked fire-and-forget from the vote-cast path (`.catch(() => {})`), so
a slow or downed tune-service still can't block or fail the vote-cast response —
only the notification silently doesn't happen. Scoped to `entityType === 'TUNE'`
only for now.

**A second synchronous exception**: chat-service's `MessageService.send()` and
`MessageGateway`'s `joinProject` handler both need an authorization *answer* before
they can proceed (create the message / join the socket room), so a fire-and-forget
`postInternal()` doesn't fit either. Both call project-service's
`GET /internal/projects/:projectId/membership?userId=&userDisplayId=` synchronously
via the same `getInternal()` helper pattern (added to chat-service's
`src/shared/internal-http.client.ts`). Unlike the voting-service exception, failure
here does block the primary action — `getInternal()` returns `null` on any failure,
which both call sites treat as "not a member" (fail closed, not open).

### Smoke test
A committed script `smoke-test.sh` (Backend root) exercises all 13 services end-to-end in workflow order (register → login → tune → lyrics → performance → video → project → chat → vote → feed → rights → payment → notifications → logout), then runs a negative-assertion section: cross-user 403s, webhook without the internal secret, malformed display IDs (404 not 500), duplicate-mobile messaging, upload size/MIME rejections, invite re-flip, and concurrency races (refresh-token rotation, withdrawal overdraw). ~86 checks; it chains IDs between services, prints PASS/FAIL per check, and exits 1 if anything fails. Run it with the stack up to verify the full integration:
```bash
./smoke-test.sh
```
Notes: each run registers a fresh user (unique email + mobile derived from `date +%s`). Idempotent — safe to run repeatedly.

## What to Build Next

All services in the MVP build order are complete. No pending services remain.

Feed, Revenue Dashboard, and Project Files were originally MVP stubs (no DB writes)
and are now real, DB-backed features — see the feed-service/payment-service/
rights-service/project-service controller-layout sections above and "Internal
service-to-service auth". Two intentional stubs remain within an otherwise-real
revenue dashboard: `royalties` and `contestWins` stay hardcoded 0, since no
royalty-distribution or contest/prize feature exists anywhere in this codebase to
generate them from. Feed's `trending`/`recommended` endpoints also still read the
same reverse-chronological page as `home` — real engagement-based ranking would
need vote-count joins across services with no shared event bus at MVP.

Notifications, Settings, and Analytics — previously 100% static on the frontend
with no backend support — are now wired to real data:
- **Notifications**: new notification-service (see its controller-layout section
  above), fed by profile-service/project-service/rights-service/voting-service.
- **Settings**: `publicProfile`/`pushNotificationsEnabled`/`primaryRole` on
  `Profile`, plus `PATCH /auth/change-password` on identity-service. Dark Mode is
  a frontend-only preference (persisted, but doesn't re-theme the app). Left
  untouched, still static, and needing a product/compliance decision before any
  engineering: Verification/KYC, Bank Account, Payment Methods, Help Center,
  Terms & Conditions.
- **Analytics**: composes existing/lightly-extended endpoints (revenue dashboard,
  profile followers, `GET /projects/my`, `GET /marketplace/rights/my`) rather than
  a new service. Per product decision, metrics with no real data source anywhere
  in this codebase — play counts, audience geography, streaming/advertising
  revenue — were dropped from the screen rather than faked or built as new
  tracking features.
