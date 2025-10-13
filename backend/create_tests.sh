#!/bin/bash

# Auth Service Tests
cat > src/auth/auth.service.spec.ts << 'EOF'
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt');
jest.mock('fs');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        name: 'Test User',
      };

      const mockUser = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        email: registerDto.email,
        name: registerDto.name,
        role: 'dj',
        createdAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('message', 'User registered successfully');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(registerDto.email);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 12);
    });

    it('should throw ConflictException if email already exists', async () => {
      const registerDto = {
        email: 'existing@example.com',
        password: 'SecurePass123!',
        name: 'Test User',
      };

      mockPrismaService.user.findUnique.mockResolvedValue({
        userId: '123',
        email: registerDto.email,
      });

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
      await expect(service.register(registerDto)).rejects.toThrow('Email already exists');
    });
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'SecurePass123!',
      };

      const mockUser = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        email: loginDto.email,
        passwordHash: 'hashedPassword',
        name: 'Test User',
        role: 'dj',
        deletedAt: null,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('mock.jwt.token');
      mockPrismaService.refreshToken.create.mockResolvedValue({});

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('expiresIn', 900);
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(loginDto.email);
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'SecurePass123!',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');
    });

    it('should throw UnauthorizedException for incorrect password', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'WrongPassword',
      };

      const mockUser = {
        userId: '123',
        email: loginDto.email,
        passwordHash: 'hashedPassword',
        deletedAt: null,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');
    });

    it('should throw UnauthorizedException for deleted user', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'SecurePass123!',
      };

      const mockUser = {
        userId: '123',
        email: loginDto.email,
        passwordHash: 'hashedPassword',
        deletedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('refreshToken', () => {
    it('should successfully refresh tokens', async () => {
      const refreshToken = 'valid.refresh.token';

      const mockTokenRecord = {
        tokenId: '123',
        refreshToken,
        user: {
          userId: '456',
          email: 'test@example.com',
          role: 'dj',
          deletedAt: null,
        },
        expiresAt: new Date(Date.now() + 86400000),
      };

      mockPrismaService.refreshToken.findFirst.mockResolvedValue(mockTokenRecord);
      mockJwtService.sign.mockReturnValue('new.jwt.token');
      mockPrismaService.refreshToken.delete.mockResolvedValue({});
      mockPrismaService.refreshToken.create.mockResolvedValue({});

      const result = await service.refreshToken(refreshToken);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('expiresIn', 900);
      expect(prisma.refreshToken.delete).toHaveBeenCalled();
      expect(prisma.refreshToken.create).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      const refreshToken = 'invalid.refresh.token';

      mockPrismaService.refreshToken.findFirst.mockResolvedValue(null);

      await expect(service.refreshToken(refreshToken)).rejects.toThrow(UnauthorizedException);
      await expect(service.refreshToken(refreshToken)).rejects.toThrow(
        'Invalid or expired refresh token',
      );
    });
  });

  describe('logout', () => {
    it('should successfully logout user', async () => {
      const refreshToken = 'valid.refresh.token';

      mockPrismaService.refreshToken.deleteMany.mockResolvedValue({ count: 1 });

      const result = await service.logout(refreshToken);

      expect(result).toHaveProperty('message', 'Logged out successfully');
      expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { refreshToken },
      });
    });
  });
});
EOF

# Users Service Tests
cat > src/users/users.service.spec.ts << 'EOF'
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const mockUsers = [
        {
          userId: '123',
          email: 'user1@example.com',
          name: 'User One',
          role: 'dj',
          createdAt: new Date(),
        },
        {
          userId: '456',
          email: 'user2@example.com',
          name: 'User Two',
          role: 'admin',
          createdAt: new Date(),
        },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(result).toEqual(mockUsers);
      expect(result).toHaveLength(2);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        select: {
          userId: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      const mockUser = {
        userId: '123',
        email: 'user@example.com',
        name: 'Test User',
        role: 'dj',
        createdAt: new Date(),
        deletedAt: null,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOne('123');

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { userId: '123' },
        select: {
          userId: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('nonexistent')).rejects.toThrow('User not found');
    });
  });

  describe('update', () => {
    it('should successfully update user', async () => {
      const userId = '123';
      const updateData = { name: 'Updated Name' };

      const mockUser = {
        userId,
        email: 'user@example.com',
        deletedAt: null,
      };

      const updatedUser = {
        ...mockUser,
        ...updateData,
        role: 'dj',
        createdAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update(userId, updateData);

      expect(result.name).toBe('Updated Name');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { userId },
        data: updateData,
        select: {
          userId: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.update('nonexistent', { name: 'New Name' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should successfully soft delete user', async () => {
      const userId = '123';

      const mockUser = {
        userId,
        email: 'user@example.com',
        deletedAt: null,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        deletedAt: new Date(),
      });

      const result = await service.remove(userId);

      expect(result).toHaveProperty('message', 'User deleted successfully');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { userId },
        data: {
          deletedAt: expect.any(Date),
        },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
EOF

echo "Unit tests created successfully!"

