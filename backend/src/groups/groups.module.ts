import { Module } from '@nestjs/common';
import { GroupsService } from './groups.service.js';
import { GroupsController } from './groups.controller.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ActivityModule } from '../activity/activity.module.js';


@Module({
  imports: [ActivityModule],
  providers: [GroupsService, PrismaService],
  controllers: [GroupsController],
  exports: [GroupsService],
})
export class GroupsModule {}
