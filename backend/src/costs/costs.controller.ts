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
import { CostsService } from './costs.service';
import { CreateCostDto, UpdateCostStatusDto } from './dto/cost.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';

@ApiTags('Costs')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('projects/:projectId/costs')
export class CostsController {
  constructor(private readonly costsService: CostsService) {}

  @ApiOperation({
    summary: 'Lấy danh sách các khoản chi và ngân sách của dự án',
  })
  @ApiParam({ name: 'projectId', description: 'ID của dự án' })
  @Get()
  getCosts(@Param('projectId') projectId: string) {
    return this.costsService.getCosts(projectId);
  }

  @ApiOperation({ summary: 'Tạo hoặc đề xuất một khoản chi phí mới' })
  @ApiParam({ name: 'projectId', description: 'ID của dự án' })
  @ApiResponse({
    status: 201,
    description: 'Khoản chi phí đã được tạo/đề xuất',
  })
  @Post()
  createCost(
    @Param('projectId') projectId: string,
    @GetUser('id') userId: string,
    @Body() dto: CreateCostDto,
  ) {
    return this.costsService.createCost(projectId, userId, dto);
  }

  @ApiOperation({
    summary:
      'Phê duyệt hoặc cập nhật trạng thái chi phí (PAID, APPROVED, PENDING)',
  })
  @ApiParam({ name: 'projectId', description: 'ID của dự án' })
  @ApiParam({ name: 'costId', description: 'ID của khoản chi phí' })
  @Patch(':costId/status')
  updateCostStatus(
    @Param('projectId') projectId: string,
    @Param('costId') costId: string,
    @Body() dto: UpdateCostStatusDto,
  ) {
    return this.costsService.updateCostStatus(projectId, costId, dto.status);
  }

  @ApiOperation({ summary: 'Xóa khoản chi phí' })
  @ApiParam({ name: 'projectId', description: 'ID của dự án' })
  @ApiParam({ name: 'costId', description: 'ID của khoản chi phí cần xóa' })
  @Delete(':costId')
  deleteCost(
    @Param('projectId') projectId: string,
    @Param('costId') costId: string,
  ) {
    return this.costsService.deleteCost(projectId, costId);
  }
}
