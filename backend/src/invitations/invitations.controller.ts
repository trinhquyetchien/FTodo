import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { InvitationsService } from './invitations.service';
import { SendInvitationDto, RespondInvitationDto } from './dto/invitation.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';

@ApiTags('Invitations')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller()
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @ApiOperation({ summary: 'Lấy danh sách lời mời của một dự án' })
  @ApiParam({ name: 'projectId', description: 'ID dự án' })
  @Get('projects/:projectId/invitations')
  getProjectInvitations(@Param('projectId') projectId: string) {
    return this.invitationsService.getByProject(projectId);
  }

  @ApiOperation({ summary: 'Gửi lời mời tham gia dự án' })
  @ApiParam({ name: 'projectId', description: 'ID dự án' })
  @Post('projects/:projectId/invitations')
  sendInvitation(
    @Param('projectId') projectId: string,
    @GetUser('id') inviterId: string,
    @Body() dto: SendInvitationDto,
  ) {
    return this.invitationsService.sendInvitation(projectId, inviterId, dto);
  }

  @ApiOperation({ summary: 'Hủy lời mời tham gia dự án' })
  @ApiParam({ name: 'projectId', description: 'ID dự án' })
  @ApiParam({ name: 'id', description: 'ID của lời mời' })
  @Delete('projects/:projectId/invitations/:id')
  cancelInvitation(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
  ) {
    return this.invitationsService.cancelInvitation(projectId, id);
  }

  @ApiOperation({
    summary: 'Lấy các lời mời gửi đến tài khoản người dùng hiện tại',
  })
  @ApiResponse({ status: 200, description: 'Danh sách lời mời đang chờ xử lý' })
  @Get('invitations/my')
  getMyInvitations(@GetUser('email') userEmail: string) {
    return this.invitationsService.getMyInvitations(userEmail);
  }

  @ApiOperation({ summary: 'Phản hồi lời mời (Chấp nhận hoặc Từ chối)' })
  @ApiParam({ name: 'id', description: 'ID của lời mời' })
  @Patch('invitations/:id/respond')
  respondInvitation(
    @Param('id') id: string,
    @GetUser()
    user: { id: string; email: string; name: string; avatar?: string | null },
    @Body() dto: RespondInvitationDto,
  ) {
    return this.invitationsService.respondInvitation(id, user, dto);
  }
}
