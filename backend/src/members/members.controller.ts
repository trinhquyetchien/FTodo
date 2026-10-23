import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
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
import { MembersService } from './members.service';
import {
  AddMemberDto,
  UpdateMemberDto,
  CreateRoleGroupDto,
  UpdateRoleGroupPermissionsDto,
} from './dto/member.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';

@ApiTags('Members')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('projects/:projectId')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  // --- Member endpoints ---

  @ApiOperation({
    summary: 'Lấy danh sách thành viên dự án và nhóm quyền của họ',
  })
  @ApiParam({ name: 'projectId', description: 'ID của dự án' })
  @Get('members')
  getMembers(@Param('projectId') projectId: string) {
    return this.membersService.getMembers(projectId);
  }

  @ApiOperation({ summary: 'Mời thành viên mới vào dự án' })
  @ApiParam({ name: 'projectId', description: 'ID của dự án' })
  @ApiResponse({
    status: 201,
    description: 'Thành viên đã được thêm vào dự án',
  })
  @Post('members')
  addMember(
    @Param('projectId') projectId: string,
    @GetUser('id') userId: string,
    @Body() dto: AddMemberDto,
  ) {
    return this.membersService.addMember(projectId, userId, dto);
  }

  @ApiOperation({
    summary: 'Cập nhật vai trò hoặc quyền riêng lẻ của thành viên',
  })
  @ApiParam({ name: 'projectId', description: 'ID của dự án' })
  @ApiParam({ name: 'memberId', description: 'ID bản ghi thành viên dự án' })
  @Put('members/:memberId')
  updateMember(
    @Param('projectId') projectId: string,
    @Param('memberId') memberId: string,
    @GetUser('id') userId: string,
    @Body() dto: UpdateMemberDto,
  ) {
    return this.membersService.updateMember(projectId, memberId, userId, dto);
  }

  @ApiOperation({ summary: 'Xóa thành viên khỏi dự án' })
  @ApiParam({ name: 'projectId', description: 'ID của dự án' })
  @ApiParam({ name: 'memberId', description: 'ID bản ghi thành viên cần xóa' })
  @Delete('members/:memberId')
  removeMember(
    @Param('projectId') projectId: string,
    @Param('memberId') memberId: string,
    @GetUser('id') userId: string,
  ) {
    return this.membersService.removeMember(projectId, memberId, userId);
  }

  // --- Role Groups endpoints ---

  @ApiOperation({
    summary: 'Lấy danh sách các nhóm quyền (Role Groups) trong dự án',
  })
  @ApiParam({ name: 'projectId', description: 'ID của dự án' })
  @Get('roles')
  getRoleGroups(@Param('projectId') projectId: string) {
    return this.membersService.getRoleGroups(projectId);
  }

  @ApiOperation({ summary: 'Tạo nhóm quyền mới trong dự án' })
  @ApiParam({ name: 'projectId', description: 'ID của dự án' })
  @ApiResponse({ status: 201, description: 'Nhóm quyền mới đã được tạo' })
  @Post('roles')
  createRoleGroup(
    @Param('projectId') projectId: string,
    @GetUser('id') userId: string,
    @Body() dto: CreateRoleGroupDto,
  ) {
    return this.membersService.createRoleGroup(projectId, userId, dto);
  }

  @ApiOperation({ summary: 'Cập nhật danh sách quyền cho nhóm quyền' })
  @ApiParam({ name: 'projectId', description: 'ID của dự án' })
  @ApiParam({ name: 'roleId', description: 'ID của nhóm quyền' })
  @Put('roles/:roleId/permissions')
  updateRoleGroupPermissions(
    @Param('projectId') projectId: string,
    @Param('roleId') roleId: string,
    @GetUser('id') userId: string,
    @Body() dto: UpdateRoleGroupPermissionsDto,
  ) {
    return this.membersService.updateRoleGroupPermissions(
      projectId,
      roleId,
      userId,
      dto,
    );
  }

  @ApiOperation({ summary: 'Xóa nhóm quyền trong dự án' })
  @ApiParam({ name: 'projectId', description: 'ID của dự án' })
  @ApiParam({ name: 'roleId', description: 'ID của nhóm quyền cần xóa' })
  @Delete('roles/:roleId')
  deleteRoleGroup(
    @Param('projectId') projectId: string,
    @Param('roleId') roleId: string,
    @GetUser('id') userId: string,
  ) {
    return this.membersService.deleteRoleGroup(projectId, roleId, userId);
  }
}
