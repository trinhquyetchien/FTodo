import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChannelDto, SendMessageDto } from './dto/chat.dto';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async getChannels(projectId: string) {
    return this.prisma.channel.findMany({
      where: { projectId },
      include: {
        _count: {
          select: { messages: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createChannel(projectId: string, dto: CreateChannelDto) {
    const existing = await this.prisma.channel.findUnique({
      where: {
        projectId_name: {
          projectId,
          name: dto.name.toLowerCase().trim(),
        },
      },
    });

    if (existing) {
      throw new ConflictException(`Kênh #${dto.name} đã tồn tại trong dự án`);
    }

    return this.prisma.channel.create({
      data: {
        name: dto.name.toLowerCase().trim(),
        description: dto.description,
        projectId,
      },
    });
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
}
