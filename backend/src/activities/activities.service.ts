import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateActivityDto } from './dto/create-activity.dto';

@Injectable()
export class ActivitiesService {
  constructor(private prisma: PrismaService) {}

  async getActivities(projectId: string) {
    const logs = await this.prisma.activityLog.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return logs.map((l) => {
      const now = Date.now();
      const diffMs = now - new Date(l.createdAt).getTime();
      const diffMins = Math.floor(diffMs / (60 * 1000));
      const diffHours = Math.floor(diffMs / (3600 * 1000));
      const diffDays = Math.floor(diffMs / (24 * 3600 * 1000));

      let timeAgo = 'Vừa xong';
      if (diffMins > 0 && diffMins < 60) {
        timeAgo = `${diffMins} phút trước`;
      } else if (diffHours >= 1 && diffHours < 24) {
        timeAgo = `${diffHours} giờ trước`;
      } else if (diffDays >= 1) {
        timeAgo = `${diffDays} ngày trước`;
      }

      const dateStr = new Date(l.createdAt).toLocaleDateString('vi-VN');
      const timeStr = new Date(l.createdAt).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      });

      return {
        id: l.id,
        projectId: l.projectId,
        userId: l.userId,
        userName: l.userName,
        userAvatar: l.userAvatar || l.userName.slice(0, 2).toUpperCase(),
        userRole: l.userRole || 'Thành viên',
        category: l.category,
        action: l.action,
        detail: l.detail,
        timestamp: `${dateStr} lúc ${timeStr}`,
        timeAgo,
        createdAt: l.createdAt,
      };
    });
  }

  async createActivity(
    projectId: string,
    user: { id: string; name: string; avatar?: string | null; role?: string },
    dto: CreateActivityDto,
  ) {
    return this.prisma.activityLog.create({
      data: {
        projectId,
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar || user.name.slice(0, 2).toUpperCase(),
        userRole: user.role === 'ADMIN' ? 'Chủ dự án (Owner)' : 'Thành viên',
        category: dto.category,
        action: dto.action,
        detail: dto.detail || '',
      },
    });
  }
}
