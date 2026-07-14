# CSN Backend — CLAUDE.md

## Completed Services

| Service | Port | Status |
|---|---|---|
| identity-service | 3001 | Done |
| profile-service | 3002 | Done |
| tune-service | 3003 | Done |
| lyrics-service | 3004 | Done |
| voice-service | 3005 | Done |
| video-service | 3006 | Done |
| project-service | 3007 | Done |
| chat-service | 3008 | Done |
| voting-service | 3009 | Done |
| feed-service | 3010 | Done |
| rights-service | 3011 | Done |
| payment-service | 3012 | Done |
| notification-service | 3013 | Done |

## In-Progress Services

None.

## Pending Services

None.

## Conventions & Patterns Established

### Source of truth
REST API contracts (`CSN REST APIs.pdf`) are authoritative. If the context PDF and the contracts conflict, always follow the contracts.

### UserId format
- PostgreSQL PK: UUID (`@id @default(uuid())`)
- Human-readable display ID: `USR` + zero-padded `sequenceNumber` (auto-increment). E.g. `USR100001`.
- The `displayId` is computed in the service layer: `"USR" + sequenceNumber.toString().padStart(6, "0")`. It is returned in all API responses as `userId`.

### Response envelope
All endpoints return the standard CSN envelope:
```json
{ "status": "SUCCESS", "message": "...", "data": {} }
{ "status": "ERROR",   "errorCode": "CSN-XXXX", "message": "..." }
```
Exceptions: register/login responses place top-level fields (userId, token, etc.) directly in the root per the contract.

### Tech stack (per service)
- Framework: NestJS + TypeScript
- ORM: Prisma (schema in `prisma/schema.prisma`)
- DB: PostgreSQL (each service owns its own DB)
- Auth: JWT via `@nestjs/jwt` + `@nestjs/passport` + `passport-jwt`
- Validation: `class-validator` DTOs with global `ValidationPipe`
- Secrets: `.env` (never committed); `.env.example` committed

### Folder structure (per service)
```
<service>/
├── src/
│   ├── main.ts               # Bootstrap + global pipes, port from config
│   ├── app.module.ts         # Root module
│   ├── config/configuration.ts
│   ├── prisma/prisma.service.ts
│   ├── shared/response.helper.ts
│   ├── auth/
│   │   ├── jwt.strategy.ts           # Validates Bearer tokens using shared JWT_SECRET
│   │   ├── jwt-auth.guard.ts         # Required JWT guard
│   │   └── optional-jwt-auth.guard.ts # Optional JWT guard (public routes that benefit from user context)
│   └── <feature>/
│       ├── <feature>.module.ts
│       ├── <feature>.controller.ts
│       ├── <feature>.service.ts
│       ├── <feature>.repository.ts
│       └── dto/
├── prisma/schema.prisma
├── Dockerfile
├── docker-compose.yml        # Local dev DB
├── .env                      # Local dev (not committed)
├── .env.example
└── package.json
```

### JWT payload
All services sign/validate JWTs with: `{ sub: uuid, userId: "USR000001", name: "Arun Kumar", roles: [...] }`.
The `name` field was added to identity-service in the profile-service iteration to support profile bootstrapping.

### JWT guard pattern
- `JwtAuthGuard` — required auth, returns 401 if no/invalid token
- `OptionalJwtAuthGuard` — passes through if no token; sets `req.user` if valid token present. Use on public GET endpoints that need owner-context (e.g., auto-bootstrap).

### Profile bootstrapping
Profile-service auto-creates a `Profile` record on the first `GET /profiles/:userId` call when the caller is the owner (JWT `userId` matches path param). Name and roles are seeded from JWT claims. Subsequent public GETs read from DB.

### Profile settings fields
`Profile` also carries `primaryRole` (nullable, one of the user's existing `roles`), `publicProfile` (default `true`), and `pushNotificationsEnabled` (default `true`) — all settable via the existing `PUT /profiles/:userId`. `pushNotificationsEnabled` currently only persists intent (there's no push channel to gate yet); `publicProfile` persists but doesn't yet enforce visibility on `GET /profiles/:userId` — that enforcement is a separate, not-yet-built follow-on. `FollowController`'s `POST /users/:userId/follow` also fires a fire-and-forget internal call to notification-service (`FOLLOW`) after a successful follow, looking up the follower's name from the same DB (no cross-service call needed for that part).

