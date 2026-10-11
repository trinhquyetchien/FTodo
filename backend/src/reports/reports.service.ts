import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto, UpdateReportStatusDto } from './dto/report.dto';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getReports(projectId: string) {
    const reports = await this.prisma.report.findMany({
      where: { projectId },
      include: {
        author: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        recipient: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return reports.map((r) => ({
      id: r.id,
      title: r.title,
      type: r.type,
      author: r.author.name,
      authorEmail: r.author.email,
      authorId: r.author.id,
      recipientId: r.recipientId,
      recipientName: r.recipient?.name || 'Chủ dự án (Owner)',
      recipientEmail: r.recipient?.email || '',
      date: new Date(r.createdAt).toLocaleDateString('vi-VN'),
      status: r.status,
      summary: r.summary,
      completedTasks: r.completedTasks || '',
      blockers: r.blockers || '',
      pdfUrl: r.pdfUrl,
      createdAt: r.createdAt,
    }));
  }

  async createReport(projectId: string, userId: string, dto: CreateReportDto) {
    const report = await this.prisma.report.create({
      data: {
        title: dto.title,
        type: dto.type || 'general',
        summary: dto.summary,
        recipientId: dto.recipientId || null,
        completedTasks: dto.completedTasks || 'Báo cáo định kỳ công việc.',
        blockers: dto.blockers || '',
        pdfUrl: dto.pdfUrl,
        authorId: userId,
        projectId,
        status: 'sent',
      },
      include: {
        author: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        recipient: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    });

    return {
      id: report.id,
      title: report.title,
      type: report.type,
      author: report.author.name,
      authorEmail: report.author.email,
      authorId: report.author.id,
      recipientId: report.recipientId,
      recipientName: report.recipient?.name || 'Chủ dự án (Owner)',
      recipientEmail: report.recipient?.email || '',
      date: new Date(report.createdAt).toLocaleDateString('vi-VN'),
      status: report.status,
      summary: report.summary,
      completedTasks: report.completedTasks || '',
      blockers: report.blockers || '',
      pdfUrl: report.pdfUrl,
      createdAt: report.createdAt,
    };
  }

  async updateReportStatus(
    projectId: string,
    reportId: string,
    dto: UpdateReportStatusDto,
  ) {
    const report = await this.prisma.report.findFirst({
      where: { id: reportId, projectId },
    });

    if (!report) {
      throw new NotFoundException('Không tìm thấy báo cáo');
    }

    return this.prisma.report.update({
      where: { id: reportId },
      data: { status: dto.status },
    });
  }
}
