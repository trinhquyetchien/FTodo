import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ChatService } from './chat.service';
import {
  CreateChannelDto,
  SendMessageDto,
  AddChannelMemberDto,
  HeartbeatDto,
} from './dto/chat.dto';
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
    @GetUser('id') userId: string,
    @Body() dto: CreateChannelDto,
  ) {
    return this.chatService.createChannel(projectId, userId, dto);
  }

  @ApiOperation({ summary: 'Xóa một kênh chat trong dự án' })
  @ApiParam({ name: 'projectId', description: 'ID của dự án' })
  @ApiParam({ name: 'channelId', description: 'ID của kênh' })
  @Delete('projects/:projectId/channels/:channelId')
  deleteChannel(
    @Param('projectId') projectId: string,
    @Param('channelId') channelId: string,
  ) {
    return this.chatService.deleteChannel(projectId, channelId);
  }

  @ApiOperation({ summary: 'Lấy danh sách thành viên của kênh chat' })
  @ApiParam({ name: 'channelId', description: 'ID của kênh chat' })
  @Get('channels/:channelId/members')
  getChannelMembers(@Param('channelId') channelId: string) {
    return this.chatService.getChannelMembers(channelId);
  }

  @ApiOperation({ summary: 'Thêm thành viên vào kênh chat' })
  @ApiParam({ name: 'channelId', description: 'ID của kênh chat' })
  @Post('channels/:channelId/members')
  addChannelMember(
    @Param('channelId') channelId: string,
    @Body() dto: AddChannelMemberDto,
  ) {
    return this.chatService.addChannelMember(channelId, dto);
  }

  @ApiOperation({ summary: 'Xóa thành viên khỏi kênh chat' })
  @ApiParam({ name: 'channelId', description: 'ID của kênh chat' })
  @ApiParam({ name: 'userId', description: 'ID người dùng cần xóa' })
  @Delete('channels/:channelId/members/:userId')
  removeChannelMember(
    @Param('channelId') channelId: string,
    @Param('userId') userId: string,
  ) {
    return this.chatService.removeChannelMember(channelId, userId);
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

  @ApiOperation({ summary: 'Lấy lịch sử tin nhắn trực tiếp 1-1 giữa 2 người' })
  @ApiParam({ name: 'projectId', description: 'ID của dự án' })
  @ApiParam({ name: 'otherUserId', description: 'ID người dùng đối phương' })
  @Get('projects/:projectId/direct-messages/:otherUserId')
  getDirectMessages(
    @Param('projectId') projectId: string,
    @GetUser('id') userId: string,
    @Param('otherUserId') otherUserId: string,
  ) {
    return this.chatService.getDirectMessages(projectId, userId, otherUserId);
  }

  @ApiOperation({ summary: 'Gửi tin nhắn trực tiếp 1-1' })
  @ApiParam({ name: 'projectId', description: 'ID của dự án' })
  @ApiParam({ name: 'otherUserId', description: 'ID người dùng nhận tin' })
  @Post('projects/:projectId/direct-messages/:otherUserId')
  sendDirectMessage(
    @Param('projectId') projectId: string,
    @GetUser('id') userId: string,
    @Param('otherUserId') otherUserId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.chatService.sendDirectMessage(
      projectId,
      userId,
      otherUserId,
      dto,
    );
  }

  @ApiOperation({ summary: 'Gửi nhịp tim (heartbeat) cập nhật trạng thái online' })
  @Post('chat/heartbeat')
  sendHeartbeat(
    @GetUser('id') userId: string,
    @Body() dto: HeartbeatDto,
  ) {
    return this.chatService.recordHeartbeat(userId, dto);
  }

  @ApiOperation({ summary: 'Lấy trạng thái trực tuyến của người dùng' })
  @ApiQuery({ name: 'projectId', required: false, description: 'ID dự án' })
  @Get('chat/presence')
  getPresence(@Query('projectId') projectId?: string) {
    return this.chatService.getPresence(projectId);
  }
}
