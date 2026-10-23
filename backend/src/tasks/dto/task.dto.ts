import { IsNotEmpty, IsOptional, IsInt, Min, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({
    example: 'Thiết kế Database Schema PostgreSQL',
    description: 'Tiêu đề công việc',
  })
  @IsNotEmpty({ message: 'Tiêu đề công việc không được để trống' })
  title: string;

  @ApiPropertyOptional({
    example: 'Đặc tả schema Prisma cho các quan hệ 1-N và N-N',
    description: 'Mô tả chi tiết',
  })
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: 'TASK',
    enum: ['STORY', 'TASK', 'BUG'],
    description: 'Loại công việc (STORY, TASK, BUG)',
  })
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({
    example: 'Kiến trúc Cơ sở Dữ liệu',
    description: 'Tên Epic thuộc về',
  })
  @IsOptional()
  epic?: string;

  @ApiPropertyOptional({
    example: 'TODO',
    enum: ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'],
    description: 'Trạng thái công việc',
  })
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({
    example: 'Cao',
    enum: ['Cao', 'Trung bình', 'Thấp'],
    description: 'Độ ưu tiên',
  })
  @IsOptional()
  priority?: string;

  @ApiPropertyOptional({
    example: 5,
    description: 'Điểm ước tính Story Points (SP)',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  points?: number;

  @ApiPropertyOptional({
    example: 'sprint-uuid-1',
    description: 'ID Sprint chứa công việc này',
  })
  @IsOptional()
  sprintId?: string | null;

  @ApiPropertyOptional({
    example: '2026-10-15',
    description: 'Ngày bắt đầu công việc',
  })
  @IsOptional()
  startDate?: string | Date;

  @ApiPropertyOptional({
    example: '2026-10-25',
    description: 'Hạn chót / Ngày kết thúc công việc',
  })
  @IsOptional()
  endDate?: string | Date;

  @ApiPropertyOptional({
    example: 'user-uuid-1',
    description: 'ID người được giao việc',
  })
  @IsOptional()
  assigneeId?: string;
}

export class UpdateTaskDto {
  @ApiPropertyOptional({
    example: 'Cập nhật Schema',
    description: 'Tiêu đề công việc mới',
  })
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    example: 'Mô tả chi tiết bổ sung',
    description: 'Mô tả',
  })
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: 'TASK',
    enum: ['STORY', 'TASK', 'BUG'],
    description: 'Loại công việc',
  })
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({
    example: 'Kiến trúc Cơ sở Dữ liệu',
    description: 'Epic',
  })
  @IsOptional()
  epic?: string;

  @ApiPropertyOptional({
    example: 'IN_PROGRESS',
    enum: ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'],
  })
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ example: 'Cao', enum: ['Cao', 'Trung bình', 'Thấp'] })
  @IsOptional()
  priority?: string;

  @ApiPropertyOptional({ example: 8 })
  @IsOptional()
  @IsInt()
  @Min(0)
  points?: number;

  @ApiPropertyOptional({ example: 'sprint-uuid-1' })
  @IsOptional()
  sprintId?: string | null;

  @ApiPropertyOptional({ example: '2026-10-15' })
  @IsOptional()
  startDate?: string | Date | null;

  @ApiPropertyOptional({ example: '2026-10-25' })
  @IsOptional()
  endDate?: string | Date | null;

  @ApiPropertyOptional({ example: 'user-uuid-2' })
  @IsOptional()
  assigneeId?: string | null;
}

export class UpdateTaskStatusDto {
  @ApiProperty({
    example: 'DONE',
    enum: ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'],
    description: 'Trạng thái mới của task',
  })
  @IsNotEmpty()
  status: string; // 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE'
}

export class CreateSprintDto {
  @ApiProperty({
    example: 'Sprint 1: Nền tảng & Xác thực',
    description: 'Tên Sprint',
  })
  @IsNotEmpty({ message: 'Tên Sprint không được để trống' })
  name: string;

  @ApiPropertyOptional({
    example: 'Hoàn thành module Auth, RBAC và Bảng Scrum',
    description: 'Mục tiêu Sprint',
  })
  @IsOptional()
  goal?: string;

  @ApiPropertyOptional({
    example: 35000000,
    description: 'Ngân sách phân bổ cho Sprint (VND)',
  })
  @IsOptional()
  @IsNumber()
  budget?: number;

  @ApiProperty({ example: '2026-10-01', description: 'Ngày bắt đầu' })
  @IsNotEmpty({ message: 'Ngày bắt đầu không được để trống' })
  startDate: string;

  @ApiProperty({ example: '2026-10-15', description: 'Ngày kết thúc' })
  @IsNotEmpty({ message: 'Ngày kết thúc không được để trống' })
  endDate: string;
}

export class UpdateSprintStatusDto {
  @ApiProperty({
    example: 'ACTIVE',
    enum: ['PLANNED', 'ACTIVE', 'COMPLETED'],
    description: 'Trạng thái Sprint mới',
  })
  @IsNotEmpty()
  status: string; // 'PLANNED' | 'ACTIVE' | 'COMPLETED'
}
