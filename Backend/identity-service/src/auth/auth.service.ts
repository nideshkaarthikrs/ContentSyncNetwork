import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { AuthRepository } from './auth.repository';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly repo: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private toDisplayId(sequenceNumber: number): string {
    return 'USR' + sequenceNumber.toString().padStart(6, '0');
  }

  private parseExpiry(expiry: string): Date {
    const now = new Date();
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const value = parseInt(match[1], 10);
    const unit = match[2];
    const ms: Record<string, number> = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
    return new Date(now.getTime() + value * ms[unit]);
  }

  async register(dto: RegisterDto) {
    const existing = await this.repo.findUserByEmail(dto.email);
    if (existing) {
      throw new ConflictException({
        status: 'ERROR',
        errorCode: 'CSN-1001',
        message: 'Email already registered',
      });
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    let user;
    try {
      user = await this.repo.createUser({
        fullName: dto.fullName,
        email: dto.email,
        mobile: dto.mobile,
        passwordHash,
        roles: dto.roles,
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException({
          status: 'ERROR',
          errorCode: 'CSN-1001',
          message: 'Email already registered',
        });
      }
      throw err;
    }

    return {
      status: 'SUCCESS',
      userId: this.toDisplayId(user.sequenceNumber),
      message: 'Registration Successful',
    };
  }

  async login(dto: LoginDto) {
    const user = await this.repo.findUserByIdentifier(dto.email);
    if (!user) {
      throw new UnauthorizedException({
        status: 'ERROR',
        errorCode: 'CSN-1002',
        message: 'Invalid credentials',
      });
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatch) {
      throw new UnauthorizedException({
        status: 'ERROR',
        errorCode: 'CSN-1002',
        message: 'Invalid credentials',
      });
    }

    const displayId = this.toDisplayId(user.sequenceNumber);
    const token = this.jwtService.sign({
      sub: user.id,
      userId: displayId,
      name: user.fullName,
      roles: user.roles,
    });

    const refreshToken = randomUUID();
    const expiresAt = this.parseExpiry(
      this.configService.get<string>('jwt.refreshExpiry'),
    );
    await this.repo.saveRefreshToken(user.id, refreshToken, expiresAt);

    return {
      status: 'SUCCESS',
      token,
      refreshToken,
      user: { userId: displayId, name: user.fullName },
    };
  }

  async refreshToken(token: string) {
    const record = await this.repo.findRefreshToken(token);
    if (!record || record.expiresAt < new Date()) {
      throw new UnauthorizedException({
        status: 'ERROR',
        errorCode: 'CSN-1003',
        message: 'Invalid or expired refresh token',
      });
    }

    await this.repo.deleteRefreshToken(token);

    const user = await this.repo.findUserById(record.userId);
    const displayId = this.toDisplayId(user.sequenceNumber);

    const newToken = this.jwtService.sign({
      sub: user.id,
      userId: displayId,
      name: user.fullName,
      roles: user.roles,
    });

    const newRefreshToken = randomUUID();
    const expiresAt = this.parseExpiry(
      this.configService.get<string>('jwt.refreshExpiry'),
    );
    await this.repo.saveRefreshToken(user.id, newRefreshToken, expiresAt);

    return { token: newToken, refreshToken: newRefreshToken };
  }

  async logout(userId: string) {
    await this.repo.deleteAllRefreshTokensForUser(userId);
    return { status: 'SUCCESS' };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.repo.findUserById(userId);
    const passwordMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!passwordMatch) {
      throw new UnauthorizedException({
        status: 'ERROR',
        errorCode: 'CSN-1004',
        message: 'Current password is incorrect',
      });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.repo.updatePasswordHash(userId, passwordHash);
    return { status: 'SUCCESS', message: 'Password changed successfully' };
  }
}
