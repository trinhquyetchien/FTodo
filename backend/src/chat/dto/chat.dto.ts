import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateChannelDto {
  @IsNotEmpty({ message: 'Tên kênh không được để trống' })
  name: string;

  @IsOptional()
  description?: string;
}

export class SendMessageDto {
  @IsNotEmpty({ message: 'Nội dung tin nhắn không được để trống' })
  content: string;

  @IsOptional()
  attachment?: string;
}
