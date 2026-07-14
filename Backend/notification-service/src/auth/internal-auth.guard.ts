import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InternalAuthGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const provided = request.headers['x-internal-secret'];
    const expected = this.config.get<string>('internal.secret');

    if (!provided || provided !== expected) {
      throw new UnauthorizedException({
        status: 'ERROR',
        errorCode: 'CSN-INTERNAL-001',
        message: 'Invalid internal secret',
      });
    }

    return true;
  }
}
