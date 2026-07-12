# CSN App: Frontend ↔ Backend Integration Plan

## Context

The CSN app currently exists as two independently-built, fully disconnected codebases living side by side:

- `Frontend/` — an Expo/React Native app. The user has personally tested this on their physical phone (via Expo Go/dev build) and confirmed the UI works standalone.
- `Backend/` — was pushed to a separate repo, then its contents were copied into this folder. It is **not Spring Boot** (as initially assumed) but **12 independent NestJS + TypeScript microservices**, each with its own Prisma-managed Postgres database, confirmed complete per `Backend/CLAUDE.md`.

Neither side has ever talked to the other. The frontend has `axios`, `@tanstack/react-query`, and `zustand` installed but **completely unused** — every screen is static UI with `Alert.alert(...)` stand-ins for real submit/fetch logic, no API client, no env config, no token storage. The job now is to wire the two together so the app actually works end-to-end against live data.

This is a large integration (12 services, ~24 screens), so the plan is phased: build the API/auth foundation first (since every other feature needs a valid JWT), then wire feature areas in dependency order, verifying on the physical device at each phase gate — matching how the user already tests.

**Two pre-existing frontend bugs surfaced during investigation, addressed in the plan below:**
- `LoginScreen.tsx` navigates to a `"SignUp"` route that doesn't exist in `AppNavigator.tsx` — dangling link.
- `RoleSelectionScreen.tsx` currently runs **after** login and just does `navigation.replace("Main")` — but the backend's `RegisterDto.roles` is **required at registration**, not selectable post-login. The screen's placement is backwards relative to how the backend works.

**New scope surfaced (not pure "wiring")**: `UploadTuneScreen.tsx`, `SingerStudioScreen.tsx`, and `DirectorStudioScreen.tsx` have zero file-picker/recording UI today — all "upload"/"record" boxes are static with no `onPress`, and their submit handlers are `Alert.alert` stubs only. No `expo-document-picker`/`expo-av`/`expo-image-picker` are installed. Real picker UI has to be built, not just connected.

**Decisions confirmed with user:**
- Voice capture (`SingerStudioScreen`) will be **file-upload only** for now — no in-app recording. `expo-document-picker` covers tune, voice, and mood-board uploads; no `expo-av`/`expo-audio` needed.
- The SignUp flow fix (moving role selection into registration) is approved as proposed.

---

## Guiding architecture decisions

- **No API gateway** (12 services on ports 3001–3012, no discovery/gateway exists). Frontend keeps a service→port map and builds one axios instance per service. A gateway is noted as a future improvement, not built now.
- **CORS**: every service's `main.ts` hardcodes `app.enableCors({ origin: 'http://localhost:5173' })` (Vite leftover). Change to `origin: true` for dev — a mobile app's request doesn't carry a meaningful browser `Origin` to whitelist. Applies identically across all 12 `main.ts` files.
- **Base URL**: new `EXPO_PUBLIC_API_HOST` env var (e.g. `http://192.168.1.42`), read via Expo's built-in `EXPO_PUBLIC_*` inlining. **Critical**: the frontend runs on a physical phone, so `localhost` will not resolve to the dev machine — must use the machine's LAN IP. Document this (network changes require updating the env var).
- **Token storage**: `expo-secure-store` (new dependency, Expo-Go-compatible) — not AsyncStorage.
- **State split**: `zustand` → auth session only (token, refreshToken, user) — small, synchronous, needed by the axios interceptor. `react-query` → all server data (tunes, profiles, feed, etc.), giving loading/error/cache/refetch for free.
- **Response envelope**: backend returns `{ status: "SUCCESS"|"ERROR", message, data? }` (or `errorCode` on error) on almost everything, with one exception: `register`/`login`/`refresh-token` responses put fields at the **root**, not nested in `data`. A shared `unwrap()` helper handles the common case; auth calls are handled as a documented exception.
- **IDs**: backend entities use display IDs like `TUN1001`, `LYR2001`, `USR000001` — these (not raw UUIDs) are what path params expect and what the frontend should store/pass around.

---

## API client architecture (build first — everything else depends on it)

`Frontend/src/config/services.ts` — service→port map + `serviceBaseUrl(name)` helper using `EXPO_PUBLIC_API_HOST`.

