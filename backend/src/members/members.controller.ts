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
import { MembersService } from './members.service';
import {
  AddMemberDto,
  UpdateMemberDto,
  CreateRoleGroupDto,
  UpdateRoleGroupPermissionsDto,
} from './dto/member.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('projects/:projectId')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  // --- Member endpoints ---

  @Get('members')
  getMembers(@Param('projectId') projectId: string) {
    return this.membersService.getMembers(projectId);
  }

  @Post('members')
  addMember(
    @Param('projectId') projectId: string,
    @GetUser('id') userId: string,
    @Body() dto: AddMemberDto,
  ) {
    return this.membersService.addMember(projectId, userId, dto);
  }

  @Put('members/:memberId')
  updateMember(
    @Param('projectId') projectId: string,
    @Param('memberId') memberId: string,
    @GetUser('id') userId: string,
    @Body() dto: UpdateMemberDto,
  ) {
    return this.membersService.updateMember(projectId, memberId, userId, dto);
  }

  @Delete('members/:memberId')
  removeMember(
    @Param('projectId') projectId: string,
    @Param('memberId') memberId: string,
    @GetUser('id') userId: string,
  ) {
    return this.membersService.removeMember(projectId, memberId, userId);
  }

  // --- Role Groups endpoints ---

  @Get('roles')
  getRoleGroups(@Param('projectId') projectId: string) {
    return this.membersService.getRoleGroups(projectId);
  }

  @Post('roles')
  createRoleGroup(
    @Param('projectId') projectId: string,
    @GetUser('id') userId: string,
    @Body() dto: CreateRoleGroupDto,
  ) {
    return this.membersService.createRoleGroup(projectId, userId, dto);
  }

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

  @Delete('roles/:roleId')
  deleteRoleGroup(
    @Param('projectId') projectId: string,
    @Param('roleId') roleId: string,
    @GetUser('id') userId: string,
  ) {
    return this.membersService.deleteRoleGroup(projectId, roleId, userId);
  }
}
