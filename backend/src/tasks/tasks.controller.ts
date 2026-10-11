import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
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
import { TasksService } from './tasks.service';
import {
  CreateTaskDto,
  UpdateTaskDto,
  UpdateTaskStatusDto,
  CreateSprintDto,
  UpdateSprintStatusDto,
} from './dto/task.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Tasks & Sprints')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('projects/:projectId')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  // --- Sprints ---

  @ApiOperation({ summary: 'Lấy danh sách các Sprint trong dự án' })
  @ApiParam({ name: 'projectId', description: 'ID của dự án' })
  @Get('sprints')
  getSprints(@Param('projectId') projectId: string) {
    return this.tasksService.getSprints(projectId);
  }

  @ApiOperation({ summary: 'Tạo một Sprint mới' })
  @ApiParam({ name: 'projectId', description: 'ID của dự án' })
  @ApiResponse({ status: 201, description: 'Sprint đã được tạo' })
  @Post('sprints')
  createSprint(
    @Param('projectId') projectId: string,
    @Body() dto: CreateSprintDto,
  ) {
    return this.tasksService.createSprint(projectId, dto);
  }

  @ApiOperation({ summary: 'Cập nhật trạng thái Sprint (PLANNED, ACTIVE, COMPLETED)' })
  @ApiParam({ name: 'projectId', description: 'ID của dự án' })
  @ApiParam({ name: 'sprintId', description: 'ID của Sprint' })
  @Patch('sprints/:sprintId/status')
  updateSprintStatus(
    @Param('projectId') projectId: string,
    @Param('sprintId') sprintId: string,
    @Body() dto: UpdateSprintStatusDto,
  ) {
    return this.tasksService.updateSprintStatus(projectId, sprintId, dto);
  }

  // --- Tasks ---

  @ApiOperation({ summary: 'Lấy danh sách công việc của dự án' })
  @ApiParam({ name: 'projectId', description: 'ID của dự án' })
  @ApiQuery({ name: 'sprintId', required: false, description: 'Lọc theo Sprint ID (tùy chọn)' })
  @Get('tasks')
  getTasks(
    @Param('projectId') projectId: string,
    @Query('sprintId') sprintId?: string,
  ) {
    return this.tasksService.getTasks(projectId, sprintId);
  }

  @ApiOperation({ summary: 'Tạo công việc Scrum mới' })
  @ApiParam({ name: 'projectId', description: 'ID của dự án' })
  @ApiResponse({ status: 201, description: 'Công việc đã được tạo' })
  @Post('tasks')
  createTask(
    @Param('projectId') projectId: string,
    @Body() dto: CreateTaskDto,
  ) {
    return this.tasksService.createTask(projectId, dto);
  }

  @ApiOperation({ summary: 'Cập nhật thông tin công việc' })
  @ApiParam({ name: 'projectId', description: 'ID của dự án' })
  @ApiParam({ name: 'taskId', description: 'ID của công việc' })
  @Put('tasks/:taskId')
  updateTask(
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.updateTask(projectId, taskId, dto);
  }

  @ApiOperation({ summary: 'Cập nhật trạng thái kéo thả bảng Scrum (TODO, IN_PROGRESS, REVIEW, DONE)' })
  @ApiParam({ name: 'projectId', description: 'ID của dự án' })
  @ApiParam({ name: 'taskId', description: 'ID của công việc' })
  @Patch('tasks/:taskId/status')
  updateTaskStatus(
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
    @Body() dto: UpdateTaskStatusDto,
  ) {
    return this.tasksService.updateTaskStatus(projectId, taskId, dto.status);
  }

  @ApiOperation({ summary: 'Xóa một công việc' })
  @ApiParam({ name: 'projectId', description: 'ID của dự án' })
  @ApiParam({ name: 'taskId', description: 'ID của công việc cần xóa' })
  @Delete('tasks/:taskId')
  deleteTask(
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
  ) {
    return this.tasksService.deleteTask(projectId, taskId);
  }
}