`Frontend/src/api/envelope.ts` — `unwrap()` helper: returns `data` on `SUCCESS`, throws (with `errorCode` attached) on `ERROR`.

`Frontend/src/store/authStore.ts` — zustand store: `token`, `refreshToken`, `user`, `isHydrated`; `hydrate()` reads SecureStore on boot; `setSession()`/`logout()` write/clear SecureStore + state. **Gotcha to design around**: avoid a circular import between this store and the API client — do the refresh-token HTTP call inside the store via a bare (non-intercepted) axios call, not through the shared `identityApi` client.

`Frontend/src/api/client.ts` — `createServiceClient(service)` factory: one axios instance per backend service, each with:
- request interceptor injecting `Authorization: Bearer <token>` from `authStore`
- response interceptor: on `401`, attempt one token refresh via `authStore`, retry once, else force logout

Exports one named client per service (`identityApi`, `profileApi`, `tuneApi`, ... 12 total).

`Frontend/src/api/services/<service>.api.ts` — one file per backend service (12 total), thin typed functions per endpoint. `auth.api.ts` is the one that does **not** use `unwrap()` (root-level fields per the envelope exception). Multipart uploads (tune audio, profile photo, video) use React Native's `FormData` shape — `{ uri, name, type }` objects, not browser `Blob`s.

`Frontend/src/hooks/<domain>/use*.ts` — one react-query hook per API call (`useLogin`, `useMyTunes`, `useUploadTune`, ...). Query keys follow `[service, resource, id?]` (e.g. `['tune', 'my']`) so mutations can `invalidateQueries` cleanly.

`Frontend/App.tsx` — wrap in `QueryClientProvider`; call `authStore.hydrate()` on mount; gate initial navigation route on hydration/token state.

---

## Phase 0 — Infra scaffolding

**Goal**: providers wired, env-driven base URLs, backend reachable from the phone, no behavior change yet.

**Frontend new files**: `.env` + `.env.example` (`EXPO_PUBLIC_API_HOST=...`), `src/config/services.ts`, `src/api/envelope.ts`, `src/api/client.ts`, `src/store/authStore.ts` (hydrate-only for now).
**Frontend modify**: `App.tsx` (QueryClientProvider + hydrate call).
**Frontend cleanup** (do now, low risk, confirmed unused): delete `Frontend/package-generated.json` (stale unrelated boilerplate — different app name/deps); delete `Frontend/src/app/` (dead expo-router scaffold, zero real imports, actual navigation goes through `AppNavigator.tsx`).
**New dependency**: `npx expo install expo-secure-store expo-document-picker expo-image-picker`.

**Backend modify** (identical change × 12): in each `Backend/<service>/src/main.ts`, replace
```ts
app.enableCors({ origin: 'http://localhost:5173' });
```
with
```ts
app.enableCors({ origin: true }); // dev: mobile app has no meaningful browser Origin; harden via CORS_ORIGIN env before real deployment
```
Apply to `identity-service, profile-service, tune-service, lyrics-service, voice-service, video-service, project-service, chat-service, voting-service, feed-service, rights-service, payment-service`.

**New local orchestration**: `Backend/scripts/dev-up.sh` / `dev-down.sh` looping over the 12 service dirs (`docker compose up -d && npx prisma migrate dev && npm run start:dev`, backgrounded with per-service logs) — replaces manually running commands in 12 folders. A single merged root `docker-compose.yml` is a nicer end state but risks container/network name collisions across the 12 independently-authored compose files; defer that consolidation, start with the script.

**Verify**: `dev-up.sh` brings up all 12 services (confirm each log shows "running on port 30xx"); from the phone (same Wi-Fi), confirm reachability (`curl http://<LAN-IP>:3001/...` from another machine, or trigger a request from the Expo app); confirm `SecureStore` round-trips.

---

## Phase 1 — Auth (identity-service)

**Goal**: real register/login/logout, JWT persisted across restarts, unblocks every other phase.

