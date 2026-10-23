import { IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({
    example: 'FTodo Core System',
    description: 'Tên không gian dự án',
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'Tên dự án không được để trống' })
  @MaxLength(100, { message: 'Tên dự án tối đa 100 ký tự' })
  name: string;

  @ApiPropertyOptional({
    example:
      'Hệ thống quản lý công việc và phát triển phần mềm theo Agile Scrum',
    description: 'Mô tả chi tiết mục tiêu dự án',
  })
  @IsOptional()
  description?: string;
}
