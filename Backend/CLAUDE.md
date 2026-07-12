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
- `POST /projects` — create project (JWT required)
- `POST /projects/:projectId/invite` — invite collaborator (JWT required; owner check in service layer)
- `GET /projects/:projectId/members` — list project members (JWT required)
- `GET /projects/:projectId/files` — list project files (JWT required; stub — returns `[]`)

### chat-service controller layout
Single `MessageController` at `/projects`:
- `POST /projects/:projectId/messages` — send message (JWT required)
- `GET /projects/:projectId/messages` — paginated message history (JWT required)
- `projectId` stored as a string reference (no cross-service FK validation at MVP)

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
Single `FeedController` at `/feed` — all three endpoints require JWT:
- `GET /feed/home` — home feed (paginated stub, `?page=1&pageSize=20`)
- `GET /feed/trending` — trending content (paginated stub)
- `GET /feed/recommended` — recommended content (paginated stub)
- No DB writes at MVP; `PrismaService` omitted; schema has datasource + generator only (no models)
- Full implementation would consume events from all upstream services

### Local development (feed-service)
```bash
cd csn-backend/feed-service
docker compose up -d          # start PostgreSQL on port 5441
npm run start:dev             # start on port 3010
# no prisma migrate needed — schema has no models
```

### LicenseId format
- `listingId` in responses = `"LIC" + (8000 + sequenceNumber)` → e.g. `LIC8001`, `LIC8002`
- Path params not needed (listings queried by assetId, not listingId)

### ClaimId format
- `claimId` in responses = `"CLM" + (9000 + sequenceNumber)` → e.g. `CLM9001`, `CLM9002`
- Path params use the display ID; service parses: strip `CLM`, parseInt, subtract 9000, query by `sequenceNumber`

### rights-service controller layout
Three controllers in one `RightsModule`:
- `MarketplaceController` (`/marketplace`) — JWT required:
  - `GET /marketplace/rights` — paginated listings (`?type=TUNE|SONG|VIDEO`, `?page=1&pageSize=20`)
  - `POST /marketplace/purchase` — body `{ assetId, licenseType }`; creates Purchase record + marks listing PENDING
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

### payment-service controller layout
Three controllers in one `PaymentModule`:
- `SubscriptionController` (`/subscriptions`) — JWT required:
  - `POST /subscriptions` — body `{ plan: FREE|PREMIUM|PRODUCER }`; creates Subscription; plan→amount map: FREE=0, PREMIUM=499, PRODUCER=10000
- `WebhookController` (`/payments`) — **no auth** (payment gateways don't send JWTs):
  - `POST /payments/webhook` — body `{ eventType, payload }`; persists WebhookEvent; returns standard success envelope
- `RevenueController` (`/revenues`) — JWT required:
  - `GET /revenues/dashboard` — stub returning `{ totalRevenue:0, royalties:0, marketplaceSales:0, contestWins:0 }` (no cross-service aggregation at MVP)
  - `POST /revenues/withdraw` — body `{ amount, bankAccountId }`; creates WithdrawalRequest with PENDING status
- Three Prisma models: `Subscription`, `WebhookEvent`, `WithdrawalRequest`

### Local development (payment-service)
```bash
cd csn-backend/payment-service
docker compose up -d          # start PostgreSQL on port 5443
npx prisma migrate dev        # run migrations
npm run start:dev             # start on port 3012
```

### JWT_SECRET alignment requirement
All service `.env` files must use the **same** `JWT_SECRET` value as identity-service. The `.env.example` templates ship with a placeholder (`your-jwt-secret-change-in-production`) which is **not** the real dev secret — replace it when creating a new service `.env`. If a service keeps returning 401 on valid tokens, a mismatched JWT_SECRET is the first thing to check.

### Smoke test
A local script `smoke-test.sh` (project root, **not committed**) exercises all 44 endpoints across all 12 services in workflow order (register → login → tune → lyrics → performance → video → project → chat → vote → feed → rights → payment → logout). It chains IDs between services, checks PASS/FAIL per endpoint, and exits 1 if anything fails. Run it with all 12 services up to verify the full integration:
```bash
./smoke-test.sh
```
Notes: each run registers a fresh user (unique email + mobile derived from `date +%s`). Idempotent — safe to run repeatedly.

## What to Build Next

All services in the MVP build order are complete. No pending services remain.

## ---- DON'T EDIT THIS PART ----
### THINGS TO BE DONE AUTOMATICALLY AFTER COMPLETION OF EVERY FEATURE:
From now on, keep `CLAUDE.md` continuously updated — every time a meaningful decision is made, a service is completed, a convention is established, or a pending issue is identified, update `CLAUDE.md` immediately without waiting for me to ask. After every service completion, stage all changes, verify with git diff --staged that only files belonging to the current service are included in the commit, and push to GitHub with a meaningful commit message. Never bundle files from other services into a commit — if unrelated files show up in the diff, unstage them before committing. Clean, traceable commits per service, every time.