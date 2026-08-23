import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { generateFromAudio, isGeminiConfigured } from '../shared/gemini.client';
import { TuneService } from './tune.service';

/**
 * Unit tests for TuneService.analyzeTune()'s ownership check. This is
 * tune-service's own, standalone ownership guard (independent of
 * voice-service's separate P0.2 check on its own `analyze` endpoint) —
 * added alongside tune-service's P2 Gemini work. TuneRepository is mocked
 * as a plain object with a jest.fn() findBySequenceNumber, ConfigService as
 * a minimal { get: jest.fn() } stub, and ../shared/gemini.client is
 * jest.mock'd so isGeminiConfigured/generateFromAudio are fully controlled
 * and their call counts can be asserted (proving the ownership check
 * short-circuits before any Gemini work/cost is incurred).
 */

jest.mock('../shared/gemini.client');

const mockedIsGeminiConfigured = jest.mocked(isGeminiConfigured);
const mockedGenerateFromAudio = jest.mocked(generateFromAudio);

function buildMockRepo() {
  return {
    create: jest.fn(),
    findByOwner: jest.fn(),
    findBySequenceNumber: jest.fn(),
    delete: jest.fn(),
  };
}

function buildMockConfig() {
  return { get: jest.fn() };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('TuneService.analyzeTune ownership check', () => {
  it("forbids a non-owner from analyzing someone else's tune, without doing any Gemini work", async () => {
    const repo = buildMockRepo();
    repo.findBySequenceNumber.mockResolvedValue({ ownerId: 'USR000001' });
    const config = buildMockConfig();
    const service = new TuneService(repo as any, config as any);

    await expect(service.analyzeTune('TUN1001', 'USR000002')).rejects.toThrow(ForbiddenException);
    expect(repo.findBySequenceNumber).toHaveBeenCalledWith(1);
    expect(mockedIsGeminiConfigured).not.toHaveBeenCalled();
    expect(mockedGenerateFromAudio).not.toHaveBeenCalled();

    try {
      await service.analyzeTune('TUN1001', 'USR000002');
      fail('expected analyzeTune to throw');
    } catch (e) {
      expect(e).toBeInstanceOf(ForbiddenException);
      expect((e as ForbiddenException).getResponse()).toMatchObject({
        status: 'ERROR',
        errorCode: 'CSN-3002',
      });
    }
  });

  it('lets the owner proceed past the ownership check', async () => {
    const repo = buildMockRepo();
    repo.findBySequenceNumber.mockResolvedValue({ ownerId: 'USR000001', genre: 'Pop', mood: 'Happy', bpm: null });
    const config = buildMockConfig();
    mockedIsGeminiConfigured.mockReturnValue(false);
    const service = new TuneService(repo as any, config as any);

    const result = await service.analyzeTune('TUN1001', 'USR000001');

    expect(result.data.analysisType).toBe('metadata-estimate');
  });

  it('throws NotFoundException when the tune does not exist, never reaching the ownership check', async () => {
    const repo = buildMockRepo();
    repo.findBySequenceNumber.mockResolvedValue(null);
    const config = buildMockConfig();
    const service = new TuneService(repo as any, config as any);

    await expect(service.analyzeTune('TUN1001', 'USR000002')).rejects.toThrow(NotFoundException);

    try {
      await service.analyzeTune('TUN1001', 'USR000002');
      fail('expected analyzeTune to throw');
    } catch (e) {
      expect(e).toBeInstanceOf(NotFoundException);
      expect(e).not.toBeInstanceOf(ForbiddenException);
      expect((e as NotFoundException).getResponse()).toMatchObject({
        status: 'ERROR',
        errorCode: 'CSN-3001',
      });
    }
  });
});
