import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChannelDto, SendMessageDto } from './dto/chat.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('projects/:projectId/channels')
  getChannels(@Param('projectId') projectId: string) {
    return this.chatService.getChannels(projectId);
  }

  @Post('projects/:projectId/channels')
  createChannel(
    @Param('projectId') projectId: string,
    @Body() dto: CreateChannelDto,
  ) {
    return this.chatService.createChannel(projectId, dto);
  }

  @Get('channels/:channelId/messages')
  getMessages(@Param('channelId') channelId: string) {
    return this.chatService.getMessages(channelId);
  }

  @Post('channels/:channelId/messages')
  sendMessage(
    @Param('channelId') channelId: string,
    @GetUser('id') userId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.chatService.sendMessage(channelId, userId, dto);
  }
}
