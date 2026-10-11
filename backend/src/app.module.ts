import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { MembersModule } from './members/members.module';
import { TasksModule } from './tasks/tasks.module';
import { CostsModule } from './costs/costs.module';
import { ChatModule } from './chat/chat.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ProjectsModule,
    MembersModule,
    TasksModule,
    CostsModule,
    ChatModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
