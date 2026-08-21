# rights-service — CLAUDE.md

### LicenseId format
- `listingId` in responses = `"LIC" + (8000 + sequenceNumber)` → e.g. `LIC8001`, `LIC8002`
- Path params not needed (listings queried by assetId, not listingId)

### ClaimId format
- `claimId` in responses = `"CLM" + (9000 + sequenceNumber)` → e.g. `CLM9001`, `CLM9002`
- Path params use the display ID; service parses: strip `CLM`, parseInt, subtract 9000, query by `sequenceNumber`

### PurchaseId format
- `purchaseId` in responses = `"PUR" + (15000 + sequenceNumber)` → e.g. `PUR15001`, `PUR15002`

### rights-service controller layout
Three controllers in one `RightsModule`:
- `MarketplaceController` (`/marketplace`) — JWT required:
  - `POST /marketplace/rights` — body `{ assetId, assetType, licenseType, territory?, term?, price }`;
    creates an `AVAILABLE` listing owned by the caller. **Added alongside the purchase-completion
    fix** — there was previously no way to create a `RightsListing` anywhere (no endpoint,
    no seed data), so `purchase()`'s old behavior of silently tolerating "no listing found"
    was the only reason the marketplace ever appeared to work. Once `purchase()` started
    requiring a real listing (to know who to credit and for how much), this endpoint became
    load-bearing, not optional.
  - `GET /marketplace/rights` — paginated listings (`?type=TUNE|SONG|VIDEO`, `?page=1&pageSize=20`)
  - `GET /marketplace/rights/my` — paginated listings owned by the caller, includes
    `soldCount` (listings with `status: SOLD`); added for the Analytics dashboard's
    "Rights Listed"/"Rights Sold" KPIs, mirroring the `GET /projects/my` convention
  - `POST /marketplace/purchase` — body `{ assetId, licenseType }`; 404 `CSN-RIGHTS-002`
    if no `AVAILABLE` listing exists for the asset; on success marks the listing
    `SOLD`, creates a `COMPLETED` `Purchase` record (with `price`/`sellerId`/`sellerUserId`
    captured from the listing — there's no real payment gateway in this codebase to
    wait on, so completion is synchronous), and fires two fire-and-forget internal calls:
    to payment-service (`POST /internal/transactions`) crediting the listing owner
    with a `MARKETPLACE_SALE` transaction, and to notification-service
    (`POST /internal/notifications`) notifying the seller
- `DrmController` (`/drm`) — JWT required:
  - `POST /drm/token` — body `{ assetId }`; stateless stub; returns `{ streamUrl: "https://cdn.csn.ai/stream/:assetId?token=<uuid>" }`
- `CopyrightController` (`/copyright`) — JWT required:
  - `POST /copyright/claims` — body `{ assetId, reason }`; creates CopyrightClaim with PENDING status
  - `GET /copyright/claims/:claimId` — returns claim detail; 404 `CSN-RIGHTS-001` if not found
- Three Prisma models: `RightsListing`, `Purchase`, `CopyrightClaim`
- DRM token generation is stateless (`randomUUID()` from Node crypto); token not persisted (MVP stub)

### Local development
DB on port 5442, reachable at `http://localhost:${GATEWAY_PORT:-8080}/rights/` through the gateway. Run via the root Compose stack (see `Backend/CLAUDE.md`) — no per-service `docker-compose.yml`.
