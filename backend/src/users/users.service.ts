import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      where: {
        deletedAt: null,
      },
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
  }

  async findOne(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { userId },
    });

    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found');
    }

    return {
      userId: user.userId,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  async update(userId: string, updateData: { name?: string; role?: 'dj' | 'admin' }) {
    const user = await this.prisma.user.findUnique({
      where: { userId },
    });

    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
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
  }

  async remove(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { userId },
    });

    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.update({
      where: { userId },
      data: {
        deletedAt: new Date(),
      },
    });

    return { message: 'User deleted successfully' };
  }
}
