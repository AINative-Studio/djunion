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

      expect(result).toHaveProperty('userId', '123');
      expect(result).toHaveProperty('email', 'user@example.com');
      expect(result).toHaveProperty('name', 'Test User');
      expect(result).toHaveProperty('role', 'dj');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { userId: '123' },
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
