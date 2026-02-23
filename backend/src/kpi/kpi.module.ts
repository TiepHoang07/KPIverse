import { Module } from '@nestjs/common';
import { KpiService } from './kpi.service.js';
import { KpiController } from './kpi.controller.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ActivityModule } from '../activity/activity.module.js';

@Module({
  imports: [ActivityModule],
  providers: [KpiService, PrismaService],
  controllers: [KpiController],
  exports: [KpiService],
})
export class KpiModule {}
