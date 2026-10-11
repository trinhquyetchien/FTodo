import { IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateProjectDto {
  @IsNotEmpty({ message: 'Tên dự án không được để trống' })
  @MaxLength(100, { message: 'Tên dự án tối đa 100 ký tự' })
  name: string;

  @IsOptional()
  description?: string;
}
