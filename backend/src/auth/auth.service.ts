import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class AuthService {
  private readonly privateKey: Buffer;
  private readonly publicKey: Buffer;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {
    this.privateKey = readFileSync(
      join(process.cwd(), process.env.JWT_PRIVATE_KEY_PATH || './keys/jwt_private.pem'),
    );
    this.publicKey = readFileSync(
      join(process.cwd(), process.env.JWT_PUBLIC_KEY_PATH || './keys/jwt_public.pem'),
    );
  }

  async register(registerDto: RegisterDto) {
    const { email, password, name } = registerDto;

    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role: 'dj',
      },
      select: {
        userId: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return {
      message: 'User registered successfully',
      user,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.deletedAt) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user);

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    await this.prisma.refreshToken.create({
      data: {
        userId: user.userId,
        refreshToken,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes
      user: {
        userId: user.userId,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    // Verify refresh token exists in DB
    const tokenRecord = await this.prisma.refreshToken.findFirst({
      where: {
        refreshToken,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });

    if (!tokenRecord || tokenRecord.user.deletedAt) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Generate new tokens
    const tokens = await this.generateTokens(tokenRecord.user);

    // Delete old refresh token
    await this.prisma.refreshToken.delete({
      where: {
        tokenId: tokenRecord.tokenId,
      },
    });

    // Store new refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await this.prisma.refreshToken.create({
      data: {
        userId: tokenRecord.user.userId,
        refreshToken: tokens.refreshToken,
        expiresAt,
      },
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: 900,
    };
  }

  async logout(refreshToken: string) {
    await this.prisma.refreshToken.deleteMany({
      where: { refreshToken },
    });

    return { message: 'Logged out successfully' };
  }

  private async generateTokens(user: any) {
    const payload = {
      sub: user.userId,
      email: user.email,
      role: user.role,
      scopes: this.getUserScopes(user.role),
    };

    const accessToken = this.jwtService.sign(payload, {
      privateKey: this.privateKey,
      algorithm: 'RS256',
      expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION || '15m',
    });

    const refreshToken = this.jwtService.sign(
      { sub: user.userId },
      {
        privateKey: this.privateKey,
        algorithm: 'RS256',
        expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION || '30d',
      },
    );

    return { accessToken, refreshToken };
  }

  private getUserScopes(role: string): string[] {
    if (role === 'admin') {
      return ['users:read', 'users:write', 'users:delete', 'streams:write', 'streams:read'];
    }
    return ['streams:write', 'streams:read'];
  }
}
