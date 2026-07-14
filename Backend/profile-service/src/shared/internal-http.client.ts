import { Logger } from '@nestjs/common';

const logger = new Logger('InternalHttpClient');

export async function postInternal(url: string, secret: string, body: unknown): Promise<void> {
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-internal-secret': secret },
      body: JSON.stringify(body),
    });
  } catch (err) {
    logger.warn(`Internal call to ${url} failed: ${(err as Error).message}`);
  }
}
