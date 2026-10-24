import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateChannelDto,
  SendMessageDto,
  AddChannelMemberDto,
  HeartbeatDto,
} from './dto/chat.dto';

interface UserPresenceEntry {
  userId: string;
  lastSeen: number;
  status: 'online' | 'busy' | 'offline';
  projectId?: string;
}

@Injectable()
export class ChatService {
  private presenceMap = new Map<string, UserPresenceEntry>();

  constructor(private prisma: PrismaService) {}

  recordHeartbeat(userId: string, dto?: HeartbeatDto) {
    const status =
      dto?.status === 'busy' || dto?.status === 'offline'
        ? (dto.status as 'busy' | 'offline')
        : 'online';
    this.presenceMap.set(userId, {
      userId,
      lastSeen: Date.now(),
      status,
      projectId: dto?.projectId,
    });
    return { success: true, timestamp: Date.now(), status };
  }

  getPresence(projectId?: string) {
    const now = Date.now();
    const OFFLINE_THRESHOLD_MS = 45 * 1000; // 45 seconds without heartbeat = offline
    const onlineUserIds: string[] = [];
    const statuses: Record<string, 'online' | 'busy' | 'offline'> = {};

    for (const [userId, entry] of this.presenceMap.entries()) {
      if (now - entry.lastSeen <= OFFLINE_THRESHOLD_MS) {
        if (entry.status !== 'offline') {
          onlineUserIds.push(userId);
        }
        statuses[userId] = entry.status;
      } else {
        statuses[userId] = 'offline';
      }
    }

    return { onlineUserIds, statuses };
  }

