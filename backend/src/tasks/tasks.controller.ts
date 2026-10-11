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
import { TasksService } from './tasks.service';
import {
  CreateTaskDto,
  UpdateTaskDto,
  UpdateTaskStatusDto,
  CreateSprintDto,
  UpdateSprintStatusDto,
} from './dto/task.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('projects/:projectId')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  // --- Sprints ---

  @Get('sprints')
  getSprints(@Param('projectId') projectId: string) {
    return this.tasksService.getSprints(projectId);
  }

  @Post('sprints')
  createSprint(
    @Param('projectId') projectId: string,
    @Body() dto: CreateSprintDto,
  ) {
    return this.tasksService.createSprint(projectId, dto);
  }

  @Patch('sprints/:sprintId/status')
  updateSprintStatus(
    @Param('projectId') projectId: string,
    @Param('sprintId') sprintId: string,
    @Body() dto: UpdateSprintStatusDto,
  ) {
    return this.tasksService.updateSprintStatus(projectId, sprintId, dto);
  }

  // --- Tasks ---

  @Get('tasks')
  getTasks(
    @Param('projectId') projectId: string,
    @Query('sprintId') sprintId?: string,
  ) {
    return this.tasksService.getTasks(projectId, sprintId);
  }

  @Post('tasks')
  createTask(
    @Param('projectId') projectId: string,
    @Body() dto: CreateTaskDto,
  ) {
    return this.tasksService.createTask(projectId, dto);
  }

  @Put('tasks/:taskId')
  updateTask(
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.updateTask(projectId, taskId, dto);
  }

  @Patch('tasks/:taskId/status')
  updateTaskStatus(
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
    @Body() dto: UpdateTaskStatusDto,
  ) {
    return this.tasksService.updateTaskStatus(projectId, taskId, dto.status);
  }

  @Delete('tasks/:taskId')
  deleteTask(
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
  ) {
    return this.tasksService.deleteTask(projectId, taskId);
  }
}
