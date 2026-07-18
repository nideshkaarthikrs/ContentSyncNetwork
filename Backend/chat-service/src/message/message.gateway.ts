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
        next();
      } catch {
        next(new Error('unauthorized'));
      }
    });
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

    const url = `${this.config.get<string>('projectService.url')}/internal/projects/${encodeURIComponent(projectId)}/membership?userId=${encodeURIComponent(user.id)}&userDisplayId=${encodeURIComponent(user.userId)}`;
    const result = await getInternal<{ data: { isMember: boolean } }>(url, this.config.get<string>('internal.secret'));

    if (!result?.data?.isMember) {
      client.emit('joinError', { projectId, message: 'Not a member of this project' });
      return;
    }

    client.join(projectId);
    client.emit('joinedProject', { projectId });
  }

  broadcastMessage(projectId: string, message: unknown) {
    this.server.to(projectId).emit('newMessage', message);
  }
}