  async getChannels(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: { select: { userId: true } },
      },
    });

    if (!project) {
      throw new NotFoundException('Không tìm thấy dự án');
    }

    const channels = await this.prisma.channel.findMany({
      where: { projectId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                role: true,
              },
            },
          },
        },
        _count: {
          select: { messages: true, members: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Auto-create default channels if none exist for this project
    if (channels.length === 0) {
      const defaultMembers = [
        project.ownerId,
        ...project.members.map((m) => m.userId),
      ];
      const uniqueMemberIds = Array.from(new Set(defaultMembers));

      const chungChannel = await this.prisma.channel.create({
        data: {
          name: 'chung',
          description: 'Kênh thảo luận chung cho toàn thể dự án',
          projectId,
          members: {
            create: uniqueMemberIds.map((uId) => ({
              userId: uId,
              role: uId === project.ownerId ? 'ADMIN' : 'MEMBER',
            })),
          },
        },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatar: true,
                  role: true,
                },
              },
            },
          },
          _count: {
            select: { messages: true, members: true },
          },
        },
      });

      const devChannel = await this.prisma.channel.create({
        data: {
          name: 'phat-trien',
          description: 'Thảo luận kỹ thuật, kiến trúc và mã nguồn',
          projectId,
          members: {
            create: uniqueMemberIds.map((uId) => ({
              userId: uId,
              role: uId === project.ownerId ? 'ADMIN' : 'MEMBER',
            })),
          },
        },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatar: true,
                  role: true,
                },
              },
            },
          },
          _count: {
            select: { messages: true, members: true },
          },
        },
      });

      return [chungChannel, devChannel];
    }

    // Ensure existing channels have members populated if empty
    const allMemberIds = Array.from(
      new Set([project.ownerId, ...project.members.map((m) => m.userId)]),
    );

    for (const ch of channels) {
      if (ch.members.length === 0) {
        await this.prisma.channelMember.createMany({
          data: allMemberIds.map((uId) => ({
            channelId: ch.id,
            userId: uId,
            role: uId === project.ownerId ? 'ADMIN' : 'MEMBER',
          })),
          skipDuplicates: true,
        });
      }
    }

    // Re-fetch if any channel members were populated
    return this.prisma.channel.findMany({
      where: { projectId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                role: true,
              },
            },
          },
        },
        _count: {
          select: { messages: true, members: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createChannel(
    projectId: string,
    userId: string,
    dto: CreateChannelDto,
  ) {
    const formattedName = dto.name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-_]/g, '');

    if (!formattedName) {
      throw new ConflictException('Tên kênh không hợp lệ');
    }

    const existing = await this.prisma.channel.findUnique({
      where: {
        projectId_name: {
          projectId,
          name: formattedName,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        `Kênh #${formattedName} đã tồn tại trong dự án`,
      );
    }

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { members: { select: { userId: true } } },
    });

    if (!project) {
      throw new NotFoundException('Không tìm thấy dự án');
    }

    // Determine initial members
    let memberIdsToAdd: string[] = [];
    if (dto.memberIds && dto.memberIds.length > 0) {
      memberIdsToAdd = Array.from(new Set([userId, ...dto.memberIds]));
    } else if (!dto.isPrivate) {
      memberIdsToAdd = Array.from(
        new Set([
          userId,
          project.ownerId,
          ...project.members.map((m) => m.userId),
        ]),
      );
    } else {
      memberIdsToAdd = [userId];
    }

    return this.prisma.channel.create({
      data: {
        name: formattedName,
        description: dto.description || '',
        isPrivate: dto.isPrivate || false,
        projectId,
        members: {
          create: memberIdsToAdd.map((uId) => ({
            userId: uId,
            role: uId === userId ? 'ADMIN' : 'MEMBER',
          })),
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                role: true,
              },
            },
          },
        },
        _count: {
          select: { messages: true, members: true },
        },
      },
    });
  }

  async deleteChannel(projectId: string, channelId: string) {
    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId },
    });

    if (!channel || channel.projectId !== projectId) {
      throw new NotFoundException('Không tìm thấy kênh chat trong dự án');
    }

    if (channel.name === 'chung') {
      throw new ForbiddenException(
        'Không thể xóa kênh chung mặc định của dự án',
      );
    }

    await this.prisma.channel.delete({
      where: { id: channelId },
    });

    return { message: `Đã xóa kênh #${channel.name} thành công` };
  }

  async getChannelMembers(channelId: string) {
    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId },
    });
    if (!channel) {
      throw new NotFoundException('Không tìm thấy kênh chat');
    }

    return this.prisma.channelMember.findMany({
      where: { channelId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });
  }

  async addChannelMember(channelId: string, dto: AddChannelMemberDto) {
    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId },
    });
    if (!channel) {
      throw new NotFoundException('Không tìm thấy kênh chat');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    return this.prisma.channelMember.upsert({
      where: {
        channelId_userId: {
          channelId,
          userId: dto.userId,
        },
      },
      update: {
        role: dto.role || 'MEMBER',
      },
      create: {
        channelId,
        userId: dto.userId,
        role: dto.role || 'MEMBER',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
      },
    });
  }

  async removeChannelMember(channelId: string, userId: string) {
    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId },
    });
    if (!channel) {
      throw new NotFoundException('Không tìm thấy kênh chat');
    }

    const member = await this.prisma.channelMember.findUnique({
      where: {
        channelId_userId: {
          channelId,
          userId,
        },
      },
    });

    if (!member) {
      throw new NotFoundException('Người dùng không thuộc kênh này');
    }

    await this.prisma.channelMember.delete({
      where: {
        channelId_userId: {
          channelId,
          userId,
        },
      },
    });

    return { message: 'Đã xóa thành viên khỏi kênh' };
  }

  async getMessages(channelId: string) {
    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId },
    });
    if (!channel) {
      throw new NotFoundException('Không tìm thấy kênh chat');
    }

    return this.prisma.message.findMany({
      where: { channelId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async sendMessage(channelId: string, userId: string, dto: SendMessageDto) {
    this.recordHeartbeat(userId);
    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId },
    });
    if (!channel) {
      throw new NotFoundException('Không tìm thấy kênh chat');
    }

    return this.prisma.message.create({
      data: {
        content: dto.content,
        attachment: dto.attachment,
        channelId,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });
  }

  async getDirectMessages(
    projectId: string,
    currentUserId: string,
    otherUserId: string,
  ) {
    if (currentUserId === otherUserId) {
      return [];
    }

    return this.prisma.message.findMany({
      where: {
        OR: [
          { userId: currentUserId, recipientId: otherUserId },
          { userId: otherUserId, recipientId: currentUserId },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async sendDirectMessage(
    projectId: string,
    currentUserId: string,
    otherUserId: string,
    dto: SendMessageDto,
  ) {
    this.recordHeartbeat(currentUserId, { projectId });
    if (currentUserId === otherUserId) {
      throw new ForbiddenException('Không thể gửi tin nhắn cho chính mình');
    }

    const recipient = await this.prisma.user.findUnique({
      where: { id: otherUserId },
    });
    if (!recipient) {
      throw new NotFoundException('Không tìm thấy người nhận tin nhắn');
    }

    return this.prisma.message.create({
      data: {
        content: dto.content,
        attachment: dto.attachment,
        userId: currentUserId,
        recipientId: otherUserId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });
  }
}