### Change password
`identity-service` has `PATCH /auth/change-password` (JWT required), body `{ currentPassword, newPassword }` — verifies the current password against the stored bcrypt hash (401 `CSN-1004` if it doesn't match), then re-hashes and stores the new one.

### PostgreSQL port convention
Each service runs its own PostgreSQL container on a unique host port:
- identity-service: 5432
- profile-service: 5433
- tune-service: 5434
- lyrics-service: 5435
- voice-service: 5436
- video-service: 5437
- project-service: 5438
- chat-service: 5439
- voting-service: 5440
- feed-service: 5441
- rights-service: 5442
- payment-service: 5443
- notification-service: 5444

### Local development (identity-service)
```bash
cd csn-backend/identity-service
docker compose up -d          # start PostgreSQL on port 5432
npx prisma migrate dev        # run migrations
npm run start:dev             # start on port 3001
```

### Local development (profile-service)
```bash
cd csn-backend/profile-service
docker compose up -d          # start PostgreSQL on port 5433
npx prisma migrate dev        # run migrations
npm run start:dev             # start on port 3002
```

## Pending Decisions

- **OTP (mobile verification)**: Mentioned in context PDF but not in REST API contracts. Not built. Needs contract before implementation.
- **Social OAuth (Google login)**: Mentioned in context PDF but not in REST API contracts. Not built. Needs contract before implementation.
- **Photo storage**: profile-service and tune-service currently use multer disk storage (`uploads/`) as a placeholder. Real implementation needs AWS S3 + CDN URL.

### TuneId format
- `tuneId` in responses = `"TUN" + (1000 + sequenceNumber)` → e.g. `TUN1001`, `TUN1002`
- Path params use the display ID; service parses: strip `TUN`, parseInt, subtract 1000, query by `sequenceNumber`

### LyricsId format
- `lyricsId` in responses = `"LYR" + (2000 + sequenceNumber)` → e.g. `LYR2001`, `LYR2002`
- Path params use the display ID; service parses: strip `LYR`, parseInt, subtract 2000, query by `sequenceNumber`

### Approve endpoint auth pattern (MVP)
lyrics-service `POST /lyrics/:lyricsId/approve` gates on `COMPOSER` role from JWT. Full cross-service ownership check (confirm caller owns the tune) is deferred — would require an HTTP call to tune-service.

### Local development (tune-service)
```bash
cd csn-backend/tune-service
docker compose up -d          # start PostgreSQL on port 5434
npx prisma migrate dev        # run migrations
npm run start:dev             # start on port 3003
```

### Local development (lyrics-service)
```bash
cd csn-backend/lyrics-service
docker compose up -d          # start PostgreSQL on port 5435
npx prisma migrate dev        # run migrations
npm run start:dev             # start on port 3004
```

### PerformanceId format
- `performanceId` in responses = `"PER" + (3000 + sequenceNumber)` → e.g. `PER3001`, `PER3002`
- Path params use the display ID; service parses: strip `PER`, parseInt, subtract 3000, query by `sequenceNumber`

### Local development (voice-service)
```bash
cd csn-backend/voice-service
docker compose up -d          # start PostgreSQL on port 5436
npx prisma migrate dev        # run migrations
npm run start:dev             # start on port 3005
```

### VideoId format
- `videoId` in responses = `"VID" + (1000 + sequenceNumber)` → e.g. `VID1001`, `VID1002`
- Matches the `VID1001` example in the DRM contract (section 22)
- Path params use the display ID; service parses: strip `VID`, parseInt, subtract 1000, query by `sequenceNumber`

### VideoProjectId format
- `videoProjectId` in responses = `"VPR" + (4000 + sequenceNumber)` → e.g. `VPR4001`, `VPR4002`
- Path params use the display ID; service parses: strip `VPR`, parseInt, subtract 4000, query by `sequenceNumber`

### video-service controller layout
video-service has three controllers in one file (`video.controller.ts`) under a single `VideoModule`:
- `VideoProjectController` (`/video-projects`) — `POST /video-projects`
- `VideoController` (`/videos`) — `POST /videos` (multipart), `GET /videos/:videoId`
- `AiController` (`/ai`) — `POST /ai/storyboards` (stub)

### Local development (video-service)
```bash
cd csn-backend/video-service
docker compose up -d          # start PostgreSQL on port 5437
npx prisma migrate dev        # run migrations
npm run start:dev             # start on port 3006
```

### ProjectId format
- `projectId` in responses = `"PRJ" + (5000 + sequenceNumber)` → e.g. `PRJ5001`, `PRJ5002`
- Path params use the display ID; service parses: strip `PRJ`, parseInt, subtract 5000, query by `sequenceNumber`

### MessageId format
- `messageId` in responses = `"MSG" + (6000 + sequenceNumber)` → e.g. `MSG6001`, `MSG6002`
- Path params use the display ID; service parses: strip `MSG`, parseInt, subtract 6000, query by `sequenceNumber`

### project-service controller layout
Single `ProjectController` at `/projects`:
- `POST /projects` — create project (JWT required); fires a fire-and-forget internal
  call to feed-service (`POST /internal/feed-items`) so the new project shows up in
  the home feed
- `POST /projects/:projectId/invite` — invite collaborator (JWT required; owner check in
  service layer); also fires a fire-and-forget internal call to notification-service
  (`INVITE`) so the invited user sees it in their Notifications screen
- `GET /projects/:projectId/members` — list project members (JWT required)
- `GET /projects/:projectId/files` — list project files (JWT required; real DB-backed, `ProjectFile` model)
- `POST /projects/:projectId/files` — upload a project file (JWT required; owner or
  accepted member only); multer `diskStorage` to `./uploads`, same convention as
  tune/voice/video/profile services. Files are served back over HTTP via
  `ServeStaticModule` at `/uploads/*` (project-service only — the same gap in the
  other upload-handling services is pre-existing tech debt, out of scope here)
- `InternalProjectController` at `/internal/projects` — `GET /:projectId/membership?userId=&userDisplayId=`
  (service-to-service only, guarded by `InternalAuthGuard`), returns `{ isMember: boolean }`.
  The owner/accepted-member check previously inlined only in `uploadFile()` is now a
  reusable `ProjectService.isMember()`/`checkMembership()` pair. Added so chat-service
  can authorize socket room joins and message sends — see "chat-service controller
  layout" and "Internal service-to-service auth" below.

### FileId format
- `fileId` in responses = `"PFL" + (14000 + sequenceNumber)` → e.g. `PFL14001`, `PFL14002`

### chat-service controller layout
Single `MessageController` at `/projects`:
- `POST /projects/:projectId/messages` — send message (JWT required); now also checks
  the sender is a project member via a synchronous internal `GET` to project-service's
  `/internal/projects/:projectId/membership` (403 `CSN-CHAT-001` if not), then broadcasts
  the created message over the `MessageGateway` (see below) before returning
- `GET /projects/:projectId/messages` — paginated message history (JWT required; still
  no membership check on the read path — REST history fetch predates the socket work
  and was left as-is, matching the "no cross-service FK validation" MVP scope this
  service started with)
- `projectId` stored as a string reference (no DB-level FK to project-service — the
  membership check above is an HTTP call, not a foreign key)

### chat-service real-time gateway (`MessageGateway`)
Socket.IO gateway (`src/message/message.gateway.ts`, `@nestjs/websockets` +
`@nestjs/platform-socket.io`) pushes new messages live instead of relying solely on
REST polling. This is the first WebSocket usage anywhere in this backend — no other
service does this.
- **Handshake auth**: no existing precedent for verifying a JWT over a socket
  connection (passport-jwt's `AuthGuard` only works against an Express `Request`).
  Implemented as Socket.IO namespace middleware in `afterInit()` — `server.use(...)`
  verifies `socket.handshake.auth.token` via the already-registered `JwtService`
  (`jwt.secret` config, same secret as the REST guards) and rejects the connection
  before `connection` fires if invalid/missing. Sets `socket.data.user = {id, userId, name}`
  from the JWT payload, mirroring `req.user` on the REST side.
- **`joinProject` event**: client emits `{projectId}`; gateway calls project-service's
  `GET /internal/projects/:projectId/membership` (via a `getInternal()` helper, same
  pattern as voting-service → tune-service) and only `socket.join(projectId)`s if a
  member; emits `joinedProject` or `joinError` accordingly.
- **Broadcast**: `MessageService.send()` (not the controller) calls
  `gateway.broadcastMessage(projectId, data)` after creating the record, consistent
  with this repo's convention of firing side effects from the service layer. Emits
  `newMessage` to everyone in the `projectId` room, including the sender.
- **Accepted MVP limitations**: membership is checked once per `joinProject`/`send()`
  call, not re-checked per broadcast — a member removed mid-session keeps receiving
  room broadcasts until their socket reconnects (still a net improvement over before
  this change, when there was no membership enforcement anywhere in chat-service).
  Socket.IO rooms are in-process with no Redis adapter — fine for a single
  chat-service instance; broadcasts won't reach a horizontally-scaled second instance.
  `smoke-test.sh` is HTTP-only and does not exercise this WS flow.

### Local development (project-service)
```bash
cd csn-backend/project-service
docker compose up -d          # start PostgreSQL on port 5438
npx prisma migrate dev        # run migrations
npm run start:dev             # start on port 3007
```

### Local development (chat-service)
```bash
cd csn-backend/chat-service
docker compose up -d          # start PostgreSQL on port 5439
npx prisma migrate dev        # run migrations
npm run start:dev             # start on port 3008
```

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

### Local development (voting-service)
```bash
cd csn-backend/voting-service
docker compose up -d          # start PostgreSQL on port 5440
npx prisma migrate dev        # run migrations
npm run start:dev             # start on port 3009
```

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

### Local development (feed-service)
```bash
cd csn-backend/feed-service
docker compose up -d          # start PostgreSQL on port 5441
npx prisma migrate dev        # run migrations
npm run start:dev             # start on port 3010
```

### LicenseId format
- `listingId` in responses = `"LIC" + (8000 + sequenceNumber)` → e.g. `LIC8001`, `LIC8002`
- Path params not needed (listings queried by assetId, not listingId)

### ClaimId format
- `claimId` in responses = `"CLM" + (9000 + sequenceNumber)` → e.g. `CLM9001`, `CLM9002`
- Path params use the display ID; service parses: strip `CLM`, parseInt, subtract 9000, query by `sequenceNumber`

### PurchaseId format
- `purchaseId` in responses = `"PUR" + (15000 + sequenceNumber)` → e.g. `PUR15001`, `PUR15002`

### rights-service controller layout
Three controllers in one `RightsModule`:
- `MarketplaceController` (`/marketplace`) — JWT required:
  - `POST /marketplace/rights` — body `{ assetId, assetType, licenseType, territory?, term?, price }`;
    creates an `AVAILABLE` listing owned by the caller. **Added alongside the purchase-completion
    fix** — there was previously no way to create a `RightsListing` anywhere (no endpoint,
    no seed data), so `purchase()`'s old behavior of silently tolerating "no listing found"
    was the only reason the marketplace ever appeared to work. Once `purchase()` started
    requiring a real listing (to know who to credit and for how much), this endpoint became
    load-bearing, not optional.
  - `GET /marketplace/rights` — paginated listings (`?type=TUNE|SONG|VIDEO`, `?page=1&pageSize=20`)
  - `GET /marketplace/rights/my` — paginated listings owned by the caller, includes
    `soldCount` (listings with `status: SOLD`); added for the Analytics dashboard's
    "Rights Listed"/"Rights Sold" KPIs, mirroring the `GET /projects/my` convention
  - `POST /marketplace/purchase` — body `{ assetId, licenseType }`; 404 `CSN-RIGHTS-002`
    if no `AVAILABLE` listing exists for the asset; on success marks the listing
    `SOLD`, creates a `COMPLETED` `Purchase` record (with `price`/`sellerId`/`sellerUserId`
    captured from the listing — there's no real payment gateway in this codebase to
    wait on, so completion is synchronous), and fires two fire-and-forget internal calls:
    to payment-service (`POST /internal/transactions`) crediting the listing owner
    with a `MARKETPLACE_SALE` transaction, and to notification-service
    (`POST /internal/notifications`) notifying the seller
- `DrmController` (`/drm`) — JWT required:
  - `POST /drm/token` — body `{ assetId }`; stateless stub; returns `{ streamUrl: "https://cdn.csn.ai/stream/:assetId?token=<uuid>" }`
- `CopyrightController` (`/copyright`) — JWT required:
  - `POST /copyright/claims` — body `{ assetId, reason }`; creates CopyrightClaim with PENDING status
  - `GET /copyright/claims/:claimId` — returns claim detail; 404 `CSN-RIGHTS-001` if not found
- Three Prisma models: `RightsListing`, `Purchase`, `CopyrightClaim`
- DRM token generation is stateless (`randomUUID()` from Node crypto); token not persisted (MVP stub)

### Local development (rights-service)
```bash
cd csn-backend/rights-service
docker compose up -d          # start PostgreSQL on port 5442
npx prisma migrate dev        # run migrations
npm run start:dev             # start on port 3011
```

### SubscriptionId format
- `subscriptionId` in responses = `"SUB" + (10000 + sequenceNumber)` → e.g. `SUB10001`, `SUB10002`
- No path-param parsing needed (subscriptions referenced by owner userId at MVP)

### WithdrawalId format
- `withdrawalId` in responses = `"WDR" + (11000 + sequenceNumber)` → e.g. `WDR11001`, `WDR11002`
- No path-param parsing needed (withdrawals created by owner; no GET by withdrawalId at MVP)

### TransactionId format
- `transactionId` in responses = `"TXN" + (13000 + sequenceNumber)` → e.g. `TXN13001`, `TXN13002`

### payment-service controller layout
Four controllers in one `PaymentModule`:
- `SubscriptionController` (`/subscriptions`) — JWT required:
  - `POST /subscriptions` — body `{ plan: FREE|PREMIUM|PRODUCER }`; creates Subscription; plan→amount map: FREE=0, PREMIUM=499, PRODUCER=10000; also writes a `SUBSCRIPTION` `Transaction` for the same amount (same-service/same-DB, awaited directly — not fire-and-forget)
- `WebhookController` (`/payments`) — **no auth** (payment gateways don't send JWTs):
  - `POST /payments/webhook` — body `{ eventType, payload }`; persists WebhookEvent; returns standard success envelope
- `RevenueController` (`/revenues`) — JWT required:
  - `GET /revenues/dashboard` — real aggregation: `totalRevenue = SUBSCRIPTION + MARKETPLACE_SALE` transaction sums for the caller; also returns `growthPercent` (this calendar month's transaction sum vs. last month's, via a second `_sum` scoped by `createdAt`) and `revenueBreakdown: { subscriptions, marketplaceSales }` for the Analytics dashboard; `royalties` and `contestWins` stay hardcoded 0 — no royalty-distribution or contest/prize feature exists anywhere in this codebase to generate them from
  - `POST /revenues/withdraw` — body `{ amount, bankAccountId }`; creates WithdrawalRequest with PENDING status
- `InternalTransactionController` (`/internal/transactions`) — `POST /` (service-to-service
  only, guarded by `InternalAuthGuard`, not JWT). Called fire-and-forget by
  rights-service when a marketplace purchase completes.
- Four Prisma models: `Subscription`, `WebhookEvent`, `WithdrawalRequest`, `Transaction`

### Local development (payment-service)
```bash
cd csn-backend/payment-service
docker compose up -d          # start PostgreSQL on port 5443
npx prisma migrate dev        # run migrations
npm run start:dev             # start on port 3012
```

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
  - voting-service, on vote cast for a `TUNE` entity (`VOTE_RECEIVED`) — see the exception noted in "Internal service-to-service auth" below

### Local development (notification-service)
```bash
cd csn-backend/notification-service
docker compose up -d          # start PostgreSQL on port 5444
npx prisma migrate dev        # run migrations
npm run start:dev             # start on port 3013
```

### JWT_SECRET alignment requirement
All service `.env` files must use the **same** `JWT_SECRET` value as identity-service. The `.env.example` templates ship with a placeholder (`your-jwt-secret-change-in-production`) which is **not** the real dev secret — replace it when creating a new service `.env`. If a service keeps returning 401 on valid tokens, a mismatched JWT_SECRET is the first thing to check.

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
A local script `smoke-test.sh` (project root, **not committed**) exercises all 44 endpoints across all 12 services in workflow order (register → login → tune → lyrics → performance → video → project → chat → vote → feed → rights → payment → logout). It chains IDs between services, checks PASS/FAIL per endpoint, and exits 1 if anything fails. Run it with all 12 services up to verify the full integration:
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

