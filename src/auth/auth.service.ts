import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { TokenStorageService } from './token-storage.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { User } from '../users/entities/user.entity';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';

export interface JwtPayload {
  sub: number;
  email: string;
  tokenId?: string;
  role: string;
  fullName: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly tokenStorageService: TokenStorageService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    try {
      const user = await this.usersService.findByEmail(email);

      console.log('isActive:', user.isActive);

      if (!user.isActive) {
        console.log('isActive is false');
        throw new UnauthorizedException('Account is deactivated');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      console.log('isPasswordValid:', isPasswordValid);

      if (isPasswordValid) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _, ...result } = user;
        return result;
      }
    } catch (error) {
      // Don't expose user existence
      return null;
    }

    return null;
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    console.log('user:', user);

    const tokens = await this.generateTokens(user);

    console.log('tokens:', tokens);

    // Update last login
    await this.usersService.updateLastLogin(user.id);

    return {
      user,
      ...tokens,
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<AuthResponse> {
    try {
      const payload = this.jwtService.verify(refreshTokenDto.refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      }) as JwtPayload;

      // Check if refresh token exists in storage
      const isValid = await this.tokenStorageService.isRefreshTokenValid(
        payload.sub,
        payload.tokenId,
      );

      if (!isValid) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Get user
      const user = await this.usersService.findOne(payload.sub);

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Account is deactivated');
      }

      // Revoke old refresh token
      await this.tokenStorageService.revokeRefreshToken(payload.sub, payload.tokenId);

      // Generate new tokens
      const tokens = await this.generateTokens(user);

      return {
        user,
        ...tokens,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: number, refreshToken: string): Promise<void> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      }) as JwtPayload;

      await this.tokenStorageService.revokeRefreshToken(userId, payload.tokenId);
    } catch (error) {
      // Token might be invalid or expired, which is fine for logout
    }
  }

  async logoutAll(userId: number): Promise<void> {
    await this.tokenStorageService.revokeAllUserTokens(userId);
  }

  async validateToken(token: string): Promise<User> {
    try {
      const payload = this.jwtService.verify(token) as JwtPayload;
      const user = await this.usersService.findOne(payload.sub);

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Account is deactivated');
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private async generateTokens(user: User): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const tokenId = uuidv4();

    const accessPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    };

    const refreshPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      tokenId,
      role: user.role,
      fullName: user.fullName,
    };

    const accessToken = this.jwtService.sign(accessPayload);

    console.log('accessToken:', accessToken);

    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d'),
    });

    console.log('refreshToken:', refreshToken);

    // Store refresh token in storage
    const refreshTtl = this.parseExpirationToSeconds(
      this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d'),
    );

    console.log('refreshTtl:', refreshTtl);

    await this.tokenStorageService.setRefreshToken(user.id, tokenId, refreshTtl);

    return {
      accessToken,
      refreshToken,
    };
  }

  private parseExpirationToSeconds(expiration: string): number {
    const match = expiration.match(/^(\d+)([smhd])$/);
    if (!match) return 604800; // Default to 7 days

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 24 * 60 * 60;
      default:
        return 604800;
    }
  }
}
