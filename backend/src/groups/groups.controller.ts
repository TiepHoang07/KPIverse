import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
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
  join(@Req() req:any, @Body() dto:JoinGroupDto) {
    return this.svc.joinGroup(req.user.id, dto.groupId);
  }

  @Get(':id/leaderboard')
  leaderboard(@Param('id') id:string) {
    return this.svc.groupLeaderboard(Number(id));
  }
}
