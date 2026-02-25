import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { GroupsService } from './groups.service.js';
import { CreateGroupDto } from './dto/create-group.dto.js';
import { JoinGroupDto } from './dto/join-group.dto.js';
import { CreateKpiDto } from './dto/create-group-kpi.dto.js';
import { LogKpiDto } from './dto/log-group-kpi.dto.js';

@UseGuards(JwtAuthGuard)
@Controller('groups')
export class GroupsController {
  constructor(private svc: GroupsService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateGroupDto) {
    return this.svc.createGroup(req.user.id, dto);
  }

  @Get('my')
  async getMyGroups(@Req() req: any) {
    const userId = req.user.id;
    return this.svc.getMyGroups(userId);
  }

  @Get(':groupId')
  getGroupDashboard(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Req() req: any,
  ) {
    return this.svc.getGroupDashboard(groupId, req.user.id);
  }

  @Post('join')
  join(@Req() req: any, @Body() dto: JoinGroupDto) {
    return this.svc.joinGroup(req.user.id, dto.groupId);
  }

  @Post('leave')
  leave(@Req() req: any, @Body() dto: JoinGroupDto) {
    return this.svc.leaveGroup(req.user.id, dto.groupId);
  }

  @Get(':groupId/leaderboard/:kpiId')
  leaderboard(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('kpiId', ParseIntPipe) kpiId: number,
  ) {
    return this.svc.groupLeaderboard(groupId, kpiId);
  }

  @Post(':groupId/members/:userId')
  addMember(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Req() req: any,
  ) {
    return this.svc.addMember(groupId, req.user.id, userId);
  }

  @Delete(':groupId/members/:userId')
  removeMember(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Req() req: any,
  ) {
    return this.svc.removeMember(groupId, req.user.id, userId);
  }

  @Post(':groupId/transfer-admin/:userId')
  transferAdmin(
    @Req() req: any,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('userId', ParseIntPipe) newAdminId: number,
  ) {
    return this.svc.transferAdmin(req.user.id, groupId, newAdminId);
  }

  @Post(':groupId/create-kpi')
  createGroupKpi(
    @Req() req: any,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Body() dto: CreateKpiDto,
  ) {
    return this.svc.createGroupKpi(req.user.id, groupId, dto);
  }

  @Post(':groupId/:kpiId/log')
  logGroupKpi(
    @Req() req: any,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('kpiId', ParseIntPipe) kpiId: number,
    @Body() dto: LogKpiDto,
  ) {
    return this.svc.logGroupTasks(
      req.user.id,
      groupId,
      kpiId,
      dto.taskIds,
      dto.completed,
    );
  }

  @Get(':groupId/kpis/:kpiId')
  async getGroupKpiById(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('kpiId', ParseIntPipe) kpiId: number,
    @Req() req: any,
  ) {
    return this.svc.getGroupKpiById(groupId, kpiId, req.user.id);
  }

  @Get(':groupId/members')
  async getGroupMembers(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Req() req: any,
  ) {
    return this.svc.getGroupMembers(groupId, req.user.id);
  }

  @Get('groups')
  async searchGroups(@Query('q') query: string, @Req() req: any) {
    return this.svc.searchGroups(query, req.user.id);
  }
}
