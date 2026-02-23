import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { ActivityService } from './activity.service.js';

@UseGuards(JwtAuthGuard)
@Controller('activities')
export class ActivityController {
  constructor(private activityService: ActivityService) {}

  @Get('feed')
  getUserFeed(@Req() req: any) {
    return this.activityService.getUserFeed(req.user.id);
  }

  @Get('user/:userId')
  getUserActivities(@Param('userId', ParseIntPipe) userId: number) {
    return this.activityService.getUserActivities(userId);
  }

  @Get('group/:groupId')
  getGroupFeed(@Param('groupId', ParseIntPipe) groupId: number) {
    return this.activityService.getGroupFeed(groupId);
  }

  @Get('type/:type')
  getActivitiesByType(@Param('type') type: string) {
    return this.activityService.getActivitiesByType(type as any);
  }
}