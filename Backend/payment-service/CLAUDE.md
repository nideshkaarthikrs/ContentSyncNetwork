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
  - `POST /subscriptions` — body `{ plan: FREE|PREMIUM|PRODUCER }`; creates Subscription; plan→amount map: FREE=0, PREMIUM=499, PRODUCER=10000; also writes a `SUBSCRIPTION` `Transaction` for the same amount. **Rejects with 409 `CSN-PAY-003` when the caller already has an `ACTIVE` subscription** — there is no plan-change/upgrade flow, so repeat POSTs used to stack subscriptions and charges without limit. The ACTIVE check, the Subscription insert and the Transaction insert all run in one DB transaction under the same per-user `pg_advisory_xact_lock(hashtext(userId))` the balance paths use, so concurrent POSTs can't both pass the check
- `WebhookController` (`/payments`) — **no auth** (payment gateways don't send JWTs):
  - `POST /payments/webhook` — body `{ eventType, payload }`; persists WebhookEvent; returns standard success envelope
- `RevenueController` (`/revenues`) — JWT required:
  - `GET /revenues/dashboard` — real aggregation: `totalRevenue = MARKETPLACE_SALE + ROYALTY` sums for the caller. `SUBSCRIPTION` is deliberately **not** revenue — it's the caller's own plan payment, and adding it overstated every subscriber's earnings by their own plan price; it is reported separately as `subscriptionSpend` (and, unchanged for now, as `revenueBreakdown.subscriptions`; the FE labels are a later task). Also returns `availableBalance` (same formula the withdrawal check uses), `growthPercent` (this calendar month's *credit* sum vs. last month's — scoped to `MARKETPLACE_SALE`/`ROYALTY` so a user's own purchases and plan payments don't register as revenue growth) and `revenueBreakdown: { subscriptions, marketplaceSales }`. `royalties` now reports the real `ROYALTY` sum (still 0 in practice — nothing creates those rows yet); `contestWins` stays hardcoded 0, no contest/prize feature exists to generate it
  - `POST /revenues/withdraw` — body `{ amount, bankAccountId }`; `amount` is `@IsInt @Min(1)` because the column is `Int`; creates WithdrawalRequest with PENDING status only if the available balance covers it (400 `CSN-PAY-001` otherwise)
- `InternalTransactionController` (`/internal/transactions`) — service-to-service only,
  guarded by `InternalAuthGuard`, not JWT:
  - `POST /` — records one single-sided transaction. Its DTO deliberately does **not**
    accept `MARKETPLACE_PURCHASE`: a buyer debit may only be created by the transfer
    endpoint below, paired with its matching credit.
  - `POST /transfer` — body
    `{ buyerId, buyerUserId, sellerId, sellerUserId, amount, sourceId?, reference? }`.
    Writes the buyer's `MARKETPLACE_PURCHASE` debit and the seller's
    `MARKETPLACE_SALE` credit in **one** DB transaction, under
    `pg_advisory_xact_lock(hashtext(buyerId))`, refusing with 400 `CSN-PAY-002`
    when the buyer's available balance can't cover it. Callers must treat any
    non-2xx as "no money moved". Called **synchronously** by rights-service.
    Its `$transaction` passes explicit `{ maxWait: 1000, timeout: 3000 }` instead
    of Prisma's defaults (2000/5000): rights-service aborts the call at 5000ms and
    *compensates*, so the server-side commit window (4000ms worst case, advisory-lock
    wait included) must stay strictly inside the client's patience — otherwise a
    contended transfer could commit after the caller already reverted the purchase.
    If these two numbers ever change, they have to change together.
- **Available balance** (`PaymentRepository.computeAvailableBalance`, the single
  definition used by withdrawals, transfers and the dashboard):
  `(MARKETPLACE_SALE + ROYALTY) − MARKETPLACE_PURCHASE − non-FAILED withdrawals`.
  `SUBSCRIPTION` rows are excluded on purpose — they record out-of-band money that
  never entered this ledger. Any caller using it to *authorize* spend must hold the
  per-user advisory lock in the same transaction.
- Four Prisma models: `Subscription`, `WebhookEvent`, `WithdrawalRequest`, `Transaction`

### Local development
DB on port 5443, reachable at `http://localhost:${GATEWAY_PORT:-8080}/payment/` through the gateway. Run via the root Compose stack (see `Backend/CLAUDE.md`) — no per-service `docker-compose.yml`.
