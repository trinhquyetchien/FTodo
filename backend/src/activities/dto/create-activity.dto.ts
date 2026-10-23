import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateActivityDto {
  @ApiProperty({
    example: 'task',
    description: 'Danh mục hoạt động (task, cost, member, report, settings)',
  })
  @IsNotEmpty()
  @IsString()
  category: string;

  @ApiProperty({
    example: 'đã chuyển công việc FT-101 sang Hoàn thành',
    description: 'Hành động ngắn',
  })
  @IsNotEmpty()
  @IsString()
  action: string;

  @ApiPropertyOptional({
    example: 'Cập nhật trạng thái công việc lúc 15:30',
    description: 'Chi tiết hành động',
  })
  @IsOptional()
  @IsString()
  detail?: string;
}
