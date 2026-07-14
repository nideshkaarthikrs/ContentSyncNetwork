import { Logger } from '@nestjs/common';

const logger = new Logger('InternalHttpClient');

export async function getInternal<T>(url: string, secret: string): Promise<T | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'x-internal-secret': secret },
      signal: controller.signal,
    });
    if (!res.ok) {
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    logger.warn(`Internal call to ${url} failed: ${(err as Error).message}`);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
