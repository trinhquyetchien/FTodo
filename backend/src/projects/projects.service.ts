import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
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

    // 2. Create default RoleGroups for this project:
    // Nhóm 1: Chủ dự án (cố định và không thể xóa)
    const ownerRole = await this.prisma.roleGroup.create({
      data: {
        name: 'Chủ dự án',
        permissions: [
          'overview',
          'board',
          'backlog',
          'timeline',
          'issues',
          'reports',
          'releases',
          'components',
          'members',
          'chat',
          'cost',
          'activity',
          'settings',
        ],
        isDefault: false,
        projectId: project.id,
      },
    });

    // Nhóm 2: Thành viên (nhóm cơ bản mặc định cho thành viên bình thường)
    await this.prisma.roleGroup.create({
      data: {
        name: 'Thành viên',
        permissions: [
          'overview',
          'board',
          'backlog',
          'timeline',
          'issues',
          'chat',
        ],
        isDefault: true,
        projectId: project.id,
      },
    });

    // 2.1 Link project owner as member with Chủ dự án role
    await this.prisma.projectMember.create({
      data: {
        projectId: project.id,
        userId,
        roleGroupId: ownerRole.id,
        extraPermissions: [],
      },
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

    interface ProjectWithStatsInput {
      id: string;
      name: string;
      description: string | null;
      _count?: {
        members?: number;
        tasks?: number;
      };
      tasks?: Array<{ status: string }>;
      createdAt: Date;
      updatedAt: Date;
    }

    const formatProjectWithStats = (p: ProjectWithStatsInput, role: string) => {
      const totalTasks = p._count?.tasks || 0;
      const completedTasks =
        p.tasks?.filter((t) => t.status === 'DONE').length || 0;
      const progress =
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

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
      memberOf: memberships.map((m) =>
        formatProjectWithStats(m.project, 'member'),
      ),
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
      effectivePermissions = [
        'overview',
        'board',
        'backlog',
        'timeline',
        'issues',
        'reports',
        'releases',
        'components',
        'members',
        'chat',
        'cost',
        'activity',
        'settings',
      ];
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

  async update(
    projectId: string,
    userId: string,
    dto: { name?: string; description?: string; budget?: number },
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Không tìm thấy dự án');
    }

    if (project.ownerId !== userId) {
      throw new ForbiddenException(
        'Chỉ chủ dự án mới có quyền chỉnh sửa thông tin dự án',
      );
    }

    return this.prisma.project.update({
      where: { id: projectId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.budget !== undefined && { budget: dto.budget }),
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
