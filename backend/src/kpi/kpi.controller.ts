import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { KpiService } from './kpi.service';
import { CreateKpiDto } from './dto/create-kpi.dto';
import { LogKpiDto } from './dto/log-kpi.dto';
import { Req } from '@nestjs/common';

@UseGuards(JwtAuthGuard)
@Controller('kpis')
export class KpiController {
  constructor(private readonly kpiService: KpiService) {}

  // ========================
  // PERSONAL KPI
  // ========================

  @Post('personal')
  createPersonal(@Req() req: any, @Body() dto: CreateKpiDto) {
    return this.kpiService.createPersonalKpi(req.user.id, dto);
  }

  @Get('personal')
  getMyKpis(@Req() req: any) {
    return this.kpiService.getMyPersonalKpis(req.user.id);
  }

  @Post(':id/log')
  logKpi(
    @Req() req: any,
    @Param('id', ParseIntPipe) kpiId: number,
    @Body() dto: LogKpiDto,
  ) {
    return this.kpiService.logPersonalTasks(
      req.user.id,
      kpiId,
      dto.taskIds,
      dto.completed,
    );
  }
}
