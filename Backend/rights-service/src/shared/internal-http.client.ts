import { Logger } from '@nestjs/common';

const logger = new Logger('InternalHttpClient');

// Keeps a hung receiver from holding the socket indefinitely; callers treat
// timeouts the same as any other failure (log-and-continue or null).
const INTERNAL_TIMEOUT_MS = 5000;

export async function postInternal(url: string, secret: string, body: unknown): Promise<void> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-internal-secret': secret },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(INTERNAL_TIMEOUT_MS),
    });
    if (!res.ok) {
      logger.warn(`Internal call to ${url} returned ${res.status}`);
    }
  } catch (err) {
    logger.warn(`Internal call to ${url} failed: ${(err as Error).message}`);
  }
}

/**
 * Thrown by postInternalStrict. `status` is set ONLY when the receiving service
 * actually answered — i.e. the call definitively did not take effect. An error
 * with `status === undefined` (connection refused, timeout, DNS) means the
 * outcome is *indeterminate*: the receiver may or may not have applied the
 * request before the socket died. Callers that move money must log that case
 * loudly for reconciliation.
 */
export class InternalCallError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly errorCode?: string,
  ) {
    super(message);
    this.name = 'InternalCallError';
  }
}

/**
 * Strict counterpart to postInternal, for calls whose *outcome* the caller has
 * to act on (money movement). Unlike postInternal, which deliberately swallows
 * every failure so a downed receiver can't fail the primary action, this one
 * throws InternalCallError on a non-2xx response, a network error or a timeout.
 * Use it only where "the call silently didn't happen" is not an acceptable
 * outcome — otherwise use postInternal.
 */
export async function postInternalStrict<T>(url: string, secret: string, body: unknown): Promise<T | null> {
  let res: Awaited<ReturnType<typeof fetch>>;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-internal-secret': secret },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(INTERNAL_TIMEOUT_MS),
    });
  } catch (err) {
    // No response at all -> indeterminate; deliberately no `status` argument.
    throw new InternalCallError(`Internal call to ${url} failed: ${(err as Error).message}`);
  }
  if (!res.ok) {
    let errorCode: string | undefined;
    try {
      const parsed = (await res.json()) as { errorCode?: unknown };
      if (typeof parsed?.errorCode === 'string') {
        errorCode = parsed.errorCode;
      }
    } catch {
      // Non-JSON error body (e.g. an nginx error page) — the status is enough.
    }
    throw new InternalCallError(`Internal call to ${url} returned ${res.status}`, res.status, errorCode);
  }
  try {
    return (await res.json()) as T;
  } catch {
    // 2xx with an unparseable/empty body: the call SUCCEEDED, we just have no
    // payload. Never throw here — that would make the caller compensate for a
    // request that actually took effect.
    return null;
  }
}

export async function getInternal<T>(url: string, secret: string): Promise<T | null> {
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'x-internal-secret': secret },
      signal: AbortSignal.timeout(INTERNAL_TIMEOUT_MS),
    });
    if (!res.ok) {
      logger.warn(`Internal call to ${url} returned ${res.status}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    logger.warn(`Internal call to ${url} failed: ${(err as Error).message}`);
    return null;
  }
}
