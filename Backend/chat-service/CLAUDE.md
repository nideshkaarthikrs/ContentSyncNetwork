# chat-service — CLAUDE.md

### MessageId format
- `messageId` in responses = `"MSG" + (6000 + sequenceNumber)` → e.g. `MSG6001`, `MSG6002`
- Path params use the display ID; service parses: strip `MSG`, parseInt, subtract 6000, query by `sequenceNumber`

### chat-service controller layout
Single `MessageController` at `/projects`:
- `POST /projects/:projectId/messages` — send message (JWT required); now also checks
  the sender is a project member via a synchronous internal `GET` to project-service's
  `/internal/projects/:projectId/membership` (403 `CSN-CHAT-001` if not), then broadcasts
  the created message over the `MessageGateway` (see below) before returning
- `GET /projects/:projectId/messages` — paginated message history (JWT required; the
  read path also checks membership via the same internal call, 403 `CSN-CHAT-002`
  for non-members)
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

### Local development
DB on port 5439, reachable at `http://localhost:${GATEWAY_PORT:-8080}/chat/` through the gateway. Run via the root Compose stack (see `Backend/CLAUDE.md`) — no per-service `docker-compose.yml`.
