import { IsNotEmpty, IsOptional, IsEnum, IsInt, Min } from 'class-validator';

export class CreateTaskDto {
  @IsNotEmpty({ message: 'Tiêu đề công việc không được để trống' })
  title: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  status?: string;

  @IsOptional()
  priority?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  points?: number;

  @IsOptional()
  sprintId?: string;

  @IsOptional()
  assigneeId?: string;
}

export class UpdateTaskDto {
  @IsOptional()
  title?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  status?: string;

  @IsOptional()
  priority?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  points?: number;

  @IsOptional()
  sprintId?: string;

  @IsOptional()
  assigneeId?: string;
}

export class UpdateTaskStatusDto {
  @IsNotEmpty()
  status: string; // 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE'
}

export class CreateSprintDto {
  @IsNotEmpty({ message: 'Tên Sprint không được để trống' })
  name: string;

  @IsOptional()
  goal?: string;

  @IsNotEmpty({ message: 'Ngày bắt đầu không được để trống' })
  startDate: string;

  @IsNotEmpty({ message: 'Ngày kết thúc không được để trống' })
  endDate: string;
}

export class UpdateSprintStatusDto {
  @IsNotEmpty()
  status: string; // 'PLANNED' | 'ACTIVE' | 'COMPLETED'
}
