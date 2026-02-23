import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaService } from './prisma/prisma.service.js';
import { AuthModule } from './auth/auth.module.js';
import { LoggerMiddleware } from './common/middleware/logger.middleware.js';
import { UsersModule } from './users/users.module.js';
import { FriendsModule } from './friends/friends.module.js';
import { GroupsModule } from './groups/groups.module.js';
import { ActivityModule } from './activity/activity.module.js';
import { KpiModule } from './kpi/kpi.module.js';

@Module({
  imports: [AuthModule, UsersModule, FriendsModule, GroupsModule, ActivityModule, KpiModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
