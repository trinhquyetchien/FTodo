import {
  Controller,
  Get,
  Post,
  Patch,
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
import { ReportsService } from './reports.service';
import { CreateReportDto, UpdateReportStatusDto } from './dto/report.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';

@ApiTags('Reports')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('projects/:projectId/reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @ApiOperation({ summary: 'Lấy danh sách các báo cáo gửi lên trong dự án' })
  @ApiParam({ name: 'projectId', description: 'ID của dự án' })
  @ApiResponse({ status: 200, description: 'Danh sách báo cáo' })
  @Get()
  getReports(@Param('projectId') projectId: string) {
    return this.reportsService.getReports(projectId);
  }

  @ApiOperation({ summary: 'Gửi một báo cáo công việc lên cho Sếp / Chủ dự án' })
  @ApiParam({ name: 'projectId', description: 'ID của dự án' })
  @ApiResponse({ status: 201, description: 'Báo cáo đã được gửi thành công' })
  @Post()
  createReport(
    @Param('projectId') projectId: string,
    @GetUser('id') userId: string,
    @Body() dto: CreateReportDto,
  ) {
    return this.reportsService.createReport(projectId, userId, dto);
  }

  @ApiOperation({ summary: 'Cập nhật trạng thái duyệt của báo cáo (Đã xem / Reviewed)' })
  @ApiParam({ name: 'projectId', description: 'ID của dự án' })
  @ApiParam({ name: 'reportId', description: 'ID của báo cáo' })
  @ApiResponse({ status: 200, description: 'Cập nhật trạng thái thành công' })
  @Patch(':reportId/status')
  updateStatus(
    @Param('projectId') projectId: string,
    @Param('reportId') reportId: string,
    @Body() dto: UpdateReportStatusDto,
  ) {
    return this.reportsService.updateReportStatus(projectId, reportId, dto);
  }
}
