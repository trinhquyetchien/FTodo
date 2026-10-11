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
import { CostsService } from './costs.service';
import { CreateCostDto, UpdateCostStatusDto } from './dto/cost.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('projects/:projectId/costs')
export class CostsController {
  constructor(private readonly costsService: CostsService) {}

  @Get()
  getCosts(@Param('projectId') projectId: string) {
    return this.costsService.getCosts(projectId);
  }

  @Post()
  createCost(
    @Param('projectId') projectId: string,
    @GetUser('id') userId: string,
    @Body() dto: CreateCostDto,
  ) {
    return this.costsService.createCost(projectId, userId, dto);
  }

  @Patch(':costId/status')
  updateCostStatus(
    @Param('projectId') projectId: string,
    @Param('costId') costId: string,
    @Body() dto: UpdateCostStatusDto,
  ) {
    return this.costsService.updateCostStatus(projectId, costId, dto.status);
  }

  @Delete(':costId')
  deleteCost(
    @Param('projectId') projectId: string,
    @Param('costId') costId: string,
  ) {
    return this.costsService.deleteCost(projectId, costId);
  }
}
