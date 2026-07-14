export interface CsnEnvelope<T> {
  status: "SUCCESS" | "ERROR";
  message?: string;
  errorCode?: string;
  data?: T;
}

export class CsnApiError extends Error {
  errorCode?: string;

  constructor(message: string, errorCode?: string) {
    super(message);
    this.name = "CsnApiError";
    this.errorCode = errorCode;
  }
}

/**
 * Unwraps the standard CSN response envelope `{ status, message, data }`.
 * Not for auth endpoints (register/login/refresh-token put fields at the root) —
 * use those response bodies directly instead.
 */
export function unwrap<T>(envelope: CsnEnvelope<T>): T {
  if (envelope.status === "ERROR") {
    throw new CsnApiError(envelope.message ?? "Request failed", envelope.errorCode);
  }
  return envelope.data as T;
}
