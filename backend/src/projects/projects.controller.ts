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
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@GetUser('id') userId: string, @Body() dto: CreateProjectDto) {
    return this.projectsService.create(userId, dto);
  }

  @Get()
  findAll(@GetUser('id') userId: string) {
    return this.projectsService.findAllForUser(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.projectsService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Body() dto: { name?: string; description?: string },
  ) {
    return this.projectsService.update(id, userId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.projectsService.remove(id, userId);
  }
}
