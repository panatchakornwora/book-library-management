import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType | null = null;
  private readonly logger = new Logger(RedisService.name);

  async onModuleInit() {
    const url = process.env.REDIS_URL;
    if (!url) {
      this.logger.warn('REDIS_URL not set, cache disabled');
      return;
    }
    this.client = createClient({ url });
    this.client.on('error', (err) => this.logger.warn(`Redis error: ${err}`));
    try {
      await this.client.connect();
      this.logger.log('Redis connected');
    } catch (err) {
      this.logger.warn(`Redis connect failed: ${err}`);
      this.client = null;
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.client) return null;
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number) {
    if (!this.client) return;
    if (ttlSeconds && ttlSeconds > 0) {
      await this.client.set(key, value, { EX: ttlSeconds });
      return;
    }
    await this.client.set(key, value);
  }

  async delByPrefix(prefix: string) {
    if (!this.client) return;
    const iterator = this.client.scanIterator({
      MATCH: `${prefix}*`,
      COUNT: 100,
    });
    for await (const key of iterator) {
      await this.client.del(key);
    }
  }
}
