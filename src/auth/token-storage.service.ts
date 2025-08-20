import { Injectable } from '@nestjs/common';

interface TokenRecord {
  userId: number;
  tokenId: string;
  expiresAt: number;
}

@Injectable()
export class TokenStorageService {
  private tokenStore: Map<string, TokenRecord> = new Map();
  private userTokens: Map<number, Set<string>> = new Map();

  async setRefreshToken(userId: number, tokenId: string, ttlSeconds: number): Promise<void> {
    const expiresAt = Date.now() + (ttlSeconds * 1000);
    const key = `${userId}:${tokenId}`;
    
    this.tokenStore.set(key, {
      userId,
      tokenId,
      expiresAt,
    });

    // Track tokens per user
    if (!this.userTokens.has(userId)) {
      this.userTokens.set(userId, new Set());
    }
    this.userTokens.get(userId)!.add(tokenId);

    // Clean up expired tokens
    this.cleanupExpiredTokens();
  }

  async isRefreshTokenValid(userId: number, tokenId: string): Promise<boolean> {
    const key = `${userId}:${tokenId}`;
    const record = this.tokenStore.get(key);
    
    if (!record) {
      return false;
    }

    if (Date.now() > record.expiresAt) {
      // Token expired, remove it
      this.tokenStore.delete(key);
      this.userTokens.get(userId)?.delete(tokenId);
      return false;
    }

    return true;
  }

  async revokeRefreshToken(userId: number, tokenId: string): Promise<void> {
    const key = `${userId}:${tokenId}`;
    this.tokenStore.delete(key);
    this.userTokens.get(userId)?.delete(tokenId);
  }

  async revokeAllUserTokens(userId: number): Promise<void> {
    const userTokenIds = this.userTokens.get(userId);
    if (userTokenIds) {
      userTokenIds.forEach(tokenId => {
        const key = `${userId}:${tokenId}`;
        this.tokenStore.delete(key);
      });
      this.userTokens.delete(userId);
    }
  }

  private cleanupExpiredTokens(): void {
    const now = Date.now();
    for (const [key, record] of this.tokenStore.entries()) {
      if (now > record.expiresAt) {
        this.tokenStore.delete(key);
        this.userTokens.get(record.userId)?.delete(record.tokenId);
      }
    }
  }
}