**Flow fix**: roles are required at registration, so move role selection into the **register** flow, not post-login:
- New `Frontend/src/screens/auth/SignUpScreen.tsx` — collects `fullName/email/mobile/password`, navigates to `RoleSelection` with the draft (fixes the dangling `"SignUp"` link from `LoginScreen.tsx`).
- `RoleSelectionScreen.tsx` modify: "Continue" maps its 6 local role cards → backend `Role` enum (`COMPOSER/LYRICIST/SINGER/DIRECTOR/PRODUCER/AUDIENCE`), calls `authApi.register({...draft, roles})`, navigates to `Login` on success (not `Main`).
- `LoginScreen.tsx` modify: `handleLogin` calls `useLogin()`, adds pending/error state, `navigation.replace("Main")` on success.
- `AppNavigator.tsx` modify: register the new `SignUp` screen; branch `initialRouteName` on auth state (valid token → `Main`, else `Login`).

**New files**: `src/api/services/auth.api.ts`, `src/hooks/auth/useLogin.ts`, `useRegister.ts`, `useLogout.ts`.

**Verify on device**: register a fresh user → confirm success + `USR000xxx` id; login → confirm token persists across app kill/reopen (lands on `Main` directly); logout → confirm SecureStore cleared; as a cross-service check, use the stored token against one other service's endpoint (e.g. `GET /profiles/:userId`) to confirm the shared `JWT_SECRET` validates cross-service before Phase 2 builds on it.

---

## Phase 2 — Core creator flows (profile, tune, lyrics, voice, video)

**Goal**: profile view/edit/photo/follow; tune upload/list/detail/analyze; lyrics generate/create/approve; voice performance capture/analyze; video project/upload/storyboard.

**Pattern, repeat per service** (`<service>.api.ts` + `src/hooks/<domain>/use*.ts`, wired into the matching screen):
- `profile.api.ts` → `CreatorProfileScreen.tsx` — `GET/PUT /profiles/:userId`, `POST /profiles/:userId/photo` (multipart), `POST/DELETE /users/:userId/follow`, `GET /users/:userId/followers`
- `tune.api.ts` → `UploadTuneScreen.tsx` (`POST /tunes`, multipart `audio` field), `ComposerDashboardScreen.tsx` (`GET /tunes/my`), `TuneDetailScreen.tsx` (`GET/DELETE /tunes/:tuneId`, `POST /tunes/:tuneId/analyze`)
- `lyrics.api.ts` → `LyricsSubmissionScreen.tsx` — `GET /tunes/:tuneId/lyrics`, `POST /ai/lyrics/generate`, `POST /lyrics`, `PUT /lyrics/:lyricsId`, `POST /lyrics/:lyricsId/approve`
- `voice.api.ts` → `SingerStudioScreen.tsx` — `POST /performances`, `GET /performances/my`, `GET /performances/:id`, `POST /performances/:id/analyze`
- `video.api.ts` → `DirectorStudioScreen.tsx` — `POST /video-projects`, `POST /videos` (multipart), `GET /videos/:videoId`, `POST /ai/storyboards`

**New scope, build not just wire** (confirmed by reading these screens — all three have static placeholder boxes with no `onPress`, and `Alert.alert`-only submit handlers today):
- `UploadTuneScreen.tsx`: needs real audio file selection — add `expo-document-picker`, replace the static upload box with a working picker, wire `handlePublish` to `POST /tunes` with the picked file as RN `FormData`.
- `SingerStudioScreen.tsx`: file-upload only (confirmed with user — no in-app recording for now). Replace the "Upload File" box with `expo-document-picker`; drop/repurpose the "Record Voice" button (either remove it or relabel it to point at the same picker) since no recording library will be installed.
- `DirectorStudioScreen.tsx`: needs a working "Upload Mood Board/Reference" picker — `expo-image-picker` for images.
- `CreatorProfileScreen.tsx` photo upload: `expo-image-picker`.

Use returned display IDs (`TUN1001`, `LYR2001`, `PER3001`, `VID1001`, `VPR4001`) as path params for chained calls (e.g. attach lyrics to a tune), per the backend's ID convention.

**Verify on device**, per sub-flow: real file picked → uploads → appears in the "my X" list via a live GET → open detail → delete → disappears from list. Repeat for tune, then lyrics (against a real tune), then voice, then video project + upload.

---

## Phase 3 — Collaboration/social (project, chat, voting, feed)

