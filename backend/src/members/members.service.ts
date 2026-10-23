import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  AddMemberDto,
  UpdateMemberDto,
  CreateRoleGroupDto,
  UpdateRoleGroupPermissionsDto,
} from './dto/member.dto';

@Injectable()
export class MembersService {
  constructor(private prisma: PrismaService) {}

  private async verifyProjectOwner(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      throw new NotFoundException('Không tìm thấy dự án');
    }
    if (project.ownerId !== userId) {
      throw new ForbiddenException(
        'Chỉ chủ dự án mới có quyền thực hiện thao tác này',
      );
    }
    return project;
  }

  // --- Members ---

  async getMembers(projectId: string) {
    await this.ensureDefaultRoleGroups(projectId);

    const members = await this.prisma.projectMember.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        roleGroup: true,
      },
      orderBy: { joinedAt: 'asc' },
    });

    return members.map((m) => {
      const basePerms = m.roleGroup?.permissions || [];
      const extraPerms = m.extraPermissions || [];
      const effectivePermissions = Array.from(
        new Set([...basePerms, ...extraPerms]),
      );

      return {
        id: m.id,
        userId: m.userId,
        name: m.user.name,
        email: m.user.email,
        avatar: m.user.avatar,
        roleGroup: m.roleGroup,
        extraPermissions: m.extraPermissions,
        effectivePermissions,
        joinedAt: m.joinedAt,
      };
    });
  }

  async addMember(projectId: string, currentUserId: string, dto: AddMemberDto) {
    await this.verifyProjectOwner(projectId, currentUserId);

    const userToAdd = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (!userToAdd) {
      throw new NotFoundException(
        `Không tìm thấy người dùng với email ${dto.email}`,
      );
    }

    const existingMember = await this.prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: userToAdd.id,
          projectId,
        },
      },
    });
    if (existingMember) {
      throw new ConflictException('Người dùng này đã là thành viên của dự án');
    }

    const roleGroup = await this.prisma.roleGroup.findFirst({
      where: { id: dto.roleGroupId, projectId },
    });
    if (!roleGroup) {
      throw new BadRequestException(
        'Nhóm phân quyền không hợp lệ trong dự án này',
      );
    }

    return this.prisma.projectMember.create({
      data: {
        projectId,
        userId: userToAdd.id,
        roleGroupId: roleGroup.id,
        extraPermissions: [],
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        roleGroup: true,
      },
    });
  }

  async updateMember(
    projectId: string,
    memberId: string,
    currentUserId: string,
    dto: UpdateMemberDto,
  ) {
    const project = await this.verifyProjectOwner(projectId, currentUserId);

    const member = await this.prisma.projectMember.findUnique({
      where: { id: memberId },
    });
    if (!member || member.projectId !== projectId) {
      throw new NotFoundException('Không tìm thấy thành viên trong dự án');
    }

    // Do not allow demoting project owner
    if (member.userId === project.ownerId) {
      throw new ForbiddenException('Không thể thay đổi quyền của chủ dự án');
    }

    const roleGroup = await this.prisma.roleGroup.findFirst({
      where: { id: dto.roleGroupId, projectId },
    });
    if (!roleGroup) {
      throw new BadRequestException('Nhóm phân quyền không tồn tại');
    }

    return this.prisma.projectMember.update({
      where: { id: memberId },
      data: {
        roleGroupId: roleGroup.id,
        extraPermissions: dto.extraPermissions,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        roleGroup: true,
      },
    });
  }

  async removeMember(
    projectId: string,
    memberId: string,
    currentUserId: string,
  ) {
    const project = await this.verifyProjectOwner(projectId, currentUserId);

    const member = await this.prisma.projectMember.findUnique({
      where: { id: memberId },
    });
    if (!member || member.projectId !== projectId) {
      throw new NotFoundException('Không tìm thấy thành viên');
    }

    if (member.userId === project.ownerId) {
      throw new ForbiddenException('Không thể xóa chủ dự án khỏi dự án');
    }

    await this.prisma.projectMember.delete({
      where: { id: memberId },
    });

    return { message: 'Đã xóa thành viên khỏi dự án' };
  }

  // --- Role Groups ---

  async ensureDefaultRoleGroups(projectId: string) {
    const fullPerms = [
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

    const memberPerms = [
      'overview',
      'board',
      'backlog',
      'timeline',
      'issues',
      'chat',
    ];

    const existingGroups = await this.prisma.roleGroup.findMany({
      where: { projectId },
    });

    // 1. Luôn tồn tại nhóm 1: Chủ dự án (cố định và không thể xóa)
    let ownerGroup = existingGroups.find(
      (g) =>
        g.name === 'Chủ dự án' ||
        g.name === 'Admin' ||
        g.name === 'Chủ sở hữu',
    );

    if (!ownerGroup) {
      ownerGroup = await this.prisma.roleGroup.create({
        data: {
          name: 'Chủ dự án',
          permissions: fullPerms,
          isDefault: false,
          projectId,
        },
      });
    } else {
      const needRename = ownerGroup.name === 'Admin';
      const needPerms = ownerGroup.permissions.length < fullPerms.length;
      if (needRename || needPerms) {
        ownerGroup = await this.prisma.roleGroup.update({
          where: { id: ownerGroup.id },
          data: {
            name: 'Chủ dự án',
            permissions: fullPerms,
          },
        });
      }
    }

    // 2. Luôn tồn tại nhóm 2: Thành viên (nhóm mặc định cho thành viên bình thường)
    let memberGroup = existingGroups.find(
      (g) =>
        g.name === 'Thành viên' ||
        g.name === 'Thành viên bình thường' ||
        (g.isDefault && g.id !== ownerGroup?.id),
    );

    if (!memberGroup) {
      memberGroup = await this.prisma.roleGroup.create({
        data: {
          name: 'Thành viên',
          permissions: memberPerms,
          isDefault: true,
          projectId,
        },
      });
    } else if (memberGroup.name !== 'Thành viên' && memberGroup.isDefault) {
      await this.prisma.roleGroup.update({
        where: { id: memberGroup.id },
        data: {
          name: 'Thành viên',
          isDefault: true,
        },
      });
    }

    // 3. Đảm bảo Chủ dự án luôn có tài khoản thành viên liên kết với nhóm Chủ dự án
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { ownerId: true },
    });

    if (project?.ownerId && ownerGroup) {
      const ownerMember = await this.prisma.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId: project.ownerId,
            projectId,
          },
        },
      });
      if (!ownerMember) {
        await this.prisma.projectMember
          .create({
            data: {
              projectId,
              userId: project.ownerId,
              roleGroupId: ownerGroup.id,
              extraPermissions: [],
            },
          })
          .catch(() => {});
      } else if (ownerMember.roleGroupId !== ownerGroup.id) {
        await this.prisma.projectMember
          .update({
            where: { id: ownerMember.id },
            data: { roleGroupId: ownerGroup.id },
          })
          .catch(() => {});
      }
    }

    return { ownerGroup, memberGroup };
  }

  async getRoleGroups(projectId: string) {
    await this.ensureDefaultRoleGroups(projectId);

    return this.prisma.roleGroup.findMany({
      where: { projectId },
      include: {
        _count: {
          select: { members: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createRoleGroup(
    projectId: string,
    currentUserId: string,
    dto: CreateRoleGroupDto,
  ) {
    await this.verifyProjectOwner(projectId, currentUserId);

    const trimmedName = dto.name.trim();
    const lowerName = trimmedName.toLowerCase();

    if (['chủ dự án', 'admin', 'chủ sở hữu'].includes(lowerName)) {
      throw new BadRequestException('Tên nhóm quyền này trùng với nhóm Chủ dự án cố định');
    }
    if (['thành viên', 'thành viên bình thường'].includes(lowerName)) {
      throw new BadRequestException('Tên nhóm quyền này trùng với nhóm Thành viên cơ bản mặc định');
    }

    const existing = await this.prisma.roleGroup.findUnique({
      where: {
        projectId_name: {
          projectId,
          name: trimmedName,
        },
      },
    });
    if (existing) {
      throw new ConflictException(`Nhóm phân quyền "${trimmedName}" đã tồn tại`);
    }

    return this.prisma.roleGroup.create({
      data: {
        name: trimmedName,
        permissions: dto.permissions,
        projectId,
        isDefault: false,
      },
    });
  }

  async updateRoleGroupPermissions(
    projectId: string,
    roleGroupId: string,
    currentUserId: string,
    dto: UpdateRoleGroupPermissionsDto,
  ) {
    await this.verifyProjectOwner(projectId, currentUserId);

    const role = await this.prisma.roleGroup.findFirst({
      where: { id: roleGroupId, projectId },
    });
    if (!role) {
      throw new NotFoundException('Không tìm thấy nhóm phân quyền');
    }

    const isOwnerRole =
      role.name === 'Chủ dự án' ||
      role.name === 'Admin' ||
      role.name === 'Chủ sở hữu';
    if (isOwnerRole) {
      throw new ForbiddenException('Nhóm Chủ dự án luôn có toàn bộ quyền hạn cố định, không thể sửa đổi');
    }

    return this.prisma.roleGroup.update({
      where: { id: roleGroupId },
      data: {
        permissions: dto.permissions,
      },
    });
  }

  async deleteRoleGroup(
    projectId: string,
    roleGroupId: string,
    currentUserId: string,
  ) {
    await this.verifyProjectOwner(projectId, currentUserId);

    const role = await this.prisma.roleGroup.findFirst({
      where: { id: roleGroupId, projectId },
    });
    if (!role) {
      throw new NotFoundException('Không tìm thấy nhóm phân quyền');
    }

    const isOwnerRole =
      role.name === 'Chủ dự án' ||
      role.name === 'Admin' ||
      role.name === 'Chủ sở hữu';
    if (isOwnerRole) {
      throw new ForbiddenException('Nhóm quyền Chủ dự án là cố định và không thể xóa');
    }

    const isMemberRole =
      role.name === 'Thành viên' ||
      role.name === 'Thành viên bình thường' ||
      role.isDefault;
    if (isMemberRole) {
      throw new ForbiddenException('Nhóm quyền Thành viên là nhóm cơ bản mặc định, không thể xóa');
    }

    // Set members in this group to null roleGroupId or default
    await this.prisma.roleGroup.delete({
      where: { id: roleGroupId },
    });

    return { message: 'Đã xóa nhóm phân quyền' };
  }
}
