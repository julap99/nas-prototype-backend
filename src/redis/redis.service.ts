import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class RedisService {
  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: any) {}

  async set(key: string, value: string, ttl?: number): Promise<void> {
    console.log("Masuk set");
    
    if (ttl) {
      await this.redisClient.setEx(key, ttl, value);
    } else {
      await this.redisClient.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return await this.redisClient.get(key);
  }

  async del(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.redisClient.exists(key);
    return result === 1;
  }

  async setRefreshToken(userId: number, tokenId: string, ttl: number): Promise<void> {
    const key = `refresh_token:${userId}:${tokenId}`;
    await this.set(key, 'valid', ttl);
  }

  async isRefreshTokenValid(userId: number, tokenId: string): Promise<boolean> {
    const key = `refresh_token:${userId}:${tokenId}`;
    return await this.exists(key);
  }

  async revokeRefreshToken(userId: number, tokenId: string): Promise<void> {
    const key = `refresh_token:${userId}:${tokenId}`;
    await this.del(key);
  }

  async revokeAllUserTokens(userId: number): Promise<void> {
    const pattern = `refresh_token:${userId}:*`;
    const keys = await this.redisClient.keys(pattern);
    
    if (keys.length > 0) {
      await this.redisClient.del(keys);
    }
  }
} 