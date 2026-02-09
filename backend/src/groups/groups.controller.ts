import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { JoinGroupDto } from './dto/join-group.dto';
import { CreateKpiDto } from './dto/create-group-kpi.dto';
import { LogKpiDto } from './dto/log-group-kpi.dto';

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
  getGroupDashboard(@Param('groupId', ParseIntPipe) groupId: number, @Req() req:any) {
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

  @Get(':id/leaderboard')
  leaderboard(@Param('id') id: string) {
    return this.svc.groupLeaderboard(Number(id));
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
    @Param('groupId') groupId: number,
    @Body() dto: CreateKpiDto,
  ) {
    return this.svc.createGroupKpi(
      req.user.id,
      groupId,
      dto,
    );
  }

  @Post(':groupId/:kpiId/log')
  logGroupKpi(
    @Req() req: any,
    @Param('groupId') groupId: number,
    @Param('kpiId') kpiId: number,
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
}
