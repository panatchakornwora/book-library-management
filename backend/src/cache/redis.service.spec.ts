import { Logger } from '@nestjs/common';
import { RedisService } from './redis.service';

describe('RedisService', () => {
  const originalRedisUrl = process.env.REDIS_URL;

  beforeEach(() => {
    delete process.env.REDIS_URL;
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    process.env.REDIS_URL = originalRedisUrl;
    jest.restoreAllMocks();
  });

  it('returns null when cache client is disabled', async () => {
    const service = new RedisService();

    await expect(service.get('key')).resolves.toBeNull();
  });

  it('no-ops when cache client is disabled', async () => {
    const service = new RedisService();

    await expect(service.set('key', 'value', 10)).resolves.toBeUndefined();
    await expect(service.delByPrefix('prefix:')).resolves.toBeUndefined();
    await expect(service.onModuleDestroy()).resolves.toBeUndefined();
  });
});
