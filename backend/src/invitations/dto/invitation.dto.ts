import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsIn,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendInvitationDto {
  @ApiProperty({
    example: 'developer@example.com',
    description: 'Email của người được mời',
  })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email người nhận không được để trống' })
  recipientEmail: string;

  @ApiPropertyOptional({
    example: 'Nguyễn Văn A',
    description: 'Tên hiển thị của người được mời (tuỳ chọn)',
  })
  @IsOptional()
  @IsString()
  recipientName?: string;

  @ApiPropertyOptional({
    example: 'role-group-uuid',
    description: 'ID nhóm quyền phân bổ (DEV, QA, v.v.)',
  })
  @IsOptional()
  @IsString()
  roleGroupId?: string;
}

export class RespondInvitationDto {
  @ApiProperty({
    example: 'ACCEPT',
    enum: ['ACCEPT', 'DECLINE'],
    description: 'Hành động phản hồi lời mời: ACCEPT hoặc DECLINE',
  })
  @IsNotEmpty({ message: 'Hành động phản hồi không được để trống' })
  @IsIn(['ACCEPT', 'DECLINE'], {
    message: 'Hành động chỉ có thể là ACCEPT hoặc DECLINE',
  })
  action: 'ACCEPT' | 'DECLINE';
}
