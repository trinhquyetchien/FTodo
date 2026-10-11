import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Tìm kiếm người dùng theo tên hoặc email' })
  @ApiQuery({ name: 'q', description: 'Từ khóa tìm kiếm người dùng (email hoặc tên)' })
  @ApiResponse({ status: 200, description: 'Danh sách người dùng phù hợp' })
  @Get('search')
  search(@Query('q') query: string) {
    return this.usersService.searchUsers(query);
  }
}
