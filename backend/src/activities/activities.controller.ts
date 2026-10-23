import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';

@ApiTags('Activities')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('projects/:projectId/activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @ApiOperation({
    summary: 'Lấy danh sách nhật ký hoạt động của dự án từ PostgreSQL',
  })
  @ApiParam({ name: 'projectId', description: 'ID của dự án' })
  @Get()
  getActivities(@Param('projectId') projectId: string) {
    return this.activitiesService.getActivities(projectId);
  }

  @ApiOperation({ summary: 'Ghi nhật ký hoạt động dự án' })
  @ApiParam({ name: 'projectId', description: 'ID của dự án' })
  @Post()
  createActivity(
    @Param('projectId') projectId: string,
    @GetUser()
    user: { id: string; name: string; avatar?: string | null; role?: string },
    @Body() dto: CreateActivityDto,
  ) {
    return this.activitiesService.createActivity(projectId, user, dto);
  }
}
