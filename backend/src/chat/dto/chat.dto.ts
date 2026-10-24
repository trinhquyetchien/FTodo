import {
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsArray,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateChannelDto {
  @ApiProperty({
    example: 'general',
    description: 'Tên kênh trao đổi thảo luận',
  })
  @IsNotEmpty({ message: 'Tên kênh không được để trống' })
  name: string;

  @ApiPropertyOptional({
    example: 'Kênh trao đổi chung toàn dự án',
    description: 'Mô tả kênh',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: false, description: 'Kênh riêng tư' })
  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;

  @ApiPropertyOptional({
    example: ['user-id-1', 'user-id-2'],
    description: 'Danh sách ID thành viên ban đầu',
  })
  @IsOptional()
  @IsArray()
  memberIds?: string[];
}

export class AddChannelMemberDto {
  @ApiProperty({
    example: 'user-id-123',
    description: 'ID người dùng được thêm vào kênh',
  })
  @IsNotEmpty({ message: 'User ID không được để trống' })
  userId: string;

  @ApiPropertyOptional({
    example: 'MEMBER',
    description: 'Vai trò trong kênh (ADMIN, MEMBER)',
  })
  @IsOptional()
  @IsString()
  role?: string;
}

export class SendMessageDto {
  @ApiProperty({
    example: 'Chào cả nhóm, hôm nay chúng ta Daily Scrum lúc 9h30 nhé!',
    description: 'Nội dung tin nhắn',
  })
  @IsNotEmpty({ message: 'Nội dung tin nhắn không được để trống' })
  content: string;

  @ApiPropertyOptional({
    example: 'https://cdn.example.com/spec-v1.pdf',
    description: 'Đường dẫn tệp đính kèm',
  })
  @IsOptional()
  attachment?: string;
}

export class HeartbeatDto {
  @ApiPropertyOptional({
    example: 'project-uuid-123',
    description: 'ID dự án người dùng đang xem',
  })
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiPropertyOptional({
    example: 'online',
    enum: ['online', 'busy', 'offline'],
    description: 'Trạng thái hoạt động của người dùng',
  })
  @IsOptional()
  @IsString()
  status?: string;
}
