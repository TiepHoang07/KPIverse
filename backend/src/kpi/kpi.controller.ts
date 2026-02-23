import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
  Delete,
  Patch,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { KpiService } from './kpi.service.js';
import { CreateKpiDto } from './dto/create-kpi.dto.js';
import { LogKpiDto } from './dto/log-kpi.dto.js';
import { Req } from '@nestjs/common';

@UseGuards(JwtAuthGuard)
@Controller('kpis')
export class KpiController {
  constructor(private readonly kpiService: KpiService) {}

  @Post()
  createPersonal(@Req() req: any, @Body() dto: CreateKpiDto) {
    return this.kpiService.createPersonalKpi(req.user.id, dto);
  }

  @Get()
  getMyKpis(@Req() req: any) {
    return this.kpiService.getMyPersonalKpis(req.user.id);
  }

  @Get(':id')
  getOne(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.kpiService.getOneByUser(req.user.id, id);
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

  @Delete(':id')
  deleteKpi(@Req() req: any, @Param('id', ParseIntPipe) kpiId: number) {
    return this.kpiService.deleteKpi(req.user.id, kpiId);
  }

  @Get(':id/stats')
  getKpiStats(@Req() req: any, @Param('id', ParseIntPipe) kpiId: number) {
    return this.kpiService.getKpiStats(req.user.id, kpiId);
  }
}
