import { IsNotEmpty, IsString, IsIn, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReportDto {
  @ApiProperty({
    example: 'Báo cáo Sprint 1: Hoàn tất Module Auth',
    description: 'Tiêu đề báo cáo',
  })
  @IsString()
  @IsNotEmpty({ message: 'Tiêu đề báo cáo không được để trống' })
  title: string;

  @ApiProperty({
    example:
      'Kính gửi Sếp, em gửi file báo cáo hoàn thành các module tuần này...',
  })
  @IsString()
  @IsNotEmpty({ message: 'Lời nhắn không được để trống' })
  summary: string;

  @ApiPropertyOptional({
    example: 'admin-user-uuid',
    description: 'ID của Admin được chọn nhận báo cáo',
  })
  @IsString()
  @IsOptional()
  recipientId?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/report.pdf',
    description: 'File đính kèm hoặc đường dẫn tệp',
  })
  @IsString()
  @IsOptional()
  pdfUrl?: string;

  @ApiPropertyOptional({ example: 'general', description: 'Loại báo cáo' })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({
    example: '- Thiết kế schema PostgreSQL\n- Xây dựng API JWT',
  })
  @IsString()
  @IsOptional()
  completedTasks?: string;

  @ApiPropertyOptional({ example: 'Đang chờ cấu hình DNS Staging' })
  @IsString()
  @IsOptional()
  blockers?: string;
}

export class UpdateReportStatusDto {
  @ApiProperty({ example: 'reviewed', enum: ['sent', 'reviewed'] })
  @IsString()
  @IsIn(['sent', 'reviewed'])
  status: string;
}
