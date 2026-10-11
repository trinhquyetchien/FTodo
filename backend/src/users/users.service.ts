import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async searchUsers(query: string) {
    if (!query || query.trim().length === 0) {
      return [];
    }

    return this.prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query.trim(), mode: 'insensitive' } },
          { email: { contains: query.trim(), mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
      },
      take: 10,
    });
  }
}
