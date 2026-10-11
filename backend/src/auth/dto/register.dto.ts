import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'chien@example.com',
    description: 'Địa chỉ email người dùng',
  })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'Mật khẩu ít nhất 6 ký tự',
  })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password: string;

  @ApiProperty({
    example: 'Trịnh Quyết Chiến',
    description: 'Họ và tên hiển thị',
  })
  @IsNotEmpty({ message: 'Tên hiển thị không được để trống' })
  name: string;
}
