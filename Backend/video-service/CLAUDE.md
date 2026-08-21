# video-service — CLAUDE.md

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

### Local development
DB on port 5437, reachable at `http://localhost:${GATEWAY_PORT:-8080}/video/` through the gateway. Run via the root Compose stack (see `Backend/CLAUDE.md`) — no per-service `docker-compose.yml`.
