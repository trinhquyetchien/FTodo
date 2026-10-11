import { IsNotEmpty, IsString, IsIn, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReportDto {
  @ApiProperty({ example: 'Báo cáo Sprint 1: Hoàn tất Module Auth', description: 'Tiêu đề báo cáo' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'sprint', enum: ['weekly', 'sprint', 'technical', 'incident'] })
  @IsString()
  @IsIn(['weekly', 'sprint', 'technical', 'incident'])
  type: string;

  @ApiProperty({ example: 'Đã hoàn thành 85% khối lượng công việc Sprint 1...' })
  @IsString()
  @IsNotEmpty()
  summary: string;

  @ApiPropertyOptional({ example: '- Thiết kế schema PostgreSQL\n- Xây dựng API JWT' })
  @IsString()
  @IsOptional()
  completedTasks?: string;

  @ApiPropertyOptional({ example: 'Đang chờ cấu hình DNS Staging' })
  @IsString()
  @IsOptional()
  blockers?: string;

  @ApiPropertyOptional({ example: 'https://example.com/report.pdf' })
  @IsString()
  @IsOptional()
  pdfUrl?: string;
}

export class UpdateReportStatusDto {
  @ApiProperty({ example: 'reviewed', enum: ['sent', 'reviewed'] })
  @IsString()
  @IsIn(['sent', 'reviewed'])
  status: string;
}
