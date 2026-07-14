import { rightsApi } from "../client";
import { CsnEnvelope, unwrap } from "../envelope";

export interface RightsListing {
  listingId: string;
  assetId: string;
  assetType: string;
  licenseType: string;
  territory: string;
  term: string;
  price: number;
  status: string;
  createdAt: string;
}

export interface CopyrightClaim {
  claimId: string;
  assetId: string;
  reason: string;
  status: string;
  createdAt: string;
}

export const rightsService = {
  getListings: (type?: string, page = 1, pageSize = 20) =>
    rightsApi
      .get<CsnEnvelope<{ page: number; pageSize: number; totalRecords: number; data: RightsListing[] }>>(
        "/marketplace/rights",
        { params: { type, page, pageSize } },
      )
      .then((res) => unwrap(res.data)),

  getMyListings: (page = 1, pageSize = 20) =>
    rightsApi
      .get<
        CsnEnvelope<{
          page: number;
          pageSize: number;
          totalRecords: number;
          soldCount: number;
          data: RightsListing[];
        }>
      >("/marketplace/rights/my", { params: { page, pageSize } })
      .then((res) => unwrap(res.data)),

  purchase: (assetId: string, licenseType: string) =>
    rightsApi
      .post<CsnEnvelope<{ assetId: string; licenseType: string; status: string }>>("/marketplace/purchase", {
        assetId,
        licenseType,
      })
      .then((res) => unwrap(res.data)),

  getDrmToken: (assetId: string) =>
    rightsApi
      .post<CsnEnvelope<{ streamUrl: string }>>("/drm/token", { assetId })
      .then((res) => unwrap(res.data)),

  raiseClaim: (assetId: string, reason: string) =>
    rightsApi
      .post<CsnEnvelope<{ claimId: string; status: string }>>("/copyright/claims", { assetId, reason })
      .then((res) => unwrap(res.data)),

  getClaim: (claimId: string) =>
    rightsApi.get<CsnEnvelope<CopyrightClaim>>(`/copyright/claims/${claimId}`).then((res) => unwrap(res.data)),
};
