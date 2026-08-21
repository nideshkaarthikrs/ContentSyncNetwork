import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { getInternal } from '../shared/internal-http.client';

interface AuthenticatedUser {
  id: string;
  userId: string;
  name: string;
}

// Per-socket, per-room record of when membership was last confirmed against
// project-service. Keyed by projectId so one socket can be in several rooms.
type MembershipCache = Record<string, number>;

// How long a verified project-room membership is trusted before the next
// broadcast re-checks it. Re-verifying on every single broadcast would mean
// one synchronous internal HTTP call to project-service per room member per
// message -- instead membership is cached per socket per room (set on
// joinProject, refreshed whenever a re-check succeeds) and only re-checked
// once it goes stale.
//
// Leak bound: a member removed from a project keeps receiving broadcasts
// trusted from the cache until this TTL elapses. The next broadcast after
// that finds the cache stale, re-verifies *before* delivering, and evicts
// them (`socket.leave` + `membershipRevoked`) on failure -- so the message
// that triggers detection is never itself leaked. In the common case of one
// re-check catching a revocation, that bounds the leak to at most one
// message delivered after the actual revocation and before the next stale
// check; a project with many messages inside the same 60s window could see
// more than one, since staleness is only evaluated when a broadcast occurs,
// not on a background timer. Accepted MVP tradeoff -- there's no push-based
// revocation channel to project-service subscribers.
const MEMBERSHIP_TTL_MS = 60_000;

@WebSocketGateway({ cors: { origin: true }, path: '/chat/socket.io' })
export class MessageGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  afterInit(server: Server) {
    server.use((socket: Socket, next: (err?: Error) => void) => {
      const token = socket.handshake.auth?.token as string | undefined;
      if (!token) {
        next(new Error('unauthorized'));
        return;
      }
      try {
        const payload = this.jwtService.verify(token, { secret: this.config.get<string>('jwt.secret') });
        socket.data.user = { id: payload.sub, userId: payload.userId, name: payload.name } as AuthenticatedUser;
        socket.data.memberships = {} as MembershipCache;
        next();
      } catch {
        next(new Error('unauthorized'));
      }
    });
  }

  private async verifyMembership(user: AuthenticatedUser, projectId: string): Promise<boolean> {
    const url = `${this.config.get<string>('projectService.url')}/internal/projects/${encodeURIComponent(projectId)}/membership?userId=${encodeURIComponent(user.id)}&userDisplayId=${encodeURIComponent(user.userId)}`;
    const result = await getInternal<{ data: { isMember: boolean } }>(url, this.config.get<string>('internal.secret'));
    return !!result?.data?.isMember;
  }

  @SubscribeMessage('joinProject')
  async onJoinProject(
    @MessageBody() payload: { projectId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user as AuthenticatedUser | undefined;
    const projectId = payload?.projectId;
    if (!user || typeof projectId !== 'string' || !projectId.trim()) {
      client.emit('joinError', { projectId, message: 'Invalid join request' });
      return;
    }

    const isMember = await this.verifyMembership(user, projectId);
    if (!isMember) {
      client.emit('joinError', { projectId, message: 'Not a member of this project' });
      return;
    }

    client.join(projectId);
    (client.data.memberships as MembershipCache)[projectId] = Date.now();
    client.emit('joinedProject', { projectId });
  }

  @SubscribeMessage('leaveProject')
  onLeaveProject(
    @MessageBody() payload: { projectId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const projectId = payload?.projectId;
    if (typeof projectId !== 'string' || !projectId.trim()) {
      return;
    }
    client.leave(projectId);
    delete (client.data.memberships as MembershipCache | undefined)?.[projectId];
    client.emit('leftProject', { projectId });
  }

  // Async because a stale cache entry means re-verifying membership against
  // project-service before delivering to that one socket -- see
  // MEMBERSHIP_TTL_MS above. Called fire-and-forget from MessageService.send()
  // (consistent with this codebase's convention of never letting a
  // service-to-service side effect block the primary request/response path).
  async broadcastMessage(projectId: string, message: unknown) {
    const sockets = await this.server.in(projectId).fetchSockets();
    const now = Date.now();

    await Promise.all(
      sockets.map(async (socket) => {
        const memberships = (socket.data.memberships ?? {}) as MembershipCache;
        const verifiedAt = memberships[projectId];
        const isFresh = verifiedAt !== undefined && now - verifiedAt <= MEMBERSHIP_TTL_MS;

        if (isFresh) {
          socket.emit('newMessage', message);
          return;
        }

        const user = socket.data.user as AuthenticatedUser | undefined;
        const stillMember = !!user && (await this.verifyMembership(user, projectId));

        if (!stillMember) {
          delete memberships[projectId];
          socket.leave(projectId);
          socket.emit('membershipRevoked', { projectId });
          return;
        }

        memberships[projectId] = now;
        socket.emit('newMessage', message);
      }),
    );
  }
}
