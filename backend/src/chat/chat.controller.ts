import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { CreateChannelDto, SendMessageDto } from './dto/chat.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';

@ApiTags('Chat')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @ApiOperation({ summary: 'Lấy danh sách các kênh chat của dự án' })
  @ApiParam({ name: 'projectId', description: 'ID của dự án' })
  @Get('projects/:projectId/channels')
  getChannels(@Param('projectId') projectId: string) {
    return this.chatService.getChannels(projectId);
  }

  @ApiOperation({ summary: 'Tạo một kênh chat mới trong dự án' })
  @ApiParam({ name: 'projectId', description: 'ID của dự án' })
  @ApiResponse({ status: 201, description: 'Kênh chat đã được tạo' })
  @Post('projects/:projectId/channels')
  createChannel(
    @Param('projectId') projectId: string,
    @Body() dto: CreateChannelDto,
  ) {
    return this.chatService.createChannel(projectId, dto);
  }

  @ApiOperation({ summary: 'Lấy lịch sử tin nhắn trong kênh' })
  @ApiParam({ name: 'channelId', description: 'ID của kênh chat' })
  @Get('channels/:channelId/messages')
  getMessages(@Param('channelId') channelId: string) {
    return this.chatService.getMessages(channelId);
  }

  @ApiOperation({ summary: 'Gửi tin nhắn vào kênh chat' })
  @ApiParam({ name: 'channelId', description: 'ID của kênh chat' })
  @ApiResponse({ status: 201, description: 'Tin nhắn đã được gửi' })
  @Post('channels/:channelId/messages')
  sendMessage(
    @Param('channelId') channelId: string,
    @GetUser('id') userId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.chatService.sendMessage(channelId, userId, dto);
  }
}
