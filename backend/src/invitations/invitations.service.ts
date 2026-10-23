import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SendInvitationDto, RespondInvitationDto } from './dto/invitation.dto';

@Injectable()
export class InvitationsService {
  constructor(private prisma: PrismaService) {}

  async getByProject(projectId: string) {
    return this.prisma.projectInvitation.findMany({
      where: { projectId },
      include: {
        inviter: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        roleGroup: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async sendInvitation(
    projectId: string,
    inviterId: string,
    dto: SendInvitationDto,
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      throw new NotFoundException('Không tìm thấy dự án');
    }

    const email = dto.recipientEmail.toLowerCase().trim();

    // Check if user with this email is already a member
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      const isMember = await this.prisma.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId: existingUser.id,
            projectId,
          },
        },
      });
      if (isMember) {
        throw new BadRequestException(
          'Người dùng với email này đã là thành viên của dự án',
        );
      }
    }

    // Check if pending invitation already exists
    const existingInvite = await this.prisma.projectInvitation.findFirst({
      where: {
        projectId,
        recipientEmail: email,
        status: 'PENDING',
      },
    });

    if (existingInvite) {
      throw new BadRequestException(
        'Đã có lời mời đang chờ xử lý gửi tới email này',
      );
    }

    const inviter = await this.prisma.user.findUnique({
      where: { id: inviterId },
    });

    const invitation = await this.prisma.projectInvitation.create({
      data: {
        projectId,
        inviterId,
        recipientEmail: email,
        recipientName: dto.recipientName || existingUser?.name || null,
        roleGroupId: dto.roleGroupId || null,
        status: 'PENDING',
      },
      include: {
        inviter: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        roleGroup: {
          select: { id: true, name: true },
        },
      },
    });

    // Create activity log
    await this.prisma.activityLog.create({
      data: {
        projectId,
        userId: inviterId,
        userName: inviter?.name || 'Chủ dự án',
        userAvatar: inviter?.avatar || 'AD',
        userRole: 'Chủ dự án (Owner)',
        category: 'member',
        action: 'Gửi lời mời tham gia dự án',
        detail: `Đã gửi lời mời tham gia tới ${email}`,
      },
    });

    return invitation;
  }

  async cancelInvitation(projectId: string, invitationId: string) {
    const invitation = await this.prisma.projectInvitation.findFirst({
      where: { id: invitationId, projectId },
    });

    if (!invitation) {
      throw new NotFoundException('Không tìm thấy lời mời');
    }

    await this.prisma.projectInvitation.delete({
      where: { id: invitationId },
    });

    return { message: 'Đã hủy lời mời thành công' };
  }

  async getMyInvitations(userEmail: string) {
    return this.prisma.projectInvitation.findMany({
      where: {
        recipientEmail: userEmail.toLowerCase().trim(),
        status: 'PENDING',
      },
      include: {
        project: {
          select: { id: true, name: true, description: true },
        },
        inviter: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        roleGroup: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async respondInvitation(
    invitationId: string,
    user: { id: string; email: string; name: string; avatar?: string | null },
    dto: RespondInvitationDto,
  ) {
    const invitation = await this.prisma.projectInvitation.findUnique({
      where: { id: invitationId },
      include: { roleGroup: true },
    });

    if (!invitation) {
      throw new NotFoundException('Không tìm thấy lời mời');
    }

    if (
      invitation.recipientEmail.toLowerCase() !==
      user.email.toLowerCase().trim()
    ) {
      throw new ForbiddenException(
        'Bạn không có quyền phản hồi lời mời dành cho tài khoản khác',
      );
    }

    if (invitation.status !== 'PENDING') {
      throw new BadRequestException('Lời mời này đã được xử lý trước đó');
    }

    if (dto.action === 'DECLINE') {
      await this.prisma.projectInvitation.update({
        where: { id: invitationId },
        data: { status: 'DECLINED' },
      });

      await this.prisma.activityLog.create({
        data: {
          projectId: invitation.projectId,
          userId: user.id,
          userName: user.name,
          userAvatar: user.avatar || user.name.slice(0, 2).toUpperCase(),
          userRole: 'Thành viên',
          category: 'member',
          action: 'Từ chối lời mời tham gia',
          detail: `${user.name} đã từ chối lời mời tham gia dự án`,
        },
      });

      return { success: true, message: 'Đã từ chối lời mời tham gia dự án' };
    }

    // ACCEPT
    const existingMember = await this.prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: user.id,
          projectId: invitation.projectId,
        },
      },
    });

    if (!existingMember) {
      await this.prisma.projectMember.create({
        data: {
          userId: user.id,
          projectId: invitation.projectId,
          roleGroupId: invitation.roleGroupId,
          extraPermissions: [],
        },
      });
    }

    await this.prisma.projectInvitation.update({
      where: { id: invitationId },
      data: { status: 'ACCEPTED' },
    });

    const roleName = invitation.roleGroup?.name || 'Thành viên';
    await this.prisma.activityLog.create({
      data: {
        projectId: invitation.projectId,
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar || user.name.slice(0, 2).toUpperCase(),
        userRole: roleName,
        category: 'member',
        action: 'Chấp nhận lời mời tham gia dự án',
        detail: `${user.name} đã gia nhập dự án với vai trò ${roleName}`,
      },
    });

    return {
      success: true,
      message: 'Đã chấp nhận lời mời và gia nhập dự án thành công',
      projectId: invitation.projectId,
    };
  }
}
