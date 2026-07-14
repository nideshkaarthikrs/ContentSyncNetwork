# ContentSyncNetwork (CSN)

CSN is a collaboration platform for music and content creators — composers, lyricists, vocalists, video editors, and producers — to team up on projects, share and vote on work, chat in real time, license/sell rights to finished assets, and manage payouts.

The system is split into an independently deployable **microservices backend** and a **React Native (Expo) mobile app**.

## Repository structure

```
.
├── Backend/     # 13 NestJS microservices (one per domain)
└── Frontend/    # Expo / React Native mobile app
```

## Backend

Each service in `Backend/` is a standalone NestJS app with its own PostgreSQL database, Prisma schema, and `.env`.

| Service | Responsibility | Port |
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

**Running a service locally:**

```bash
cd Backend/<service-name>
cp .env.example .env        # fill in real values
docker compose up -d        # start the service's PostgreSQL container
npx prisma migrate dev      # run migrations
npm install
npm run start:dev
```

Services communicate with each other over internal HTTP endpoints guarded by a shared `INTERNAL_SERVICE_SECRET` (no message queue/event bus). All services must share the same `JWT_SECRET`.

## Frontend

`Frontend/` is an Expo-managed React Native app (TypeScript) targeting Android and iOS.

```bash
cd Frontend
cp .env.example .env        # point at your backend API base URL
npm install
npx expo start
```

Build for Android/iOS via [EAS Build](https://docs.expo.dev/build/introduction/) (`eas build`) ahead of Play Store / App Store submission.

## Environment & secrets

Every service and the mobile app ship a `.env.example` describing required variables. Actual `.env` files are never committed — copy the example and fill in real secrets locally or in your deployment environment.
