#!/usr/bin/env bash
# Exercises all 13 CSN backend services end-to-end in workflow order:
# register -> login -> tune -> lyrics -> performance -> video -> project -> chat -> vote -> feed -> rights -> payment -> notifications -> logout.
# Requires all 13 services running locally (see scripts/dev-up.sh) and curl + jq installed.
# Idempotent: registers a fresh user each run, so it's safe to re-run without cleanup.
set -uo pipefail

HOST="http://localhost"
PASS=0
FAIL=0
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

check() {
  local name="$1" expected="$2" actual="$3"
  if [ "$actual" = "$expected" ]; then
    echo "PASS  $name"
    PASS=$((PASS + 1))
  else
    echo "FAIL  $name (expected $expected, got $actual)"
    FAIL=$((FAIL + 1))
  fi
}

TS=$(date +%s)
EMAIL="smoketest_${TS}@csn.dev"
MOBILE="9${TS: -9}"
PASSWORD="Passw0rd!"

echo "== identity-service =="

REGISTER=$(curl -s -o "$TMP_DIR/reg.json" -w "%{http_code}" -X POST "$HOST:3001/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"fullName\":\"Smoke Test\",\"email\":\"$EMAIL\",\"mobile\":\"$MOBILE\",\"password\":\"$PASSWORD\",\"roles\":[\"COMPOSER\",\"SINGER\",\"DIRECTOR\",\"LYRICIST\"]}")
check "POST /auth/register" 201 "$REGISTER"
USER_ID=$(jq -r '.userId' "$TMP_DIR/reg.json")

LOGIN=$(curl -s -o "$TMP_DIR/login.json" -w "%{http_code}" -X POST "$HOST:3001/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
check "POST /auth/login" 200 "$LOGIN"
TOKEN=$(jq -r '.token' "$TMP_DIR/login.json")
REFRESH=$(jq -r '.refreshToken' "$TMP_DIR/login.json")

REFRESHED=$(curl -s -o "$TMP_DIR/refresh.json" -w "%{http_code}" -X POST "$HOST:3001/auth/refresh-token" \
  -H "Content-Type: application/json" -d "{\"refreshToken\":\"$REFRESH\"}")
check "POST /auth/refresh-token" 200 "$REFRESHED"
TOKEN=$(jq -r '.token' "$TMP_DIR/refresh.json")
AUTH="Authorization: Bearer $TOKEN"

CHANGE_PASSWORD=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH "$HOST:3001/auth/change-password" \
  -H "$AUTH" -H "Content-Type: application/json" \
  -d "{\"currentPassword\":\"$PASSWORD\",\"newPassword\":\"${PASSWORD}New\"}")
check "PATCH /auth/change-password" 200 "$CHANGE_PASSWORD"
PASSWORD="${PASSWORD}New"

