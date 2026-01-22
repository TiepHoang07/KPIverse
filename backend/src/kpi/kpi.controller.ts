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
    return this.kpiService.getMyKpis(req.user.id);
  }

  @Post(':id/log')
  logKpi(
    @Req() req: any,
    @Param('id', ParseIntPipe) kpiId: number,
    @Body() dto: LogKpiDto,
  ) {
    return this.kpiService.logKpi(req.user.id, kpiId, dto);
  }

  // ========================
  // GROUP KPI
  // ========================

  @Post('group/:groupId')
  createGroupKpi(
    @Req() req: any,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Body() dto: CreateKpiDto,
  ) {
    return this.kpiService.createGroupKpi(
      req.user.id,
      groupId,
      dto,
    );
  }

  @Get('group/:groupId')
  getGroupKpis(
    @Req() req: any,
    @Param('groupId', ParseIntPipe) groupId: number,
  ) {
    return this.kpiService.getGroupKpis(req.user.id, groupId);
  }

   @Post('group/log/:kpiId')
  logGroupKpi(
    @Req() req: any,
    @Param('kpiId', ParseIntPipe) kpiId: number,
    @Body() dto: LogKpiDto,
  ) {
    return this.kpiService.logGroupKpi(
      req.user.id,
      kpiId,
      dto,
    );
  }
}
