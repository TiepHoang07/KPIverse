import { Module } from '@nestjs/common';
import { ActivityService } from './activity.service.js';
import { ActivityController } from './activity.controller.js';
import { PrismaService } from '..//prisma/prisma.service.js';

@Module({
  providers: [ActivityService, PrismaService],
  controllers: [ActivityController],
  exports: [ActivityService],
})
export class ActivityModule {}