RELOGIN=$(curl -s -o "$TMP_DIR/relogin.json" -w "%{http_code}" -X POST "$HOST:3001/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
check "POST /auth/login (with changed password)" 200 "$RELOGIN"
TOKEN=$(jq -r '.token' "$TMP_DIR/relogin.json")
AUTH="Authorization: Bearer $TOKEN"

# A second "recipient" user — needed to exercise the FOLLOW/INVITE notifications below,
# which need a real distinct recipient (following/inviting yourself is rejected).
RECIPIENT_EMAIL="smoketest_recipient_${TS}@csn.dev"
RECIPIENT_MOBILE="8${TS: -9}"
RECIPIENT_REGISTER=$(curl -s -o "$TMP_DIR/recipient_reg.json" -w "%{http_code}" -X POST "$HOST:3001/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"fullName\":\"Smoke Recipient\",\"email\":\"$RECIPIENT_EMAIL\",\"mobile\":\"$RECIPIENT_MOBILE\",\"password\":\"$PASSWORD\",\"roles\":[\"SINGER\"]}")
check "POST /auth/register (recipient)" 201 "$RECIPIENT_REGISTER"
RECIPIENT_USER_ID=$(jq -r '.userId' "$TMP_DIR/recipient_reg.json")

RECIPIENT_LOGIN=$(curl -s -o "$TMP_DIR/recipient_login.json" -w "%{http_code}" -X POST "$HOST:3001/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$RECIPIENT_EMAIL\",\"password\":\"$PASSWORD\"}")
check "POST /auth/login (recipient)" 200 "$RECIPIENT_LOGIN"
RECIPIENT_TOKEN=$(jq -r '.token' "$TMP_DIR/recipient_login.json")
RECIPIENT_AUTH="Authorization: Bearer $RECIPIENT_TOKEN"

echo "== profile-service =="

PROFILE=$(curl -s -o /dev/null -w "%{http_code}" "$HOST:3002/profiles/$USER_ID" -H "$AUTH")
check "GET /profiles/:userId" 200 "$PROFILE"

UPDATE_PROFILE=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$HOST:3002/profiles/$USER_ID" \
  -H "$AUTH" -H "Content-Type: application/json" -d '{"bio":"Smoke test bio"}')
check "PUT /profiles/:userId" 200 "$UPDATE_PROFILE"

FOLLOWERS=$(curl -s -o /dev/null -w "%{http_code}" "$HOST:3002/users/$USER_ID/followers")
check "GET /users/:userId/followers" 200 "$FOLLOWERS"

FOLLOW=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$HOST:3002/users/$RECIPIENT_USER_ID/follow" -H "$AUTH")
check "POST /users/:userId/follow" 200 "$FOLLOW"

echo "== tune-service =="

echo "dummy audio" > "$TMP_DIR/audio.mp3"
CREATE_TUNE=$(curl -s -o "$TMP_DIR/tune.json" -w "%{http_code}" -X POST "$HOST:3003/tunes" \
  -H "$AUTH" \
  -F "title=Smoke Tune" -F "genre=Pop" -F "language=English" -F "mood=Happy" -F "bpm=120" \
  -F "audio=@$TMP_DIR/audio.mp3;type=audio/mpeg")
check "POST /tunes" 201 "$CREATE_TUNE"
TUNE_ID=$(jq -r '.tuneId' "$TMP_DIR/tune.json")

MY_TUNES=$(curl -s -o /dev/null -w "%{http_code}" "$HOST:3003/tunes/my" -H "$AUTH")
check "GET /tunes/my" 200 "$MY_TUNES"

GET_TUNE=$(curl -s -o /dev/null -w "%{http_code}" "$HOST:3003/tunes/$TUNE_ID")
check "GET /tunes/:tuneId" 200 "$GET_TUNE"

ANALYZE_TUNE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$HOST:3003/tunes/$TUNE_ID/analyze" -H "$AUTH")
check "POST /tunes/:tuneId/analyze" 200 "$ANALYZE_TUNE"

echo "== lyrics-service =="

CREATE_LYRICS=$(curl -s -o "$TMP_DIR/lyrics.json" -w "%{http_code}" -X POST "$HOST:3004/lyrics" \
  -H "$AUTH" -H "Content-Type: application/json" \
  -d "{\"tuneId\":\"$TUNE_ID\",\"title\":\"Smoke Lyrics\",\"language\":\"English\",\"lyrics\":\"la la la\"}")
check "POST /lyrics" 201 "$CREATE_LYRICS"
LYRICS_ID=$(jq -r '.lyricsId' "$TMP_DIR/lyrics.json")

LIST_LYRICS=$(curl -s -o /dev/null -w "%{http_code}" "$HOST:3004/tunes/$TUNE_ID/lyrics")
check "GET /tunes/:tuneId/lyrics" 200 "$LIST_LYRICS"

APPROVE_LYRICS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$HOST:3004/lyrics/$LYRICS_ID/approve" -H "$AUTH")
check "POST /lyrics/:lyricsId/approve" 200 "$APPROVE_LYRICS"

GENERATE_LYRICS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$HOST:3004/ai/lyrics/generate" \
  -H "$AUTH" -H "Content-Type: application/json" \
  -d "{\"tuneId\":\"$TUNE_ID\",\"language\":\"English\",\"theme\":\"love\"}")
check "POST /ai/lyrics/generate" 200 "$GENERATE_LYRICS"

echo "== voice-service =="

PERF=$(curl -s -o "$TMP_DIR/perf.json" -w "%{http_code}" -X POST "$HOST:3005/performances" \
  -H "$AUTH" -F "tuneId=$TUNE_ID" -F "lyricsId=$LYRICS_ID" -F "file=@$TMP_DIR/audio.mp3;type=audio/mpeg")
check "POST /performances" 201 "$PERF"
PERFORMANCE_ID=$(jq -r '.performanceId' "$TMP_DIR/perf.json")

MY_PERF=$(curl -s -o /dev/null -w "%{http_code}" "$HOST:3005/performances/my" -H "$AUTH")
check "GET /performances/my" 200 "$MY_PERF"

ANALYZE_PERF=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$HOST:3005/performances/$PERFORMANCE_ID/analyze" -H "$AUTH")
check "POST /performances/:performanceId/analyze" 200 "$ANALYZE_PERF"

echo "== video-service =="

VIDEO_PROJECT=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$HOST:3006/video-projects" \
  -H "$AUTH" -H "Content-Type: application/json" \
  -d "{\"songId\":\"$TUNE_ID\",\"title\":\"Smoke Video\"}")
check "POST /video-projects" 201 "$VIDEO_PROJECT"

echo "dummy video" > "$TMP_DIR/video.mp4"
UPLOAD_VIDEO=$(curl -s -o "$TMP_DIR/video.json" -w "%{http_code}" -X POST "$HOST:3006/videos" \
  -H "$AUTH" -F "file=@$TMP_DIR/video.mp4;type=video/mp4")
check "POST /videos" 201 "$UPLOAD_VIDEO"
VIDEO_ID=$(jq -r '.data.videoId' "$TMP_DIR/video.json")

GET_VIDEO=$(curl -s -o /dev/null -w "%{http_code}" "$HOST:3006/videos/$VIDEO_ID" -H "$AUTH")
check "GET /videos/:videoId" 200 "$GET_VIDEO"

STORYBOARD=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$HOST:3006/ai/storyboards" \
  -H "$AUTH" -H "Content-Type: application/json" -d "{\"songId\":\"$TUNE_ID\"}")
check "POST /ai/storyboards" 200 "$STORYBOARD"

echo "== project-service =="

CREATE_PROJECT=$(curl -s -o "$TMP_DIR/project.json" -w "%{http_code}" -X POST "$HOST:3007/projects" \
  -H "$AUTH" -H "Content-Type: application/json" -d '{"projectName":"Smoke Project"}')
check "POST /projects" 201 "$CREATE_PROJECT"
PROJECT_ID=$(jq -r '.data.projectId' "$TMP_DIR/project.json")

INVITE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$HOST:3007/projects/$PROJECT_ID/invite" \
  -H "$AUTH" -H "Content-Type: application/json" -d "{\"userId\":\"$RECIPIENT_USER_ID\",\"role\":\"SINGER\"}")
check "POST /projects/:projectId/invite" 200 "$INVITE"

MEMBERS=$(curl -s -o /dev/null -w "%{http_code}" "$HOST:3007/projects/$PROJECT_ID/members" -H "$AUTH")
check "GET /projects/:projectId/members" 200 "$MEMBERS"

FILES=$(curl -s -o /dev/null -w "%{http_code}" "$HOST:3007/projects/$PROJECT_ID/files" -H "$AUTH")
check "GET /projects/:projectId/files" 200 "$FILES"

MY_PROJECTS=$(curl -s -o "$TMP_DIR/my_projects.json" -w "%{http_code}" "$HOST:3007/projects/my" -H "$AUTH")
check "GET /projects/my" 200 "$MY_PROJECTS"

HAS_PROJECT=$(jq -r --arg pid "$PROJECT_ID" '.data.projects | any(.projectId == $pid)' "$TMP_DIR/my_projects.json")
check "GET /projects/my contains created project" "true" "$HAS_PROJECT"

echo "== chat-service =="

SEND_MSG=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$HOST:3008/projects/$PROJECT_ID/messages" \
  -H "$AUTH" -H "Content-Type: application/json" -d '{"message":"Hello from smoke test"}')
check "POST /projects/:projectId/messages" 201 "$SEND_MSG"

MSG_HISTORY=$(curl -s -o /dev/null -w "%{http_code}" "$HOST:3008/projects/$PROJECT_ID/messages" -H "$AUTH")
check "GET /projects/:projectId/messages" 200 "$MSG_HISTORY"

echo "== voting-service =="

CAST_VOTE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$HOST:3009/votes" \
  -H "$AUTH" -H "Content-Type: application/json" \
  -d "{\"entityType\":\"PERFORMANCE\",\"entityId\":\"$PERFORMANCE_ID\"}")
check "POST /votes" 201 "$CAST_VOTE"

VOTE_RESULTS=$(curl -s -o /dev/null -w "%{http_code}" "$HOST:3009/votes/results/$PERFORMANCE_ID" -H "$AUTH")
check "GET /votes/results/:entityId" 200 "$VOTE_RESULTS"

# Cast on the tune itself (not just the performance) to exercise the VOTE_RECEIVED
# notification, which is scoped to entityType TUNE (see CLAUDE.md).
CAST_TUNE_VOTE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$HOST:3009/votes" \
  -H "$AUTH" -H "Content-Type: application/json" \
  -d "{\"entityType\":\"TUNE\",\"entityId\":\"$TUNE_ID\"}")
check "POST /votes (TUNE, for VOTE_RECEIVED notification)" 201 "$CAST_TUNE_VOTE"

echo "== feed-service =="

HOME_FEED=$(curl -s -o /dev/null -w "%{http_code}" "$HOST:3010/feed/home" -H "$AUTH")
check "GET /feed/home" 200 "$HOME_FEED"

TRENDING=$(curl -s -o /dev/null -w "%{http_code}" "$HOST:3010/feed/trending" -H "$AUTH")
check "GET /feed/trending" 200 "$TRENDING"

RECOMMENDED=$(curl -s -o /dev/null -w "%{http_code}" "$HOST:3010/feed/recommended" -H "$AUTH")
check "GET /feed/recommended" 200 "$RECOMMENDED"

echo "== rights-service =="

CREATE_LISTING=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$HOST:3011/marketplace/rights" \
  -H "$AUTH" -H "Content-Type: application/json" \
  -d "{\"assetId\":\"$TUNE_ID\",\"assetType\":\"TUNE\",\"licenseType\":\"NON_EXCLUSIVE\",\"price\":500}")
check "POST /marketplace/rights" 201 "$CREATE_LISTING"

LISTINGS=$(curl -s -o /dev/null -w "%{http_code}" "$HOST:3011/marketplace/rights" -H "$AUTH")
check "GET /marketplace/rights" 200 "$LISTINGS"

PURCHASE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$HOST:3011/marketplace/purchase" \
  -H "$RECIPIENT_AUTH" -H "Content-Type: application/json" \
  -d "{\"assetId\":\"$TUNE_ID\",\"licenseType\":\"NON_EXCLUSIVE\"}")
check "POST /marketplace/purchase" 201 "$PURCHASE"

MY_LISTINGS=$(curl -s -o "$TMP_DIR/my_listings.json" -w "%{http_code}" "$HOST:3011/marketplace/rights/my" -H "$AUTH")
check "GET /marketplace/rights/my" 200 "$MY_LISTINGS"
SOLD_COUNT=$(jq -r '.data.soldCount' "$TMP_DIR/my_listings.json")
check "GET /marketplace/rights/my soldCount reflects the purchase" "1" "$SOLD_COUNT"

DRM_TOKEN=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$HOST:3011/drm/token" \
  -H "$AUTH" -H "Content-Type: application/json" -d "{\"assetId\":\"$TUNE_ID\"}")
check "POST /drm/token" 200 "$DRM_TOKEN"

RAISE_CLAIM=$(curl -s -o "$TMP_DIR/claim.json" -w "%{http_code}" -X POST "$HOST:3011/copyright/claims" \
  -H "$AUTH" -H "Content-Type: application/json" \
  -d "{\"assetId\":\"$TUNE_ID\",\"reason\":\"Smoke test claim\"}")
check "POST /copyright/claims" 201 "$RAISE_CLAIM"
CLAIM_ID=$(jq -r '.data.claimId' "$TMP_DIR/claim.json")

GET_CLAIM=$(curl -s -o /dev/null -w "%{http_code}" "$HOST:3011/copyright/claims/$CLAIM_ID" -H "$AUTH")
check "GET /copyright/claims/:claimId" 200 "$GET_CLAIM"

echo "== payment-service =="

SUBSCRIBE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$HOST:3012/subscriptions" \
  -H "$AUTH" -H "Content-Type: application/json" -d '{"plan":"PREMIUM"}')
check "POST /subscriptions" 201 "$SUBSCRIBE"

WEBHOOK=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$HOST:3012/payments/webhook" \
  -H "Content-Type: application/json" -d '{"eventType":"payment.success","payload":{}}')
check "POST /payments/webhook" 200 "$WEBHOOK"

DASHBOARD=$(curl -s -o "$TMP_DIR/dashboard.json" -w "%{http_code}" "$HOST:3012/revenues/dashboard" -H "$AUTH")
check "GET /revenues/dashboard" 200 "$DASHBOARD"
HAS_GROWTH_FIELD=$(jq -r 'has("data") and (.data | has("growthPercent") and has("revenueBreakdown"))' "$TMP_DIR/dashboard.json")
check "GET /revenues/dashboard includes growthPercent/revenueBreakdown" "true" "$HAS_GROWTH_FIELD"

WITHDRAW=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$HOST:3012/revenues/withdraw" \
  -H "$AUTH" -H "Content-Type: application/json" -d '{"amount":100,"bankAccountId":"ACC123"}')
check "POST /revenues/withdraw" 201 "$WITHDRAW"

echo "== notification-service =="

# Give the fire-and-forget internal calls (follow, invite, purchase, tune vote) a moment to land.
sleep 1

MY_NOTIFICATIONS=$(curl -s -o "$TMP_DIR/notifications.json" -w "%{http_code}" "$HOST:3013/notifications" -H "$AUTH")
check "GET /notifications" 200 "$MY_NOTIFICATIONS"
UNREAD_COUNT=$(jq -r '.data.unreadCount' "$TMP_DIR/notifications.json")
HAS_UNREAD=$([ "$UNREAD_COUNT" -gt 0 ] 2>/dev/null && echo "true" || echo "false")
check "GET /notifications has unread items (MARKETPLACE_SALE/VOTE_RECEIVED, self-purchase/self-vote)" "true" "$HAS_UNREAD"

READ_ALL=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$HOST:3013/notifications/read-all" -H "$AUTH")
check "POST /notifications/read-all" 200 "$READ_ALL"

AFTER_READ_ALL=$(curl -s -o "$TMP_DIR/notifications_after.json" -w "%{http_code}" "$HOST:3013/notifications" -H "$AUTH")
check "GET /notifications after read-all" 200 "$AFTER_READ_ALL"
UNREAD_AFTER=$(jq -r '.data.unreadCount' "$TMP_DIR/notifications_after.json")
check "GET /notifications unreadCount is 0 after read-all" "0" "$UNREAD_AFTER"

RECIPIENT_NOTIFICATIONS=$(curl -s -o "$TMP_DIR/recipient_notifications.json" -w "%{http_code}" "$HOST:3013/notifications" -H "$RECIPIENT_AUTH")
check "GET /notifications (recipient)" 200 "$RECIPIENT_NOTIFICATIONS"
RECIPIENT_TOTAL=$(jq -r '.data.totalRecords' "$TMP_DIR/recipient_notifications.json")
HAS_RECIPIENT_NOTIFICATIONS=$([ "$RECIPIENT_TOTAL" -ge 2 ] 2>/dev/null && echo "true" || echo "false")
check "GET /notifications (recipient) has FOLLOW + INVITE" "true" "$HAS_RECIPIENT_NOTIFICATIONS"

if [ "$UNREAD_COUNT" != "null" ] && [ "$UNREAD_COUNT" -gt 0 ] 2>/dev/null; then
  FIRST_NOTIFICATION_ID=$(jq -r '.data.data[0].notificationId' "$TMP_DIR/notifications.json")
  MARK_READ=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH "$HOST:3013/notifications/$FIRST_NOTIFICATION_ID/read" -H "$AUTH")
  check "PATCH /notifications/:notificationId/read" 200 "$MARK_READ"
fi

echo "== identity-service (logout) =="

LOGOUT=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$HOST:3001/auth/logout" -H "$AUTH")
check "POST /auth/logout" 200 "$LOGOUT"

echo
echo "===================="
echo "PASS: $PASS  FAIL: $FAIL"
echo "===================="

if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
