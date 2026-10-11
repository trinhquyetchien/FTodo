import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCostDto } from './dto/cost.dto';

@Injectable()
export class CostsService {
  constructor(private prisma: PrismaService) {}

  async getCosts(projectId: string) {
    const costs = await this.prisma.cost.findMany({
      where: { projectId },
      include: {
        requester: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        sprint: {
          select: { id: true, name: true },
        },
      },
      orderBy: { date: 'desc' },
    });

    const totalSpent = costs
      .filter((c) => c.status === 'PAID' || c.status === 'APPROVED')
      .reduce((sum, item) => sum + item.amount, 0);

    // Group by category
    const categoryTotals: Record<string, number> = {};
    costs.forEach((c) => {
      categoryTotals[c.category] = (categoryTotals[c.category] || 0) + c.amount;
    });

    return {
      costs,
      summary: {
        totalSpent,
        categoryTotals,
        count: costs.length,
      },
    };
  }

  async createCost(projectId: string, userId: string, dto: CreateCostDto) {
    return this.prisma.cost.create({
      data: {
        title: dto.title,
        category: dto.category,
        amount: dto.amount,
        date: dto.date ? new Date(dto.date) : new Date(),
        status: dto.status || 'PENDING',
        projectId,
        sprintId: dto.sprintId || null,
        requesterId: userId,
      },
      include: {
        requester: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    });
  }

  async updateCostStatus(projectId: string, costId: string, status: string) {
    const cost = await this.prisma.cost.findFirst({
      where: { id: costId, projectId },
    });
    if (!cost) {
      throw new NotFoundException('Không tìm thấy khoản chi');
    }

    return this.prisma.cost.update({
      where: { id: costId },
      data: { status },
    });
  }

  async deleteCost(projectId: string, costId: string) {
    const cost = await this.prisma.cost.findFirst({
      where: { id: costId, projectId },
    });
    if (!cost) {
      throw new NotFoundException('Không tìm thấy khoản chi');
    }

    await this.prisma.cost.delete({
      where: { id: costId },
    });

    return { message: 'Đã xóa khoản chi' };
  }
}
