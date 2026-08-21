import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

// identity-service only ever sees traffic through the nginx gateway
// (Backend/nginx/nginx.conf sets X-Forwarded-For on every proxied request),
// so the default tracker -- which keys on the raw socket IP -- would key
// every request off nginx's single container IP and let one bad actor
// exhaust the whole limit for every real client. Key on the client IP from
// X-Forwarded-For instead, falling back to req.ip for direct/local calls.
@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    const forwardedFor = req.headers?.['x-forwarded-for'];
    if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
      return forwardedFor.split(',')[0].trim();
    }
    return req.ip;
  }
}
