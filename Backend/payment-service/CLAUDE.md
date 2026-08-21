# payment-service — CLAUDE.md

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

### Local development
DB on port 5443, reachable at `http://localhost:${GATEWAY_PORT:-8080}/payment/` through the gateway. Run via the root Compose stack (see `Backend/CLAUDE.md`) — no per-service `docker-compose.yml`.
