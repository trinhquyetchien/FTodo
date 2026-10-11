import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateProjectDto) {
    // 1. Create project
    const project = await this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        ownerId: userId,
      },
    });

    // 2. Create default RoleGroups for this project
    const adminRole = await this.prisma.roleGroup.create({
      data: {
        name: 'Admin',
        permissions: ['overview', 'board', 'backlog', 'members', 'chat', 'cost', 'settings'],
        isDefault: false,
        projectId: project.id,
      },
    });

    await this.prisma.roleGroup.createMany({
      data: [
        {
          name: 'DEV',
          permissions: ['overview', 'board', 'backlog', 'chat'],
          isDefault: true,
          projectId: project.id,
        },
        {
          name: 'QA',
          permissions: ['overview', 'board', 'chat'],
          isDefault: false,
          projectId: project.id,
        },
        {
          name: 'Viewer',
          permissions: ['overview'],
          isDefault: false,
          projectId: project.id,
        },
      ],
    });

    // 3. Create default Channels for team chat
    await this.prisma.channel.createMany({
      data: [
        {
          name: 'chung',
          description: 'Kênh thảo luận chung cho toàn bộ dự án',
          projectId: project.id,
        },
        {
          name: 'phat-trien',
          description: 'Kênh thảo luận kỹ thuật & mã nguồn',
          projectId: project.id,
        },
      ],
    });

    // 4. Add creator as project member with Admin role group
    await this.prisma.projectMember.create({
      data: {
        userId,
        projectId: project.id,
        roleGroupId: adminRole.id,
        extraPermissions: [],
      },
    });

    return project;
  }

  async findAllForUser(userId: string) {
    // Projects owned by user
    const owned = await this.prisma.project.findMany({
      where: { ownerId: userId },
      include: {
        _count: {
          select: {
            members: true,
            tasks: true,
          },
        },
        tasks: {
          select: { status: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Projects where user is a member but not the owner
    const memberships = await this.prisma.projectMember.findMany({
      where: {
        userId,
        project: {
          ownerId: { not: userId },
        },
      },
      include: {
        project: {
          include: {
            _count: {
              select: {
                members: true,
                tasks: true,
              },
            },
            tasks: {
              select: { status: true },
            },
          },
        },
        roleGroup: true,
      },
      orderBy: { joinedAt: 'desc' },
    });

    const formatProjectWithStats = (p: any, role: string) => {
      const totalTasks = p._count?.tasks || 0;
      const completedTasks = p.tasks?.filter((t: any) => t.status === 'DONE').length || 0;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return {
        id: p.id,
        name: p.name,
        description: p.description,
        progress,
        tasks: totalTasks,
        completedTasks,
        members: p._count?.members || 1,
        role,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      };
    };

    return {
      owned: owned.map((p) => formatProjectWithStats(p, 'owner')),
      memberOf: memberships.map((m) => formatProjectWithStats(m.project, 'member')),
    };
  }

  async findOne(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        owner: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
            roleGroup: true,
          },
        },
        roleGroups: true,
        channels: true,
        _count: {
          select: {
            tasks: true,
            sprints: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Không tìm thấy dự án');
    }

    const isOwner = project.ownerId === userId;
    const memberRecord = project.members.find((m) => m.userId === userId);

    if (!isOwner && !memberRecord) {
      throw new ForbiddenException('Bạn không có quyền truy cập dự án này');
    }

    // Compute effective permissions for current user
    let effectivePermissions: string[] = [];
    if (isOwner) {
      effectivePermissions = ['overview', 'board', 'backlog', 'members', 'chat', 'cost', 'settings'];
    } else if (memberRecord) {
      const basePerms = memberRecord.roleGroup?.permissions || [];
      const extraPerms = memberRecord.extraPermissions || [];
      effectivePermissions = Array.from(new Set([...basePerms, ...extraPerms]));
    }

    return {
      ...project,
      currentUserRole: isOwner ? 'owner' : 'member',
      effectivePermissions,
    };
  }

  async update(projectId: string, userId: string, dto: { name?: string; description?: string }) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Không tìm thấy dự án');
    }

    if (project.ownerId !== userId) {
      throw new ForbiddenException('Chỉ chủ dự án mới có quyền chỉnh sửa thông tin dự án');
    }

    return this.prisma.project.update({
      where: { id: projectId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
      },
    });
  }

  async remove(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Không tìm thấy dự án');
    }

    if (project.ownerId !== userId) {
      throw new ForbiddenException('Chỉ chủ dự án mới có quyền xóa dự án này');
    }

    await this.prisma.project.delete({
      where: { id: projectId },
    });

    return { message: 'Đã xóa dự án thành công' };
  }
}
