# project-service — CLAUDE.md

### ProjectId format
- `projectId` in responses = `"PRJ" + (5000 + sequenceNumber)` → e.g. `PRJ5001`, `PRJ5002`

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
  `ServeStaticModule` at `/uploads/*` (project-, profile-, and tune-service have
  this; `/uploads/*` is unauthenticated by design — filenames are the only
  secret, so don't store anything sensitive there). All five upload services
  mount a named `*_uploads` Docker volume at `/app/uploads` so files survive
  container recreation, and every `FileInterceptor` enforces a size limit and
  a MIME filter (HTML/SVG are rejected everywhere they'd be served same-origin)
- `InternalProjectController` at `/internal/projects` — `GET /:projectId/membership?userId=&userDisplayId=`
  (service-to-service only, guarded by `InternalAuthGuard`), returns `{ isMember: boolean }`.
  The owner/accepted-member check previously inlined only in `uploadFile()` is now a
  reusable `ProjectService.isMember()`/`checkMembership()` pair. Added so chat-service
  can authorize socket room joins and message sends — see chat-service's `CLAUDE.md`
  ("chat-service controller layout") and `Backend/CLAUDE.md` ("Internal service-to-service auth").

### FileId format
- `fileId` in responses = `"PFL" + (14000 + sequenceNumber)` → e.g. `PFL14001`, `PFL14002`

### Local development
DB on port 5438, reachable at `http://localhost:${GATEWAY_PORT:-8080}/project/` through the gateway. Run via the root Compose stack (see `Backend/CLAUDE.md`) — no per-service `docker-compose.yml`.
