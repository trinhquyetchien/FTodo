import { Injectable, NotFoundException } from '@nestjs/common';
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
      },
      orderBy: { startDate: 'desc' },
    });
  }

  async createSprint(projectId: string, dto: CreateSprintDto) {
    return this.prisma.sprint.create({
      data: {
        name: dto.name,
        goal: dto.goal,
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
    const where: any = { projectId };
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
          select: { id: true, name: true, status: true },
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
        status: dto.status || 'TODO',
        priority: dto.priority || 'MEDIUM',
        points: dto.points || 0,
        projectId,
        sprintId: dto.sprintId || null,
        assigneeId: dto.assigneeId || null,
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        sprint: {
          select: { id: true, name: true, status: true },
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

    return this.prisma.task.update({
      where: { id: taskId },
      data: {
        ...dto,
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        sprint: {
          select: { id: true, name: true, status: true },
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