- `project.api.ts` → `ProjectWorkspaceScreen.tsx` — `POST /projects`, `POST /projects/:id/invite`, `GET /projects/:id/members`; `GET /projects/:id/files` is a documented backend stub returning `[]` — render as an empty state, not an error.
- `chat.api.ts` → messaging UI inside `ProjectWorkspaceScreen.tsx` — `POST/GET /projects/:projectId/messages`. No websocket exists on the backend; use react-query `refetchInterval` polling rather than expecting push updates — an MVP backend limitation, not a frontend bug.
- `voting.api.ts` → `VotingScreen.tsx` — `POST /votes`, `GET /votes/results/:entityId`.
- `feed.api.ts` → `HomeFeedScreen.tsx` — `GET /feed/home|trending|recommended`. **These are documented empty-data stubs** on the backend (no DB writes yet) — the screen will call successfully (200) but show an empty/placeholder feed. This is expected, not a sign of broken integration.

**Verify**: create a project, invite a second registered test user, exchange messages (confirm polling picks up new messages), cast a vote and confirm rank/count changes, confirm feed screens render a clean empty state rather than erroring.

---

## Phase 4 — Monetization (rights, payment)

- `rights.api.ts` → `RightsMarketplaceScreen.tsx` (`GET /marketplace/rights`, paginated), `RightsDetailScreen.tsx` (`POST /marketplace/purchase`, `POST /drm/token`, `POST/GET /copyright/claims`).
- `payment.api.ts` → `SubscriptionPlansScreen.tsx` (`POST /subscriptions`), `WalletPaymentsScreen.tsx`/`RevenueDashboardScreen.tsx` (`GET /revenues/dashboard` — stub, always zeros; `POST /revenues/withdraw`). `POST /payments/webhook` is gateway-only and is never called from the app.

**Verify**: browse listings, purchase one, subscribe to a plan, confirm the revenue dashboard shows the documented zero-stub (not an error), request a withdrawal and confirm `PENDING` status is returned.

---

## Phase 5 — Polish and final pass

- `NotificationsCenterScreen`, `SettingsPreferencesScreen`, `AnalyticsDashboardScreen` map to **none** of the 44 documented backend endpoints — flag explicitly and leave static/mocked; wiring these would need new backend work, out of scope here.
- Cleanup pass: confirm no leftover references to the deleted `Frontend/src/app/`/`package-generated.json`; walk every wired screen once end-to-end on-device.
- Backend regression gate: use/recreate `smoke-test.sh` (register → login → tune → lyrics → performance → video → project → chat → vote → feed → rights → payment → logout, per `Backend/CLAUDE.md`) to fast-check all 12 services after backend edits, independent of the device.

---

## Verification strategy

- **Backend-only, fast loop**: `dev-up.sh` + `smoke-test.sh` after any backend change (e.g. the 12 CORS edits) — no device needed, catches regressions in seconds.
- **Integration, authoritative**: each phase's real gate is exercising the actual flow on the physical device (matching how the user already tests), since the LAN-IP-vs-localhost issue only shows up there. Simulator is fine for faster UI iteration but isn't the gate.
- **Recurring friction to document**: `EXPO_PUBLIC_API_HOST` must be updated whenever the dev machine's Wi-Fi network/IP changes — worth a short `Frontend/docs/LOCAL_DEV.md` note (e.g. `ipconfig getifaddr en0` on macOS to find the current LAN IP).

**Explicitly out of scope for now**: introducing an API gateway in front of the 12 services (would collapse the 12-entry base-URL map to one origin and simplify CORS/auth) — worth revisiting once this phased integration is stable, not before.

### Critical files
- `Frontend/src/api/client.ts` (new) — per-service axios instances + auth interceptor; foundation every later phase depends on
- `Frontend/src/store/authStore.ts` (new) — session persistence; gates navigation and every authenticated call
- `Frontend/src/navigation/AppNavigator.tsx` (modify) — add `SignUp` screen, auth-gated initial route
- `Frontend/src/screens/auth/LoginScreen.tsx`, `RoleSelectionScreen.tsx` (modify) — real register/login wiring, role-enum mapping, fixes the register/role-selection ordering bug
- `Backend/identity-service/src/main.ts` (modify, pattern repeats identically across all 12 services) — CORS fix
