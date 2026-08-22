jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('AuthService.changePassword', () => {
  let service: AuthService;
  let repo: jest.Mocked<
    Pick<
      AuthRepository,
      'findUserById' | 'updatePasswordHash' | 'deleteAllRefreshTokensForUser'
    >
  >;

  const userId = 'user-123';
  const currentPassword = 'current-plain-password';
  const newPassword = 'new-plain-password';

  beforeEach(() => {
    jest.clearAllMocks();

    repo = {
      findUserById: jest.fn(),
      updatePasswordHash: jest.fn(),
      deleteAllRefreshTokensForUser: jest.fn(),
    };

    service = new AuthService(
      repo as unknown as AuthRepository,
      {} as JwtService,
      {} as ConfigService,
    );
  });

  it('revokes all refresh tokens after a successful password change, in the correct order', async () => {
    repo.findUserById.mockResolvedValue({
      id: userId,
      passwordHash: 'old-hashed-value',
    } as any);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed-value');

    const result = await service.changePassword(
      userId,
      currentPassword,
      newPassword,
    );

    expect(result).toEqual({
      status: 'SUCCESS',
      message: 'Password changed successfully',
    });
    expect(repo.updatePasswordHash).toHaveBeenCalledWith(
      userId,
      'new-hashed-value',
    );
    expect(repo.deleteAllRefreshTokensForUser).toHaveBeenCalledWith(userId);

    // The hash update must happen before sessions are revoked.
    const updateOrder = repo.updatePasswordHash.mock.invocationCallOrder[0];
    const revokeOrder =
      repo.deleteAllRefreshTokensForUser.mock.invocationCallOrder[0];
    expect(updateOrder).toBeLessThan(revokeOrder);
  });

  it('does not revoke tokens when the current password is wrong', async () => {
    repo.findUserById.mockResolvedValue({
      id: userId,
      passwordHash: 'old-hashed-value',
    } as any);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    let caught: any;
    try {
      await service.changePassword(userId, currentPassword, newPassword);
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(UnauthorizedException);
    expect(caught.response).toMatchObject({ errorCode: 'CSN-1004' });

    expect(repo.updatePasswordHash).not.toHaveBeenCalled();
    expect(repo.deleteAllRefreshTokensForUser).not.toHaveBeenCalled();
  });

  it('throws and mutates nothing when the user no longer exists', async () => {
    repo.findUserById.mockResolvedValue(null);

    let caught: any;
    try {
      await service.changePassword(userId, currentPassword, newPassword);
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(UnauthorizedException);
    expect(caught.response).toMatchObject({ errorCode: 'CSN-1004' });

    expect(bcrypt.compare).not.toHaveBeenCalled();
    expect(repo.updatePasswordHash).not.toHaveBeenCalled();
    expect(repo.deleteAllRefreshTokensForUser).not.toHaveBeenCalled();
  });
});
