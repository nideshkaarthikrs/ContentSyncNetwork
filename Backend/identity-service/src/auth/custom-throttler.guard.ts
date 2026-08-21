import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

// identity-service only ever sees traffic through the nginx gateway
// (Backend/nginx/nginx.conf sets X-Forwarded-For on every proxied request),
// so the default tracker -- which keys on the raw socket IP -- would key
// every request off nginx's single container IP and let one bad actor
// exhaust the whole limit for every real client.
//
// We deliberately do NOT parse X-Forwarded-For by hand here. nginx sets it
// via `proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for`, which
// APPENDS nginx's view of the client address to whatever value the client
// already sent rather than overwriting it -- so the leftmost entry in that
// header is attacker-controlled and the trustworthy value is the rightmost
// one. Reading `split(',')[0]` would key on the attacker-controlled entry,
// letting a client mint a fresh throttle bucket on every request by sending
// a different fake XFF value. `main.ts` sets `app.set('trust proxy', 1)`,
// which tells Express there is exactly one trusted proxy hop in front of it
// (nginx, matching this deployment's topology) -- Express then parses XFF
// itself and resolves `req.ip` to the correct real client IP (the rightmost
// entry), stripping any attacker-supplied entries to its left. So `req.ip`
// is already correct and simpler than re-implementing that parsing here.
@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    return req.ip;
  }
}
