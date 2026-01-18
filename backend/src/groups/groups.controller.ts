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

@UseGuards(JwtAuthGuard)
@Controller('groups')
export class GroupsController {
  constructor(private svc: GroupsService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateGroupDto) {
    return this.svc.createGroup(req.user.id, dto);
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
}
