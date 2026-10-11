import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';

@ApiTags('Projects')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @ApiOperation({ summary: 'Tạo một dự án mới' })
  @ApiResponse({ status: 201, description: 'Dự án đã được tạo thành công' })
  @Post()
  create(@GetUser('id') userId: string, @Body() dto: CreateProjectDto) {
    return this.projectsService.create(userId, dto);
  }

  @ApiOperation({ summary: 'Lấy tất cả các dự án mà người dùng tham gia' })
  @ApiResponse({ status: 200, description: 'Danh sách dự án của người dùng' })
  @Get()
  findAll(@GetUser('id') userId: string) {
    return this.projectsService.findAllForUser(userId);
  }

  @ApiOperation({ summary: 'Lấy thông tin chi tiết một dự án' })
  @ApiParam({ name: 'id', description: 'Mã định danh ID của dự án' })
  @ApiResponse({ status: 200, description: 'Chi tiết dự án và danh sách thành viên' })
  @Get(':id')
  findOne(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.projectsService.findOne(id, userId);
  }

  @ApiOperation({ summary: 'Cập nhật thông tin dự án' })
  @ApiParam({ name: 'id', description: 'ID của dự án cần cập nhật' })
  @ApiResponse({ status: 200, description: 'Dự án đã được cập nhật' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Body() dto: { name?: string; description?: string },
  ) {
    return this.projectsService.update(id, userId, dto);
  }

  @ApiOperation({ summary: 'Xóa dự án (chỉ chủ dự án có quyền)' })
  @ApiParam({ name: 'id', description: 'ID của dự án cần xóa' })
  @ApiResponse({ status: 200, description: 'Dự án đã được xóa' })
  @Delete(':id')
  remove(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.projectsService.remove(id, userId);
  }
}
