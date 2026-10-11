import { IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateCostDto {
  @IsNotEmpty({ message: 'Tên khoản chi không được để trống' })
  title: string;

  @IsNotEmpty({ message: 'Danh mục chi phí không được để trống' })
  category: string; // personnel, infrastructure, licenses, hardware, other

  @IsNumber({}, { message: 'Số tiền phải là một con số' })
  @Min(0, { message: 'Số tiền không được âm' })
  amount: number;

  @IsOptional()
  date?: string;

  @IsOptional()
  status?: string; // PAID, APPROVED, PENDING

  @IsOptional()
  sprintId?: string;
}

export class UpdateCostStatusDto {
  @IsNotEmpty()
  status: string;
}
