import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
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
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60s window
        limit: 100, // max 100 requests per minute per IP globally
      },
    ]),
    PrismaModule,
    AuthModule,
    ProjectsModule,
    MembersModule,
    TasksModule,
    CostsModule,
    ChatModule,
    UsersModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
