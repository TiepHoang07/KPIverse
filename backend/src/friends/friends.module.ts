import { Module } from '@nestjs/common';
import { FriendsService } from './friends.service.js';
import { FriendsController } from './friends.controller.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ActivityModule } from '../activity/activity.module.js';

@Module({
  imports: [ActivityModule],
  providers: [FriendsService, PrismaService],
  controllers: [FriendsController],
  exports: [FriendsService],
})
export class FriendsModule {}
