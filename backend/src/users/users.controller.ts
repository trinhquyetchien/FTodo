import { Controller, Get, Patch, Body, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { UpdateProfileDto, ChangePasswordDto } from './dto/user.dto';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Tìm kiếm người dùng theo tên hoặc email' })
  @ApiQuery({
    name: 'q',
    description: 'Từ khóa tìm kiếm người dùng (email hoặc tên)',
  })
  @ApiResponse({ status: 200, description: 'Danh sách người dùng phù hợp' })
  @Get('search')
  search(@Query('q') query: string) {
    return this.usersService.searchUsers(query);
  }

  @ApiOperation({
    summary: 'Cập nhật thông tin hồ sơ người dùng (Tên, Ảnh đại diện)',
  })
  @ApiResponse({
    status: 200,
    description: 'Hồ sơ đã được cập nhật thành công',
  })
  @Patch('profile')
  updateProfile(@GetUser('id') userId: string, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(userId, dto);
  }

  @ApiOperation({ summary: 'Đổi mật khẩu người dùng' })
  @ApiResponse({ status: 200, description: 'Đổi mật khẩu thành công' })
  @Patch('change-password')
  changePassword(
    @GetUser('id') userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(userId, dto);
  }
}
