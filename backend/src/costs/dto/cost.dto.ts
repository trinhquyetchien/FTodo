import { IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCostDto {
  @ApiProperty({ example: 'Thuê cụm Cloud AWS EC2 & RDS PostgreSQL', description: 'Tên khoản chi' })
  @IsNotEmpty({ message: 'Tên khoản chi không được để trống' })
  title: string;

  @ApiProperty({
    example: 'infrastructure',
    enum: ['personnel', 'infrastructure', 'licenses', 'hardware', 'other'],
    description: 'Danh mục phân loại chi phí',
  })
  @IsNotEmpty({ message: 'Danh mục chi phí không được để trống' })
  category: string;

  @ApiProperty({ example: 4500000, description: 'Số tiền chi (VND)' })
  @IsNumber({}, { message: 'Số tiền phải là một con số' })
  @Min(0, { message: 'Số tiền không được âm' })
  amount: number;

  @ApiPropertyOptional({ example: '2026-10-10', description: 'Ngày phát sinh khoản chi' })
  @IsOptional()
  date?: string;

  @ApiPropertyOptional({ example: 'PENDING', enum: ['PAID', 'APPROVED', 'PENDING'], description: 'Trạng thái phê duyệt' })
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ example: 'sprint-uuid-1', description: 'ID Sprint gắn kèm (tùy chọn)' })
  @IsOptional()
  sprintId?: string;
}

export class UpdateCostStatusDto {
  @ApiProperty({ example: 'APPROVED', enum: ['PAID', 'APPROVED', 'PENDING'], description: 'Trạng thái phê duyệt mới' })
  @IsNotEmpty()
  status: string;
}
