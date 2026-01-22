import { Module } from '@nestjs/common';
import { KpiService } from './kpi.service';
import { KpiController } from './kpi.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [KpiService, PrismaService],
  controllers: [KpiController]
})
export class KpiModule {}
