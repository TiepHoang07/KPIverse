import { Module } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { ActivityController } from './activity.controller';
import { PrismaClient } from '@prisma/client';

@Module({
  providers: [ActivityService, PrismaClient],
  controllers: [ActivityController]
})
export class ActivityModule {}
