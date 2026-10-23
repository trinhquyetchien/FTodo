import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateTaskDto,
  UpdateTaskDto,
  CreateSprintDto,
  UpdateSprintStatusDto,
} from './dto/task.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  // --- Sprints ---

  async getSprints(projectId: string) {
    return this.prisma.sprint.findMany({
      where: { projectId },
      include: {
        _count: {
          select: { tasks: true },
        },
        tasks: {
          select: {
            id: true,
            status: true,
            points: true,
            title: true,
            code: true,
            priority: true,
            type: true,
            startDate: true,
            endDate: true,
            assignee: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
      },
      orderBy: { startDate: 'desc' },
    });
  }

  async createSprint(projectId: string, dto: CreateSprintDto) {
    return this.prisma.sprint.create({
      data: {
        name: dto.name,
        goal: dto.goal,
        budget: dto.budget || 0,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        projectId,
        status: 'PLANNED',
      },
    });
  }

  async updateSprintStatus(
    projectId: string,
    sprintId: string,
    dto: UpdateSprintStatusDto,
  ) {
    const sprint = await this.prisma.sprint.findFirst({
      where: { id: sprintId, projectId },
    });
    if (!sprint) {
      throw new NotFoundException('Không tìm thấy Sprint');
    }

    return this.prisma.sprint.update({
      where: { id: sprintId },
      data: { status: dto.status },
    });
  }

  // --- Tasks ---

  async getTasks(projectId: string, sprintId?: string) {
    const where: Prisma.TaskWhereInput = { projectId };
    if (sprintId === 'backlog') {
      where.sprintId = null;
    } else if (sprintId) {
      where.sprintId = sprintId;
    }

    return this.prisma.task.findMany({
      where,
      include: {
        assignee: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        sprint: {
          select: { id: true, name: true, status: true, startDate: true, endDate: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createTask(projectId: string, dto: CreateTaskDto) {
    // Generate task code like FT-101
    const count = await this.prisma.task.count({ where: { projectId } });
    const code = `FT-${100 + count + 1}`;

    return this.prisma.task.create({
      data: {
        code,
        title: dto.title,
        description: dto.description,
        type: dto.type || 'TASK',
        epic: dto.epic || null,
        status: dto.status || 'TODO',
        priority: dto.priority || 'MEDIUM',
        points: dto.points || 0,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        projectId,
        sprintId: dto.sprintId || null,
        assigneeId: dto.assigneeId || null,
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        sprint: {
          select: { id: true, name: true, status: true, startDate: true, endDate: true },
        },
      },
    });
  }

  async updateTask(projectId: string, taskId: string, dto: UpdateTaskDto) {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, projectId },
    });
    if (!task) {
      throw new NotFoundException('Không tìm thấy công việc');
    }

    const updateData: any = { ...dto };
    if (dto.startDate !== undefined) {
      updateData.startDate = dto.startDate ? new Date(dto.startDate) : null;
    }
    if (dto.endDate !== undefined) {
      updateData.endDate = dto.endDate ? new Date(dto.endDate) : null;
    }
    if (dto.sprintId !== undefined) {
      updateData.sprintId = dto.sprintId || null;
    }
    if (dto.assigneeId !== undefined) {
      updateData.assigneeId = dto.assigneeId || null;
    }

    return this.prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        assignee: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        sprint: {
          select: { id: true, name: true, status: true, startDate: true, endDate: true },
        },
      },
    });
  }

  async updateTaskStatus(projectId: string, taskId: string, status: string) {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, projectId },
    });
    if (!task) {
      throw new NotFoundException('Không tìm thấy công việc');
    }

    return this.prisma.task.update({
      where: { id: taskId },
      data: { status },
      include: {
        assignee: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    });
  }

  async deleteTask(projectId: string, taskId: string) {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, projectId },
    });
    if (!task) {
      throw new NotFoundException('Không tìm thấy công việc');
    }

    await this.prisma.task.delete({
      where: { id: taskId },
    });

    return { message: 'Đã xóa công việc' };
  }
}
