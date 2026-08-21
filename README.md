# ContentSyncNetwork (CSN)

CSN is a collaboration platform for music and content creators — composers, lyricists, vocalists, video editors, and producers — to team up on projects, share and vote on work, chat in real time, license/sell rights to finished assets, and manage payouts.

The system is split into an independently deployable **microservices backend** and a **React Native mobile app** (bare CLI, Android + iOS).

## Repository structure

```
.
├── Backend/     # 13 NestJS microservices (one per domain)
└── Frontend/    # React Native (bare CLI) mobile app
```

## Backend

Each service in `Backend/` is a standalone NestJS app with its own PostgreSQL database, Prisma schema, and `.env`. All 13 run behind a single **nginx gateway** (`http://localhost:8080` by default) — from outside Docker, that's the *only* port you ever talk to; each service is reached through it by path prefix (`/identity/...`, `/tune/...`, etc.) rather than its own port. The "Internal port" column below is where each service listens *inside* the Docker network only — it's not reachable directly unless you run that one service bare-metal (see below).

| Service | Responsibility | Internal port |
|---|---|---|
| identity-service | Auth, registration, JWT | 3001 |
| profile-service | User profiles, follows | 3002 |
| tune-service | Music track uploads | 3003 |
| lyrics-service | Lyrics submission & approval | 3004 |
| voice-service | Vocal performance uploads | 3005 |
| video-service | Video projects & uploads | 3006 |
| project-service | Collaboration projects, members, files | 3007 |
| chat-service | Real-time project chat (Socket.IO) | 3008 |
| voting-service | Voting on entries | 3009 |
| feed-service | Home / trending / recommended feed | 3010 |
| rights-service | Rights marketplace, DRM, copyright claims | 3011 |
| payment-service | Subscriptions, revenue, withdrawals | 3012 |
| notification-service | In-app notifications | 3013 |

**Stack:** NestJS + TypeScript, Prisma ORM, PostgreSQL (one DB per service), JWT auth (`@nestjs/jwt` + `passport-jwt`), `class-validator` DTOs.

### Running the backend

One-time setup — each service needs its own `.env` (never committed):

```bash
cd Backend
for d in identity profile tune lyrics voice video project chat voting feed rights payment notification; do
  cp "${d}-service/.env.example" "${d}-service/.env"
done
```

Fill in real secrets in each `.env`. At minimum, `JWT_SECRET` and `INTERNAL_SERVICE_SECRET` must be **identical across all 13 files** — services use them to authenticate requests to each other.

Start everything (builds images, runs migrations, starts all services + DBs + gateway with hot reload):

```bash
./scripts/dev-up.sh
```

```
Gateway:     http://localhost:8080
Status:      docker compose -f docker-compose.yml -f docker-compose.dev.yml ps
Tail logs:   docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f [service]
```

Stop everything (add `-v` to also wipe DB volumes):

```bash
./scripts/dev-down.sh [-v]
```

Verify the whole stack end-to-end (register → login → tune → lyrics → … → notifications, one request per service):

```bash
./smoke-test.sh   # requires curl + jq, and the stack already running
```

<details>
<summary>Running a single service bare-metal (without Docker)</summary>

```bash
cd Backend/<service-name>
cp .env.example .env                              # edit DATABASE_URL etc. for localhost
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=csn_pass -e POSTGRES_USER=csn -e POSTGRES_DB=csn_<service> postgres:16-alpine
npx prisma migrate dev
npm install
npm run start:dev
```

Note this bypasses the gateway — the service is only reachable on its own port, and any calls it makes to other services need their `*_SERVICE_URL` env vars pointed at wherever those are running.
</details>

## Frontend

`Frontend/` is a bare React Native CLI app (TypeScript, RN 0.81.5) targeting Android and iOS — no Expo SDK, no EAS. Native `android/` and `ios/` projects are checked into the repo and are the source of truth for permissions/build config.

```bash
cd Frontend
cp .env.example .env
npm install
cd ios && bundle install && bundle exec pod install && cd ..
npm run android   # or: npm run ios
```

Edit `.env` and set `API_HOST` to your dev machine's **LAN IP** + the gateway port (e.g. `http://192.168.1.41:8080`) — if you're testing on a physical phone, `localhost` won't resolve to your dev machine. Find your LAN IP with `ipconfig getifaddr en0` (macOS) or `ipconfig` (Windows). Unlike the old Expo/Metro setup, changing `.env` requires a native rebuild (Android: re-run `npm run android`, occasionally `cd android && ./gradlew clean` first; iOS: re-run `pod install` then `npm run ios`) — a Metro restart alone won't pick it up.

Build release artifacts directly via Xcode (Archive) and `cd android && ./gradlew assembleRelease` / `bundleRelease`, same as any bare React Native app — there is no EAS Build step anymore.

## Running the full stack locally

1. Bootstrap and start the backend (see [Running the backend](#running-the-backend) above): `./Backend/scripts/dev-up.sh`. Confirm it's up with `docker compose -f Backend/docker-compose.yml -f Backend/docker-compose.dev.yml ps` (all services should show `Up`), or run `./Backend/smoke-test.sh` for an end-to-end check.
2. Find your machine's LAN IP and put it in `Frontend/.env` as `API_HOST=http://<your-lan-ip>:8080`.
3. `cd Frontend && npm install && (cd ios && bundle install && bundle exec pod install) && npm run android` (or `npm run ios`).
4. When done: `./Backend/scripts/dev-down.sh` (backend), `Ctrl+C` (Metro).

## Environment & secrets

Every service and the mobile app ship a `.env.example` describing required variables. Actual `.env` files are never committed — copy the example and fill in real secrets locally or in your deployment environment. See [Running the backend](#running-the-backend) for the specific vars (`JWT_SECRET`, `INTERNAL_SERVICE_SECRET`) that must match across all services.
