import { IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateChannelDto {
  @ApiProperty({ example: 'general', description: 'Tên kênh trao đổi thảo luận' })
  @IsNotEmpty({ message: 'Tên kênh không được để trống' })
  name: string;

  @ApiPropertyOptional({ example: 'Kênh trao đổi chung toàn dự án', description: 'Mô tả kênh' })
  @IsOptional()
  description?: string;
}

export class SendMessageDto {
  @ApiProperty({ example: 'Chào cả nhóm, hôm nay chúng ta Daily Scrum lúc 9h30 nhé!', description: 'Nội dung tin nhắn' })
  @IsNotEmpty({ message: 'Nội dung tin nhắn không được để trống' })
  content: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/spec-v1.pdf', description: 'Đường dẫn tệp đính kèm' })
  @IsOptional()
  attachment?: string;
}
