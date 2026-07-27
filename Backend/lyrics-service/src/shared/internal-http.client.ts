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
